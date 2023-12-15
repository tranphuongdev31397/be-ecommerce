const { forEach } = require('lodash')
const productTypes = require('./product.config')
const { BadRequestError } = require('../../core/error.response')
class ProductFactory {
  static productRegistry = {}

  static registerProductClass() {
    forEach(productTypes, (ProductClass, type) => {
      ProductFactory.productRegistry[type] = ProductClass
    })
  }

  static async createProduct(type, payload) {
    const ProductTypeClass = ProductFactory.productRegistry[type]
    if (!ProductTypeClass) {
      throw new BadRequestError(`Invalid product type ${type}`)
    }

    return new ProductTypeClass(payload).createProduct()
  }
}

ProductFactory.registerProductClass()

module.exports = ProductFactory
