const md = md5(`Valantis_${new Date().toLocaleDateString().split('.').reverse().join('')}`);

export default {
  host: 'https://api.valantis.store:41000/',
  md: '6b6cb1e55175afd4a78c2831ba83c4b9',
  sorting: [
    {brand: 'Отсортировано по бренду'},
    {price: 'Отсортировано по цене'},
    {product: 'Отсортировано по названию'}
  ],
  enum: {
    product: 'product',
    price: 'price',
    brand: 'brand'
  }
}