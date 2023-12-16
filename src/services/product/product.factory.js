const { forEach } = require('lodash')
const productTypes = require('./product.config')
const { BadRequestError } = require('../../core/error.response')
const {
  findAllProductsForShop,
  publishProduct,
  unPublishProduct,
  searchProductByUser,
  findAllProducts,
  getDetailProduct,
} = require('../../models/repositories/product.repo')
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

  static async publishProduct({ productId, product_shop }) {
    return await publishProduct({ productId, product_shop })
  }

  static async unPublishProduct({ productId, product_shop }) {
    return await unPublishProduct({ productId, product_shop })
  }

  //QUERY

  static async searchProductByUser({ keySearch, limit = 50, skip = 0 }) {
    if (!keySearch) {
      // TODO: Replace by findAllProduct
      return await findAllProductsForShop({
        query: { isPublish: true },
        limit,
        skip,
      })
    }
    return await searchProductByUser({
      keySearch: keySearch || undefined,
      limit,
      skip,
    })
  }

  static async getAllProducts({
    limit = 50,
    page = 1,
    filter = {
      isPublish: true,
      isDraft: false,
    },
    sort = 'ctime',
    select = ['product_name', 'product_price', 'product_thumb'],
  }) {
    return await findAllProducts({ limit, page, filter, sort, select })
  }

  static async getDetailProduct({ productId, unSelect = ['__v'] }) {
    return await getDetailProduct({ productId, unSelect })
  }

  static async getAllProductsForShop({ query, limit = 50, skip = 0 }) {
    // By default getProductForShop includes product draff
    return await findAllProductsForShop({ query, limit, skip })
  }

  //END QUERY
}

ProductFactory.registerProductClass()

module.exports = ProductFactory
