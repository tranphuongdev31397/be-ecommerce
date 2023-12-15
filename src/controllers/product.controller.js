'use strict'

const { Created, SuccessResponse } = require('../core/success.response')
const ProductFactory = require('../services/product/product.factory')

class ProductController {
  createProduct = async (req, res, next) => {
    const product_type = req.body.product_type
    new Created({
      message: 'Product created!',
      metadata: await ProductFactory.createProduct(product_type, {
        ...req.body,
        product_shop: req.user.userId,
      }),
    }).send(res)
  }
}

module.exports = new ProductController()
