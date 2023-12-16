'use strict'

const { Types } = require('mongoose')
const { BadRequestError } = require('../../core/error.response')
const {
  productModel,
  productFurnitureModel,
  productClothingModel,
  productElectronicModel,
} = require('../product.model')

const findAllProductsForShop = ({ query, limit, skip }) => {
  return productModel
    .find(query)
    .populate('product_shop', ['name', 'email'])
    .sort({ updateAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()
    .exec()
}

const searchProductByUser = async ({ keySearch, limit, skip }) => {
  const regexSearch = new RegExp(keySearch)
  const results = await productModel
    .find(
      {
        $text: {
          $search: regexSearch,
        },
        isPublish: true,
      },
      { score: { $meta: 'textScore' } },
    )
    .sort({ score: { $meta: 'textScore' } })
    .skip(skip)
    .limit(limit)
    .lean()

  return results
}

const publishProduct = async ({ product_shop, productId }) => {
  const foundProduct = await productModel.findOne({
    product_shop: new Types.ObjectId(product_shop),
    _id: new Types.ObjectId(productId),
    isPublish: false,
  })
  if (!foundProduct) {
    throw new BadRequestError('Product not found or already published!')
  }

  const published = await foundProduct.updateOne({
    isPublish: true,
    isDraft: false,
  })

  return published
}

const unPublishProduct = async ({ product_shop, productId }) => {
  const foundProduct = await productModel.findOne({
    product_shop: new Types.ObjectId(product_shop),
    _id: new Types.ObjectId(productId),
    isPublish: true,
  })

  if (!foundProduct) {
    throw new BadRequestError('Product not found or already unpublished!')
  }

  const unPublished = await foundProduct.updateOne(
    {
      isPublish: false,
      isDraft: true,
    },
    {
      returnDocument: 'after',
    },
  )

  return unPublished
}

module.exports = {
  findAllProductsForShop,
  publishProduct,
  unPublishProduct,
  searchProductByUser,
}
