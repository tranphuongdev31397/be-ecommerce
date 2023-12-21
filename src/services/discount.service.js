'use strict'
const moment = require('moment')
const { APPLICABLE_PRODUCTS } = require('../constants/discount')
const { BadRequestError } = require('../core/error.response')
const discountModel = require('../models/discount.model')
const { convertToMongoObjectId } = require('../utils')

class DiscountService {
  static async createDiscountByShop(payload) {
    console.log('::::payload', payload)
    const {
      discount_name,
      discount_description,
      discount_type,
      discount_value,
      discount_max_value,
      discount_code,
      discount_start_date,
      discount_end_date,
      discount_uses_count,
      discount_users_used,
      discount_max_uses_per_user,
      discount_max_uses,
      discount_min_order_value,
      discount_shopId,
      discount_is_active,
      discount_applies_to,
      discount_products_ids,
    } = payload

    const today = moment(new Date()).unix()
    const endDate = moment(new Date(discount_end_date)).unix()

    console.log(endDate)
    const startDate = moment(new Date(discount_start_date)).unix()
    // Check expired

    if (endDate < today) {
      throw new BadRequestError('Discount end date must be after today!')
    }
    if (startDate > endDate) {
      throw new BadRequestError('Discount start date must be before end date!')
    }

    if (
      discount_applies_to === APPLICABLE_PRODUCTS.ALL &&
      discount_products_ids.length > 0
    ) {
      throw new BadRequestError('Product Ids should be empty!')
    }

    const foundDiscount = await discountModel.findOne({
      discount_shopId: convertToMongoObjectId(discount_shopId),
      discount_code,
    })

    if (foundDiscount && foundDiscount.discount_is_active) {
      throw new BadRequestError('Discount code is exist!')
    }

    const newDiscount = await discountModel.create({
      discount_name,
      discount_description,
      discount_type,
      discount_value,
      discount_max_value,
      discount_code,
      discount_start_date: new Date(discount_start_date),
      discount_end_date: new Date(discount_end_date),
      discount_uses_count,
      discount_users_used,
      discount_max_uses,
      discount_max_uses_per_user,
      discount_min_order_value: discount_min_order_value || 0,
      discount_shopId,
      discount_is_active,
      discount_applies_to,
      discount_products_ids:
        discount_applies_to === APPLICABLE_PRODUCTS.ALL
          ? []
          : discount_products_ids,
    })

    return newDiscount
  }
}

module.exports = DiscountService
