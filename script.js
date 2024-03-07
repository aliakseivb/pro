import {HttpService} from "./services/http-service.js";
import config from "./config/config.js";
import {Card} from "./components/card.js";

(async function () {
  window.addEventListener('DOMContentLoaded', async () => {
    /*todo переменные сортировки*/
    const filter = document.querySelector('.sorting__filter');
    // const sortingFilterBody = document.querySelector('.sorting__filter_body');
    // const selectsPlace = document.querySelector('.sorting__selects');
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

    /*todo переменные товаров*/
    const wrapper = document.querySelector('.wrapper');
    const productsItemsActive = document.querySelector('.products__items.active');
    const productsItemsPrev = document.querySelector('.products__items.prev');
    const productsItemsNext = document.querySelector('.products__items.next');
    const productsList = document.querySelector('.products__list');

    /*todo переменные пагинации*/
    let offsetArray = [0];
    let side = null;
    let flagStart = true; // при старте страницы и после сортировки устанавливается в true
    let nextStop = false;
    let flagEnd = false; // если листать далее некуда, то устанавливается в true
    const pagination = document.querySelector('.pagination');
    const backwardBtn = document.querySelector('.backward');
    const forwardBtn = document.querySelector('.forward');

    /*todo loader*/
    const loader = document.querySelector('.loader');
    wrapper.style.display = 'none';
    pagination.style.display = 'none';
    loader.classList.add('show');
    await init();
    await getSortingFields();

    /**toDo старт*/
    async function init(data = null) {
      if (!data) {
        try {
          /*todo получаем ids*/
          const productsIdsLimit100 = await HttpService.request({
            action: 'get_ids',
            params: {"offset": offset, "limit": limit}
          });
          if (!productsIdsLimit100.result || !productsIdsLimit100.result.length) {
            wrapper.style.display = 'block';
            const error = document.createElement('div');
            error.innerHTML = `<h1 style="margin: 50px auto; color: #f37e09; font-size: 30px">Ошибка сервера. Наши извинения! Попробуйте еще раз...</h1>`;
            wrapper.append(error);
          } else {
            await getDataToCards(productsIdsLimit100.result);
          }
        } catch (error) {
          return console.log(error);
        }
      } else {
        try {
          /*todo возвращаем количество ids если в init передана data*/
          const productsIds = await HttpService.request({action: 'get_ids', params: data});
          if (productsIds.result.length > 0) {
            return productsIds.result;
          }
        } catch (error) {
          return console.log(error);
        }
      }
    }

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

    /*todo перебор ids для получения 50 без повтора рекурсивно, если не добрали сразу*/
    async function extraAddArr(arr) {
      if (arr.length !== 50) {
        const tmp = await init({offset: offset + limit, limit: limit});
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
      const result = await init({offset: offset, limit: limit});
      await getDataToCards(result, side);
    }

    async function doPrevPage(side) {
      offset = offsetArray.slice(-4)[0];
      const result = await init({
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
          doNextPage('right');
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
            removeFromApplyFilter(e.currentTarget.dataset['name']);
          }
          e.stopPropagation();
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
    searchButton.addEventListener('click', (e) => {
      if (input) {
        if (!input.value) {
          return
        }
        /**toDo добавляем в applyFilter элемент, закрываем сортировку*/
        allApply.classList.remove('selected');
        if (selectElements) {
          selectElements.forEach(elem =>
              elem.dataset['name'] === e.target.previousElementSibling.dataset['name'] ? elem.classList.add('selected') : null
          )
        }
        addToApplyFilter(e.target.previousElementSibling.dataset['name']);
        input.value = '';
      }
    });

    //*todo добавляем элемент в апплай-фильтр*/
    function addToApplyFilter(key) {
      if (Array.from(applyFilter.children).find(elem => elem.dataset['name'] === key)) {
        return false
      }
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
        applyFilter.append(applyElem)
      }
      let closeApplyItemBtns = document.querySelectorAll('.cross');
      closeApplyItemBtns.forEach(elem => {
        elem.addEventListener('click', (e) => {
          e.currentTarget.parentElement.classList.remove('selected');
          removeFromApplyFilter(e.currentTarget.parentElement.dataset['name']);
        });
      });
    }

    //*toDo слушаем закрытие апплай-элемента */
    function removeFromApplyFilter(key) {
      Array.from(applyFilter.children).find(elem => elem.dataset['name'] === key).classList.remove('selected');
      Array.from(selectElements).find(elem => elem.dataset['name'] === key).classList.remove('selected');
      allApply.className = Array.from(applyFilter.children).some(item => item.classList.contains('selected')) ? 'apply_item all' : 'apply_item all selected';
      allApply.className = Array.from(selectElements).some(item => item.classList.contains('selected')) ? 'apply_item all' : 'apply_item all selected';
    }

    //*todo слушаем кнопки пагинации*/
    const moveBackward = async () => {
      if (flagStart || offsetArray.length <= 3) {
        return
      }
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
        if(offsetArray.length >=4) {
          doPrevPage('left');
        }
      }
      if (animationEvent.animationName === 'right') {
        productsList.classList.remove('moveRight');
        productsItemsPrev.innerHTML = productsItemsActive.innerHTML;
        productsItemsActive.innerHTML = productsItemsNext.innerHTML;
        setTimeout(() => {
          document.querySelector('.company').scrollIntoView({behavior: "smooth"});
        }, 300);
        doNextPage('right');
      }
      backwardBtn.addEventListener('click', moveBackward);
      forwardBtn.addEventListener('click', moveForward);
    });
  });
})();