'use strict'

const { BadRequestError } = require('../../core/error.response')
const { convertToMongoObjectId, getSelectData } = require('../../utils')
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

const findAllDiscount = async ({ limit, page, sort, filter, select }) => {
  const skip = (page - 1) * limit
  const sortBy = sort === 'ctime' ? { _id: -1 } : { _id: 1 }
  return discountModel
    .find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(getSelectData(select))
    .lean()
}

const checkDiscountCodeIsExist = async ({
  discount_code,
  _id,
  shopId,
  isDiscountGlobal = false,
  isUpdate = true,
}) => {
  // Func check when update an discount

  if (!isDiscountGlobal && !shopId) {
    throw new BadRequestError(
      'This discount belongs to shop, please provide shopId!',
    )
  }

  const filter = {
    discount_code,
    discount_shopId: convertToMongoObjectId(shopId),
    _id: { $ne: convertToMongoObjectId(_id) },
  }

  if (!isUpdate) {
    delete filter._id
  }

  if (isDiscountGlobal) {
    delete filter.discount_shopId
  }

  return await discountModel.findOne(filter).lean()
}

module.exports = {
  updateDiscountByShop,
  checkDiscountCodeIsExist,
  findAllDiscount,
}
