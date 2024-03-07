import config from "../config/config.js";
import {HttpService} from "../services/http-service.js";

export class Product {
  products = null;
  sortingForm = null;
  loader = null;
  productsPlace = null;
  selectsPlace = null;
  applyFilter = null;
  count = 0;

  constructor() {
    this.products = null;
    this.fields = [];
    this.filter = document.querySelector('.sorting__filter');
    this.sortingFilterBody = document.querySelector('.sorting__filter_body');
    this.selectsPlace = document.querySelector('.sorting__selects');
    this.input = document.querySelector('.input');
    // this.inputOffset = document.querySelector('.offset');
    // this.inputLimit = document.querySelector('.limit');
    this.searchButton = document.querySelector('.search__button');
    this.applyFilter = document.querySelector('.products__apply_filter');
    this.allApply = document.querySelector('.all');
    this.productsPlace = document.querySelector('.products__items');
    this.loader = document.querySelector('.loader');

    this.init();
    this.loader.classList.add('show');


    /**toDo слушаем фильтр*/
    if (this.filter) {
      this.filter.addEventListener('click', (e) => {
        if (e.target.classList.contains('sorting__filter_body') ||
            e.target.classList.contains('sorting__filter_body_item') ||
            e.target.classList.contains('input') ||
            e.target.classList.contains('search__button') ||
            e.target.classList.contains('form__input_extra') ||
            e.target.classList.contains('extra__desc') ||
            e.target.classList.contains('extra__text')) {
        } else {
          this.filter.classList.toggle('open');
        }
      });
    }


    /**toDo слушаем клик кнопки сортировки*/
    this.searchButton.addEventListener('click', (e) => {
      if (!this.input.value) {
        return
      }
      this.allApply.classList.remove('selected');
      this.addToApplyFilter(e.target.previousElementSibling.dataset['name']);
      // if (this.inputOffset && this.inputLimit){
      //
      // }
      //   this.getProducts(this.input.dataset['name'], this.input.value, this.inputOffset, this.inputLimit);
    });
  }

  /**toDo старт*/
  async init() {
    const that = this;
    try {
      const result = await HttpService.request({action: 'get_ids'});
      if (result) {
        let array = [];
        result.result.forEach(item => {
          if (array.includes(item)) {
          } else {
            array.push(item)
          }
        });
        this.products = array;
      }
    } catch (error) {
      return console.log(error);
    }

    const result = await HttpService.request({action: 'get_fields'});
    this.sortingForm = document.querySelector('.sorting__form');
    if (result) {
      this.fields = result.result;
      this.fields.forEach(item => {
        // let field = item.split('')[0].toUpperCase() + item.slice(1);
        const select = document.createElement('div');
        select.className = 'sorting__filter_body_item';
        select.dataset['name'] = item;

        select.innerHTML = `<span>${item.split('')[0].toUpperCase() + item.slice(1)}</span>
<!--              <svg class="minus" width="10.00000" height="2.000000" viewBox="0 0 6.28711 2.000000" fill="none"-->
<!--                   xmlns="http://www.w3.org/2000/svg">-->
<!--                <path id="+" d="M0 0L6.28711 0L6.28711 1.48828L0 1.48828L0 0Z" fill="#071739" fill-opacity="1.000000"-->
<!--                      fill-rule="evenodd"/>-->
<!--              </svg>-->
<!--              <svg class="plus" width="10.00000" height="10.000000" viewBox="0 0 10 10" fill="none"-->
<!--                   xmlns="http://www.w3.org/2000/svg">-->
<!--                <path id="+"-->
<!--                      d="M10.4355 5.80664L5.97656 5.80664L5.97656 10.1777L4.46484 10.1777L4.46484 5.80664L0 5.80664L0 4.39453L4.46484 4.39453L4.46484 0L5.97656 0L5.97656 4.39453L10.4355 4.39453L10.4355 5.80664Z"-->
<!--                      fill="#BEBEBE" fill-opacity="1.000000" fill-rule="evenodd"/>-->
<!--              </svg>-->`
        // this.selectsPlace.append(select);
        // this.selectsPlace.append(select);
        this.sortingForm.before(select);
      });
      // this.commonGetProducts(this.products);
    }
    console.log(that)
    that.loader.classList.remove('show');
    that.sortingElements = document.querySelectorAll('.sorting__filter_body_item');
    that.allApply.className = Array.from(this.sortingElements).some(item => item.classList.contains('selected')) ? 'apply_item all' : 'apply_item all selected'
    that.listenSelects();
  }

