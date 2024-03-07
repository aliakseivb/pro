export class Card {
   static doCard(data) {
    return `<div class="product__image">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0,0,256,256" width="50px" height="50px">
              <g fill="#cecece" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt"
                 stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0"
                 font-family="none" font-weight="none" font-size="none" text-anchor="none"
                 style="mix-blend-mode: normal">
                <g transform="scale(5.12,5.12)">
                  <path
                      d="M1,3v12h48v-12zM3,17v31h44v-31zM17.5,20h15c1.38281,0 2.5,1.11719 2.5,2.5c0,1.38281 -1.11719,2.5 -2.5,2.5h-15c-1.38281,0 -2.5,-1.11719 -2.5,-2.5c0,-1.38281 1.11719,-2.5 2.5,-2.5z">
                  </path>
                </g>
              </g>
            </svg>
          </div>
          <div class="product__info">
            <div class="product__brand ${data.brand ? '' : 'none'}">${!data.brand ? '' : data.brand}</div>
            <div class="product__title">${data.product}</div>
            <div class="product__price">${data.price} <span>₽</span></div>
          </div>`;
  }
}