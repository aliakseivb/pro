import config from "../config/config.js";

export class HttpService {

  static async request(data){
    const md = config.md;
    const params = {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        'Accept': 'application/json',
        'X-Auth': md
      },
    };
    if(data){
      if (data.params){
        params.body = JSON.stringify({action: data.action, params: data.params});
      } else {
        params.body = JSON.stringify({action: data.action});
      }
    }
    const response = await fetch(config.host, params);
    if (response.status < 200 || response.status >= 300) {
      if(response.status === 401){
        alert("Авторизуйтесь, пожалуйста");
        throw new Error(response.message);
      }
      if(response.status === 400){
        console.log("Ошибка переданных параметров, проверьте...");
        throw new Error(response.message);
      }
    }
    return await response.json();
  }
}