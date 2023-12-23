'use strict'

const { convertToMongoObjectId } = require('../../utils')
const discountModel = require('../discount.model')

const updateDiscountByShop = async ({
  payload,
  isNew = true,
  options = {},
}) => {
  // Can't update shopId and _id of the shop
  const { _id, discount_shopId, ...resPayload } = payload

  return await discountModel.findOneAndUpdate(
    {
      _id: convertToMongoObjectId(payload._id),
      discount_shopId: convertToMongoObjectId(payload.discount_shopId),
    },
    resPayload,
    {
      new: isNew,
      ...options,
    },
  )
}

const checkDiscountCodeIsExist = async ({
  discount_code,
  _id,
  isUpdate = true,
}) => {
  // Func check when update an discount

  const filter = {
    discount_code,
    _id: { $ne: convertToMongoObjectId(_id) },
  }

  if (!isUpdate) {
    delete filter._id
  }

  return await discountModel.findOne(filter).lean()
}

module.exports = {
  updateDiscountByShop,
  checkDiscountCodeIsExist,
}
