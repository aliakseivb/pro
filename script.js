import {HttpService} from "./services/http-service.js";
import config from "./config/config.js";
import {Card} from "./components/card.js";

(async function () {
  window.addEventListener('DOMContentLoaded', async () => {
    /*todo переменные сортировки*/
    const filter = document.querySelector('.sorting__filter');
    const sortingForm = document.querySelector('.sorting__form');
    let selectElements = null;
    const input = document.querySelector('.input');
    let offset = 0;
    let limit = 50;
    let scrollCount = 0;
    const searchButton = document.querySelector('.search__button');

    /*todo переменные апплай-фильтра*/
    const applyFilter = document.querySelector('.products__apply_filter');
    const allApply = document.querySelector('.all');
    let closeApplyItemBtn;

    /*todo переменные товаров*/
    const wrapper = document.querySelector('.wrapper');
    const productsItemsActive = document.querySelector('.products__items.active');
    const productsItemsPrev = document.querySelector('.products__items.prev');
    const productsItemsNext = document.querySelector('.products__items.next');
    const productsList = document.querySelector('.products__list');

    /*todo переменные пагинации*/
    let offsetArray = [0];
    let side = null;
    let flagStart = true;
    let nextStop = false;
    let flagEnd = false;
    const pagination = document.querySelector('.pagination');
    const backwardBtn = document.querySelector('.backward');
    const forwardBtn = document.querySelector('.forward');

    /*todo loader*/
    const loader = document.querySelector('.loader');
    wrapper.style.display = 'none';
    pagination.style.display = 'none';
    loader.classList.add('show');
    await getIdsWithOffset();
    await getSortingFields();

    /**toDo старт*/
    async function getIdsWithOffset(data = null, field = null) {
      if (!data) {
        try {
          /*todo получаем ids*/
          const productsIdsLimit50 = await HttpService.request({
            action: 'get_ids',
            params: {"offset": offset, "limit": limit}
          });
          if (!productsIdsLimit50.result || !productsIdsLimit50.result.length) {
            wrapper.style.display = 'block';
            const error = document.createElement('div');
            error.innerHTML = `<h1 style="margin: 50px auto; color: #f37e09; font-size: 30px">Ошибка сервера. Наши извинения! Попробуйте еще раз...</h1>`;
            wrapper.append(error);
          } else {
            await getDataToCards(productsIdsLimit50.result);
          }
        } catch (error) {
          return console.log(error);
        }
      } else {
        if (!field) {
          try {
            /*todo возвращаем количество ids если передана data*/
            const productsIds = await HttpService.request({action: 'get_ids', params: data});
            if (productsIds.result.length > 0) {
              return productsIds.result;
            }
          } catch (error) {
            return console.log(error);
          }
        } else {
          try {
            /*todo если передана data возвращаем что-то в зависимости о field*/
            const productsIds = await HttpService.request({action: data.action, params: data.params});
            if (productsIds.result.length > 0) {
              return productsIds.result;
            }
          } catch (error) {
            return console.log(error);
          }
        }
      }
    }

    /*todo перебор ids для получения 50 без повтора рекурсивно, если не добрали сразу*/
    async function extraAddArr(arr) {
      if (arr.length !== 50) {
        const tmp = await getIdsWithOffset({offset: offset + limit, limit: limit});
        const result = await HttpService.request({
          action: "get_items",
          params: {"ids": tmp}
        });
        for (let i = 0; i < result.result.length; i++) {
          offset += 1
          if (!arr.some(item => item.id === result.result[i].id)) {
            arr.push(result.result[i])
          }
          if (arr.length === 50) {
            return arr
          }
        }
        return extraAddArr(arr)
      }
    }

    /*todo перебор ids для получения 50 без повтора*/
    async function make50Array(data) {
      let arr = [];
      if (data.length < 50) {
        for (let i = 0; i < data.length - 1; i++) {
          offset += 1;
          if (!arr.some(item => item.id === data[i].id)) {
            arr.push(data[i]);
            nextStop = true;
            return arr
          }
        }
      }
      for (let i = 0; i < data.length - 1; i++) {
        offset += 1;
        if (!arr.some(item => item.id === data[i].id)) {
          arr.push(data[i]);
        }
        if (arr.length === 50) {
          return arr
        }
      }
      arr = await extraAddArr(arr);
      return arr
    }

    async function doNextPage(side) {
      offset = offsetArray.slice(-1)[0];
      const result = await getIdsWithOffset({offset: offset, limit: limit});
      await getDataToCards(result, side);
    }

    async function doPrevPage(side) {
      offset = offsetArray.slice(-4)[0];
      const result = await getIdsWithOffset({
        offset: offset,
        limit: limit
      });
      await getDataToCards(result, side);
    }

    /*todo получаем данные для карточек, строим карточки и добавляем на страницу*/
    async function getDataToCards(productsIdsArray, side = null) {
      const result = await HttpService.request({
        action: "get_items",
        params: {"ids": productsIdsArray}
      });
      if (!result.result.length) {
        wrapper.style.display = 'block';
        wrapper.innerHTML = `<h1 style="margin: 50px auto; color: #f37e09; font-size: 30px">
              Мы честно искали, но ничего не нашли! Попробуйте поменять параметры запроса</h1>`
        return
      }
      if (!side) {
        try {
          const productsArray = await make50Array(result.result);
          offsetArray.push(offset);
          productsItemsActive.innerHTML = '';
          productsArray.forEach(item => {
            const card = document.createElement('div');
            card.className = 'product__item';
            card.innerHTML = Card.doCard(item);
            productsItemsActive.append(card);
          });
          await doNextPage('right');
        } catch (error) {
          return console.log(error);
        }
      } else {
        if (side === 'left') {
          try {
            const productsArray = await make50Array(result.result);
            productsItemsPrev.innerHTML = '';
            productsArray.forEach(item => {
              const card = document.createElement('div');
              card.className = 'product__item';
              card.innerHTML = Card.doCard(item);
              productsItemsPrev.append(card);
            });
          } catch (error) {
            return console.log(error);
          }
        }
        if (side === 'right') {
          try {
            const productsArray = await make50Array(result.result);
            offsetArray.push(offset);
            productsItemsNext.innerHTML = '';
            productsArray.forEach(item => {
              const card = document.createElement('div');
              card.className = 'product__item';
              card.innerHTML = Card.doCard(item);
              productsItemsNext.append(card);
            });
          } catch (error) {
            return console.log(error);
          }
        }
      }
      loader.classList.remove('show');
      wrapper.style.display = 'block';
      pagination.style.display = 'flex';
    }

//*todo слушаем кнопки пагинации*/
    const moveBackward = async () => {
      if (flagStart || offsetArray.length <= 3) {
        return
      }
      nextStop = false;
      side = 'left';
      scrollCount -= 1;
      if (!scrollCount) {
        backwardBtn.classList.add('not-move');
      }
      offsetArray.pop();
      productsList.classList.add('moveLeft');
      backwardBtn.removeEventListener('click', moveBackward);
      forwardBtn.removeEventListener('click', moveForward);
    }
    const moveForward = async () => {
      if (flagEnd) {
        return
      }
      if (nextStop) {
        flagEnd = true;
        forwardBtn.classList.add('not-move');
      }
      flagStart = false;
      backwardBtn.classList.remove('not-move');
      side = 'right';
      scrollCount += 1;
      productsList.classList.add('moveRight');
      backwardBtn.removeEventListener('click', moveBackward);
      forwardBtn.removeEventListener('click', moveForward);
    }

    backwardBtn.addEventListener('click', moveBackward);
    forwardBtn.addEventListener('click', moveForward);

    /*todo ждем завершения анимации, подменяем innerHTML страниц пагинации и одновременно строим предыдущую или следующую страницы
    *  в зависимости от направления пролистывания*/
    productsList.addEventListener('animationend', async (animationEvent) => {
      if (animationEvent.animationName === 'left') {
        productsList.classList.remove('moveLeft');
        productsItemsNext.innerHTML = productsItemsActive.innerHTML;
        productsItemsActive.innerHTML = productsItemsPrev.innerHTML;
        setTimeout(() => {
          document.querySelector('.company').scrollIntoView({behavior: "smooth"});
        }, 300);
        if (offsetArray.length >= 4) {
          await doPrevPage('left');
        }
      }
      if (animationEvent.animationName === 'right') {
        productsList.classList.remove('moveRight');
        productsItemsPrev.innerHTML = productsItemsActive.innerHTML;
        productsItemsActive.innerHTML = productsItemsNext.innerHTML;
        setTimeout(() => {
          document.querySelector('.company').scrollIntoView({behavior: "smooth"});
        }, 300);
        await doNextPage('right');
      }
      backwardBtn.addEventListener('click', moveBackward);
      forwardBtn.addEventListener('click', moveForward);
    });


    /**toDo получаем поля для фильтра*/
    async function getSortingFields() {
      const result = await HttpService.request({action: 'get_fields'});
      if (result) {
        const fields = result.result;
        fields.forEach(item => {
          const select = document.createElement('div');
          select.className = 'sorting__filter_body_item';
          select.dataset['name'] = item;
          select.innerHTML = `<span>${item.split('')[0].toUpperCase() + item.slice(1)}</span>
          <svg class="minus" width="10.00000" height="2.000000" viewBox="0 0 6.28711 2.000000" fill="none"
               xmlns="http://www.w3.org/2000/svg">
            <path id="+" d="M0 0L6.28711 0L6.28711 1.48828L0 1.48828L0 0Z" fill="#071739" fill-opacity="1.000000"
                  fill-rule="evenodd"/>
          </svg>
          <svg class="plus" width="10.00000" height="10.000000" viewBox="0 0 10 10" fill="none"
               xmlns="http://www.w3.org/2000/svg">
            <path id="+"
                  d="M10.4355 5.80664L5.97656 5.80664L5.97656 10.1777L4.46484 10.1777L4.46484 5.80664L0 5.80664L0 4.39453L4.46484 4.39453L4.46484 0L5.97656 0L5.97656 4.39453L10.4355 4.39453L10.4355 5.80664Z"
                  fill="#BEBEBE" fill-opacity="1.000000" fill-rule="evenodd"/>
          </svg>`
          sortingForm.before(select);
        });
      }
      selectElements = document.querySelectorAll('.sorting__filter_body_item');
      allApply.className = Array.from(selectElements).some(item => item.classList.contains('selected')) ? 'apply_item all' : 'apply_item all selected'
      listenSelects();
    }

    /**toDo открытие/закрытие фильтра*/
    if (filter) {
      filter.addEventListener('click', (e) => {
        if (e.target.classList.contains('sorting__filter_body') ||
            e.target.classList.contains('sorting__filter_body_item') ||
            e.target.classList.contains('input') ||
            e.target.classList.contains('search__button') ||
            e.target.classList.contains('form__input_extra')) {
        } else {
          filter.classList.toggle('open');
        }
      });
    }

    /**toDo слушаем селекты фильтра*/
    function listenSelects() {
      selectElements.forEach(elem => {
        elem.addEventListener('click', (e) => {
          if (e.currentTarget.classList.contains('selected')) {
            e.currentTarget.classList.remove('selected');
          } else {
            selectElements.forEach(elem => {
              elem.classList.remove('selected');
              elem.dataset['name'] === e.currentTarget.dataset['name'] ? elem.classList.add('selected') : null;
            });
          }
          doApplyFilter(e.currentTarget.dataset['name']);
          let params = {action: 'get_fields', params: {field: e.currentTarget.dataset['name']}};

          // const res = getIdsWithOffset(params, params.action);

          e.stopPropagation();
          /**toDo добавляем в applyFilter элемент*/
          sortingForm.classList.add('open');
          input.value = '';
          input.dataset['name'] = e.currentTarget.dataset['name'];
          input.placeholder = e.currentTarget.dataset['name'].split('')[0].toUpperCase() + e.currentTarget.dataset['name'].slice(1) + ' ...';
          if (!Array.from(selectElements).filter(elem => elem.classList.contains('selected')).length) {
            applyFilter.innerHTML = '';
            allApply.classList.add('selected');
            applyFilter.append(allApply);
          }
          input.focus();
        });
      });
    }

    /**toDo слушаем клик кнопки сортировки*/
    searchButton.addEventListener('click', async (e) => {
      if (input) {
        if (!input.value) {
          alert('Укажите параметр (название товара/цена/брэнд');
          return
        }
        let params = {action: 'filter', params: {offset: offset, limit: limit}};
        switch (input.dataset['name']) {
          case 'product':
            params.params.product = input.value;
            break
          case 'price':
            params.params.price = input.value;
            break
          case 'brand':
            params.params.brand = input.value;
            break
        }

        // const result = await getIdsWithOffset(params, params.action);

        sortingForm.classList.remove('open');
        filter.classList.toggle('open');
        input.value = '';
        input.dataset['name'] = '';
      }
    });

    //*todo работаем с аппдай-фильтром*/
    function doApplyFilter(key) {
      const elemYetInApplyFilter = Array.from(applyFilter.children).find(elem => elem.dataset['name'] === key);
      if (elemYetInApplyFilter) {
        elemYetInApplyFilter.remove();
        allApply.classList.add('selected');
      } else {
        applyFilter.innerHTML = '';
        let textForApplyElem
        config.sorting.forEach(item => {
          if (Object.keys(item)[0].toLowerCase() === key) {
            textForApplyElem = item[`${Object.keys(item)[0]}`]
          }
        });
        const applyElem = document.createElement('div');
        applyElem.className = 'apply_item selected';
        applyElem.dataset['name'] = key;
        applyElem.innerHTML = `<span>${textForApplyElem}</span><div class="cross"><div class="line"></div><div class="line"></div></div>`
        if (applyFilter) {
          applyFilter.append(applyElem);
          allApply.classList.remove('selected');
        }
        closeApplyItemBtn = document.querySelector('.cross');
        closeApplyItemBtn.addEventListener('click', removeFromApplyFilter);
      }
    }

    //*toDo слушаем закрытие апплай-элемента по нажатии на cross*/
    const removeFromApplyFilter = () => {
      const elemYetSelected = Array.from(applyFilter.children).find(elem => elem.classList.contains('selected'));
      elemYetSelected.remove();
      Array.from(selectElements).find(elem => elem.dataset['name'] === elemYetSelected.dataset['name']).classList.remove('selected');
      allApply.classList.add('selected');
      applyFilter.append(allApply);
      closeApplyItemBtn.removeEventListener('click', removeFromApplyFilter);
      filter.classList.remove('open');
      sortingForm.classList.remove('open');
      offset = 0;
      getIdsWithOffset();
      loader.classList.add('show');
    }
  });
})();