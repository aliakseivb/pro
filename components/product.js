import config from "../config/config.js";

export class Product {
  constructor() {
    this.url = config.host;
    this.products = null;
  }

  async getProducts() {
    const md = md5(`Valantis_${new Date().toLocaleDateString().split('.').reverse().join('')}`);
    const params = {
      "action": "get_items",
    }

    fetch(this.url, {
      method: 'POST',
      body: JSON.stringify(params),
      headers: {
        'Content-type': 'application/json',
        'Accept': 'application/json',
        'X-Auth': md
      },
    })
        .then((response) => response.json())
        .then((data) => this.products = data);
    console.log(this.products)
  }

}