  //*toDo получаем все ID*/
  // async getIds(){
  //   try {
  //     const result = await HttpService.request({action: 'get_ids'});
  //     if (result) {
  //       let array = [];
  //       result.result.forEach(item => {
  //         if (array.includes(item)) {
  //         } else {
  //           array.push(item)
  //         }
  //       });
  //       this.products = array;
  //       console.log(this.products)
  //       // this.commonGetProducts(this.products);
  //     }
  //   } catch (error) {
  //     return console.log(error);
  //   }
  // }
  //*toDo получаем поля фильтра*/
  // async getFields() {
  //   this.selectsPlace.innerHTML = '';
  //   const result = await HttpService.request({action: 'get_fields'});
  //     if (result) {
  //       this.fields = result.result;
  //       console.log(this.fields) // дважды печатает
  //       this.fields.forEach(item => {
  //         // let field = item.split('')[0].toUpperCase() + item.slice(1);
  //         const select = document.createElement('div');
  //         select.className = 'sorting__filter_body_item';
  //         select.dataset['name'] = item;
  //         select.innerHTML = `<span>${item.split('')[0].toUpperCase() + item.slice(1)}</span>
  //             <svg class="minus" width="10.00000" height="2.000000" viewBox="0 0 6.28711 2.000000" fill="none"
  //                  xmlns="http://www.w3.org/2000/svg">
  //               <path id="+" d="M0 0L6.28711 0L6.28711 1.48828L0 1.48828L0 0Z" fill="#071739" fill-opacity="1.000000"
  //                     fill-rule="evenodd"/>
  //             </svg>
  //             <svg class="plus" width="10.00000" height="10.000000" viewBox="0 0 10 10" fill="none"
  //                  xmlns="http://www.w3.org/2000/svg">
  //               <path id="+"
  //                     d="M10.4355 5.80664L5.97656 5.80664L5.97656 10.1777L4.46484 10.1777L4.46484 5.80664L0 5.80664L0 4.39453L4.46484 4.39453L4.46484 0L5.97656 0L5.97656 4.39453L10.4355 4.39453L10.4355 5.80664Z"
  //                     fill="#BEBEBE" fill-opacity="1.000000" fill-rule="evenodd"/>
  //             </svg>`
  //         this.selectsPlace.append(select);
  //         // this.selectsPlace.append(select);
  //         // this.sortingForm.before(select);
  //       });
  //       // this.commonGetProducts(this.products);
  //     }
  //   this.loaderHide();
  //   this.sortingElements = document.querySelectorAll('.sorting__filter_body_item');
  //   this.allApply.className = Array.from(this.sortingElements).some(item => item.classList.contains('selected')) ? 'apply_item all' : 'apply_item all selected'
  //   this.listenSelects();
  // }

  //
  // //*todo основной метод получения товаров*/
  // commonGetProducts(productsArray){
  //   // productsArray.forEach(item, index =)
  //   // productsArray.slice()
  // }

  listenSelects() {
    /**toDo слушаем поля фильтра*/
    this.sortingElements.forEach(elem => {
      elem.addEventListener('click', (e) => {
        e.stopPropagation()
        if (e.currentTarget.classList.contains('selected')) {
          e.currentTarget.classList.remove('selected');
          // if(!Array.from(this.sortingElements).filter(item => item.classList.contains('selected')).length){
          this.sortingForm.classList.remove('open');
          // }
          this.removeFromApplyFilter(e.currentTarget.dataset['name'])
        } else {
          e.currentTarget.classList.add('selected');
          this.sortingForm.classList.add('open');
        }
        this.input.value = '';
        this.input.dataset['name'] = e.currentTarget.dataset['name'];
        this.input.placeholder = e.currentTarget.dataset['name'].split('')[0].toUpperCase() + e.currentTarget.dataset['name'].slice(1) + ' ...';
        if (!Array.from(this.sortingElements).filter(elem => elem.classList.contains('selected')).length) {
          this.applyFilter.innerHTML = '';
          this.allApply.classList.add('selected');
          this.applyFilter.append(this.allApply);
        }
      });
    });
  }

  // getProducts(action, param) {
  //   console.log(action)
  //   console.log(param)
  // }

  removeFromApplyFilter(key) {
    Array.from(this.applyFilter.children).forEach(elem => {
      if (elem.dataset['name'] === key) {
        elem.remove();
      }
    });
  }

  addToApplyFilter(key) {
    if (Array.from(this.applyFilter.children).find(elem => elem.dataset['name'] === key)) {
      return false
    }
    // let textForApplyElem
    // config.sorting.forEach(item => {
    //   if (Object.keys(item)[0].toLowerCase() === key) {
    //     textForApplyElem = item[`${Object.keys(item)[0]}`]
    //   }
    // });
    const applyElem = document.createElement('div');
    applyElem.className = 'apply_item selected';
    applyElem.dataset['name'] = key;
    applyElem.innerHTML = `<span>Отсортировано по <b>${key}</b></span><div class="cross"><div class="line"></div><div class="line"></div></div>`
    if (this.applyFilter) {
      this.applyFilter.append(applyElem)
    }
  }

  // loaderHide() {
  //   this.loader.classList.remove('show');
  // }
  //
  // loaderShow() {
  //
  // }
}