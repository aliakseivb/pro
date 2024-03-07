const md = md5(`Valantis_${new Date().toLocaleDateString().split('.').reverse().join('')}`);

export default {
  host: 'https://api.valantis.store:41000/',
  md: md,
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