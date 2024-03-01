import {Product} from "./components/product.js";

class App {
  constructor() {
    this.product = new Product();
    window.addEventListener("DOMContentLoaded", () => {
      this.product.getProducts();
      });
    // window.addEventListener("DOMContentLoaded", this.product.getProducts);
  }
}

(new App());
