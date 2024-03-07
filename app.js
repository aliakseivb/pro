import {Product} from "./components/product.js";
class App {
  constructor() {
    this.makePage = new Product();
    window.addEventListener("DOMContentLoaded", this.makePage.init);
  }
}

(new App());
