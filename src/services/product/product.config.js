const PRODUCT_TYPE = require('../../constants/product')
const { Clothing, Electronics, Furniture } = require('./product.service')

module.exports = {
  [PRODUCT_TYPE.CLOTHING]: Clothing,
  [PRODUCT_TYPE.ELECTRONIC]: Electronics,
  [PRODUCT_TYPE.FURNITURE]: Furniture,
}
