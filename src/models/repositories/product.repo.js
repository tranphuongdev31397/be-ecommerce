'use strict'

const { Types } = require('mongoose')
const { BadRequestError } = require('../../core/error.response')
const { productModel } = require('../product.model')
const {
  getSelectData,
  getUnselectData,
  convertToMongoObjectId,
} = require('../../utils')
const { map } = require('lodash')

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

const findAllProducts = async ({ limit, page, sort, filter, select }) => {
  const skip = (page - 1) * limit
  const sortBy = sort === 'ctime' ? { _id: -1 } : { _id: 1 }
  return productModel
    .find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(getSelectData(select))
    .lean()
}

const findManyProductsById = async ({
  productIds,
  select,
  isPublish = true,
}) => {
  const productObjectIds = map(productIds, ids => convertToMongoObjectId(ids))
  return await productModel
    .find({
      isPublish: isPublish,
      _id: {
        $in: productObjectIds,
      },
    })
    .select(getSelectData(select))
    .lean()
}

const getDetailProduct = async ({ productId, unSelect }) => {
  return productModel
    .findOne({
      _id: new Types.ObjectId(productId),
      isPublish: true,
      isDraft: false,
    })
    .select(getUnselectData(unSelect))
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

const updateProductByShop = async ({
  productId,
  shopId,
  payload,
  isNew = true,
  model,
  options = {},
}) => {
  const res = await model.findOneAndUpdate(
    {
      _id: new Types.ObjectId(productId),
      product_shop: new Types.ObjectId(shopId),
    },
    payload,
    { new: isNew, ...options },
  )

  return res
}

module.exports = {
  findAllProductsForShop,
  publishProduct,
  unPublishProduct,
  searchProductByUser,
  findAllProducts,
  getDetailProduct,
  updateProductByShop,
  findManyProductsById,
}
