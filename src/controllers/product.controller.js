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

  getAllProductsForShop = async (req, res, next) => {
    const { _limit, _skip, ...query } = req.query
    const { userId } = req.user
    new SuccessResponse({
      metadata: await ProductFactory.getAllProductsForShop({
        query: { ...query, product_shop: userId },
        limit: _limit,
        skip: _skip,
      }),
    }).send(res)
  }

  searchProductByUser = async (req, res, next) => {
    const { _limit, _skip, keySearch } = req.query

    new SuccessResponse({
      metadata: await ProductFactory.searchProductByUser({
        keySearch,
        limit: _limit,
        skip: _skip,
      }),
    }).send(res)
  }

  publicProductByShop = async (req, res, next) => {
    const _id = req.params.id
    const { userId } = req.user
    new SuccessResponse({
      metadata: await ProductFactory.publishProduct({
        product_shop: userId,
        productId: _id,
      }),
    }).send(res)
  }
  unpublishProductByShop = async (req, res, next) => {
    const _id = req.params.id
    const { userId } = req.user
    new SuccessResponse({
      metadata: await ProductFactory.unPublishProduct({
        product_shop: userId,
        productId: _id,
      }),
    }).send(res)
  }
}

module.exports = new ProductController()
