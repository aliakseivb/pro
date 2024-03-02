import config from "../config/config.js";

export class HttpService {

  constructor() {
  }

  static async request(url, body = null){
    const params = {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        'Accept': 'application/json',
        'X-Auth': `${config.md}`
      },
    };
    if(body){
      params.body = JSON.stringify({action: body});
    }
    const response = await fetch(url, params);
    if (response.status < 200 || response.status >= 300) {
      if(response.status === 401){
        alert("Авторизуйтесь, пожалуйста");
        throw new Error(response.message);
      }
      if(response.status === 400){
        alert("Ошибка переданных параметров, проверьте...");
        throw new Error(response.message);
      }
    }
    return await response.json();
  }

}