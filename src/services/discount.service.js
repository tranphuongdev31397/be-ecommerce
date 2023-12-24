'use strict'
const moment = require('moment')
const { APPLICABLE_PRODUCTS, DISCOUNT_TYPE } = require('../constants/discount')
const { BadRequestError, NotFoundError } = require('../core/error.response')
const discountModel = require('../models/discount.model')
const { convertToMongoObjectId } = require('../utils')
const {
  updateDiscountByShop,
  checkDiscountCodeIsExist,
  findAllDiscount,
} = require('../models/repositories/discount.repo')
const { findAllProducts } = require('../models/repositories/product.repo')

class DiscountService {
  static async createDiscountByShop(payload) {
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

    if (!discount_type) {
      throw new BadRequestError('Discount type invalid!')
    }

    const today = moment(new Date()).unix()
    const endDate = moment(new Date(discount_end_date)).unix()

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

    const foundDiscount = await discountModel
      .findOne({
        discount_shopId: convertToMongoObjectId(discount_shopId),
        discount_code,
      })
      .lean()

    if (foundDiscount) {
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

  static async updateProductByShop(payload) {
    if (!payload.discount_shopId || !payload._id) {
      throw new BadRequestError('Invalid request!')
    }

    const today = moment(new Date()).unix()
    const endDate = moment(new Date(payload.discount_end_date)).unix()

    const startDate = moment(new Date(payload.discount_start_date)).unix()
    // Check expired

    if (endDate < today) {
      throw new BadRequestError('Discount end date must be after today!')
    }
    if (startDate > endDate) {
      throw new BadRequestError('Discount start date must be before end date!')
    }

    if (payload.discount_code) {
      const isExistDiscountCode = await checkDiscountCodeIsExist({
        discount_code: payload.discount_code,
        _id: payload._id,
        isDiscountGlobal: false,
      })

      if (isExistDiscountCode) {
        throw new BadRequestError(
          'This discount code is exist, please try another code!',
        )
      }
    }

    const discountUpdated = await updateDiscountByShop({ payload })
    if (!discountUpdated) {
      throw new BadRequestError('Dícount update failed!')
    }

    return discountUpdated
  }

  static async getProductsShopOfDiscount({
    shopId,
    discountCode,
    limit = 50,
    page = 1,
    sort = 'ctime',
    select = ['product_name', 'product_price', 'product_thumb'],
  }) {
    const discountFound = await discountModel
      .findOne({
        discount_shopId: shopId,
        discount_code: discountCode,
      })
      .lean()

    if (!discountFound) {
      throw new NotFoundError('Discount not found!')
    }
    const today = moment(new Date()).unix()
    const endDate = moment(new Date(discountFound.discount_end_date)).unix()

    const startDate = moment(new Date(discountFound.discount_start_date)).unix()

    if (today > endDate || today < startDate) {
      throw new BadRequestError('Discount is expired!')
    }

    let filter = {}
    if (discountFound.discount_applies_to === APPLICABLE_PRODUCTS.ALL) {
      filter = {
        isPublish: true,
        product_shop: shopId,
      }
    } else if (
      discountFound.discount_applies_to === APPLICABLE_PRODUCTS.SPECIFIC
    ) {
      filter = {
        isPublish: true,
        product_shop: convertToMongoObjectId(shopId),
        _id: {
          $in: discountFound.discount_products_ids,
        },
      }
    }

    return await findAllProducts({
      limit,
      page,
      filter,
      sort,
      select,
    })
  }

  static async getAllDiscountOfShop({
    shopId,
    limit = 50,
    page = 1,
    sort = 'ctime',
    select = [
      'discount_code',
      'discount_name',
      'discount_description',
      'discount_min_order_value',
      'discount_type',
      'discount_applies_to',
    ],
  }) {
    const filter = {
      discount_shopId: convertToMongoObjectId(shopId),
      discount_is_active: true,
    }
    return await findAllDiscount({ limit, page, sort, filter, select })
  }
}

module.exports = DiscountService
