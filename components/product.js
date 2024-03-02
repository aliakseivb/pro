import config from "../config/config.js";
import {HttpService} from "../services/http-service.js";

export class Product {
  products = null;
  sortingForm = null;
  loader = null;
  productsPlace = null;
  applyFilter = null;

  constructor() {
    this.products = null;
    this.filter = document.querySelector('.sorting__filter');
    this.sortingElements = document.querySelectorAll('.sorting__filter_body_item');
    this.sortingForm = document.querySelector('.sorting__form');
    this.input = document.querySelector('.input');
    this.searchButton = document.querySelector('.search__button');
    this.applyFilter = document.querySelector('.products__apply_filter');
    this.allApply = document.querySelector('.all');
    this.productsPlace = document.querySelector('.products__items');
    this.loader = document.querySelector('.loader');

    this.init();
    this.loaderShow();


    /**toDo слушаем фильтр*/
    if (this.filter) {
      this.filter.addEventListener('click', (e) => {
        if (e.target.classList.contains('sorting__filter_body') ||
            e.target.classList.contains('sorting__filter_body_item') ||
            e.target.classList.contains('search') ||
            e.target.classList.contains('search__button')) {
        } else {
          this.filter.classList.toggle('open');
        }
      });
    }

    /**toDo слушаем внутри фильтра*/
    this.sortingElements.forEach(elem => {
      elem.addEventListener('click', (e) => {
        e.stopPropagation()
        if (e.currentTarget.classList.contains('selected')) {
          e.currentTarget.classList.remove('selected');
          this.sortingForm.classList.remove('open');
          this.removeFromApplyFilter(e.currentTarget.dataset['name'])
        } else {
          // this.sortingElements.forEach(elem => elem.classList.remove('selected'));
          e.currentTarget.classList.add('selected');
          this.sortingForm.classList.add('open');
        }
        this.input.dataset['name'] = e.currentTarget.dataset['name'];
        this.input.placeholder = e.currentTarget.dataset['info'];
        if (!Array.from(this.sortingElements).some(elem => elem.classList.contains('selected'))) {
          this.applyFilter.innerHTML = '';
          this.allApply.classList.add('selected');
          this.applyFilter.append(this.allApply);
        }
      });
    });

    /**toDo слушаем поиск сортировки*/
    this.searchButton.addEventListener('click', (e) => {
      this.allApply.classList.remove('selected');
      this.addToApplyFilter(e.target.previousElementSibling.dataset['name']);
      this.getProducts(e.target.previousElementSibling.dataset['name']);
    });
  }

  /**toDo строим страницу со старта*/
  async init() {
    this.allApply.className = Array.from(this.sortingElements).some(item => item.classList.contains('selected')) ? 'apply_item all' : 'apply_item all selected'
    try {
      const result = await HttpService.request(config.host, 'get_ids');
      if (result) {
        this.products = result;
        this.loaderHide();
      }
    } catch (error) {
      return console.log(error);
    }
  }

  removeFromApplyFilter(key){
    Array.from(this.applyFilter.children).forEach(elem => {
      if(elem.dataset['name'] === key){
        elem.remove();
      }
    });
  }
  addToApplyFilter(txt) {
    let textForApplyElem
    config.sorting.forEach(item => {
      if (Object.keys(item)[0] === txt) {
        textForApplyElem = item[`${Object.keys(item)[0]}`]
      }
    });
    const applyElem = document.createElement('div');
    applyElem.className = 'apply_item selected';
    applyElem.dataset['name'] = txt;
    applyElem.innerHTML = `<span>${textForApplyElem}</span><div class="cross"><div class="line"></div><div class="line"></div></div>`
    if (this.applyFilter) {
      this.applyFilter.append(applyElem)
    }
  }

  getProducts() {

  }

  loaderHide() {
    this.loader.classList.remove('show');
  }

  loaderShow() {
    this.loader.classList.add('show');
  }
}