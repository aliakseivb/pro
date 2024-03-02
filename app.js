import {Product} from "./components/product.js";
class App {
  constructor() {
    this.makePage = new Product();
    // window.addEventListener("DOMContentLoaded", this.product.init);
    this.makePage.init();
  }
}

(new App());
