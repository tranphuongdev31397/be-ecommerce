'use strict'
const moment = require('moment')
const { APPLICABLE_PRODUCTS, DISCOUNT_TYPE } = require('../constants/discount')
const {
  BadRequestError,
  NotFoundError,
  AuthFailError,
} = require('../core/error.response')
const discountModel = require('../models/discount.model')
const {
  convertToMongoObjectId,
  checkExpiredDate,
  countOccurrencesByKey,
} = require('../utils')
const {
  updateDiscountByShop,
  checkDiscountCodeIsExist,
  findAllDiscount,
} = require('../models/repositories/discount.repo')
const {
  findAllProducts,
  findManyProductsById,
} = require('../models/repositories/product.repo')
const { filter, includes, reduce, map, find } = require('lodash')

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
        shopId: payload.discount_shopId,
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

  static async applyDiscount({ products, code, shopId, userId }) {
    if (shopId === userId) {
      throw new BadRequestError("Can't use your shop's discount")
    }

    const foundDiscount = await checkDiscountCodeIsExist({
      isUpdate: false,
      isDiscountGlobal: false,
      shopId,
      discount_code: code,
    })

    const {
      discount_applies_to,
      discount_products_ids,
      discount_min_order_value,
      discount_is_active,
      discount_end_date,
      discount_start_date,
      discount_max_uses_per_user,
      discount_users_used,
      discount_max_uses,
      discount_uses_count,
      discount_type,
      discount_max_value,
      discount_value,
    } = foundDiscount || {}

    if (!foundDiscount || !discount_is_active) {
      throw new NotFoundError('Discount not exist!')
    }

    const isExpired = checkExpiredDate({
      start_date: discount_start_date,
      end_date: discount_end_date,
    })

    if (isExpired) {
      throw new BadRequestError('Discount is expired')
    }

    if (discount_uses_count >= discount_max_uses) {
      throw new BadRequestError('The number of discount codes has expired')
    }
    // Check amount use per user

    if (discount_max_uses_per_user) {
      const countUserUsed = countOccurrencesByKey(discount_users_used)

      const currentUserUsed = countUserUsed[userId]

      if (currentUserUsed >= discount_max_uses_per_user) {
        throw new BadRequestError('You have used the maximum discount code')
      }
    }

    let productsCartUpdate = [...products]

    if (discount_applies_to === APPLICABLE_PRODUCTS.SPECIFIC) {
      productsCartUpdate = filter(products, product => {
        return includes(discount_products_ids, product._id)
      })
      if (productsCartUpdate.length === 0) {
        throw new BadRequestError(
          `No products were found in the cart that could use this discount code`,
        )
      }
    }

    //Reduce total price cart
    const productsFound = await findManyProductsById({
      productIds: map(productsCartUpdate, product => product._id),
      select: ['product_price', '_id'], // get product_discount_price if have
    })
    if (productsFound.length !== productsCartUpdate.length) {
      // Have product is unpublish in cart or products not found in db
      throw new BadRequestError(
        'Something when wrong, please check again cart!',
      )
    }

    const totalOrderValue = reduce(
      productsCartUpdate,
      (prev, acc) => {
        const product = find(
          productsFound,
          item => item._id.toString() === acc._id,
        )
        return prev + product.product_price * acc.product_quantity
      },
      0,
    )

    if (totalOrderValue < discount_min_order_value) {
      throw new BadRequestError(
        'The total order value for which the discount code is applied is not enough',
      )
    }

    // Check amount discount

    let amount =
      discount_type === DISCOUNT_TYPE.FIXED_VALUE
        ? discount_value
        : totalOrderValue * (discount_value / 100)

    if (amount > discount_max_value) {
      amount = discount_max_value
    }

    // Should be update discount : discount_count_uses + 1  and push user into user_used

    const updatedDiscount = await discountModel.findOneAndUpdate(
      {
        discount_code: code,
        discount_shopId: convertToMongoObjectId(shopId),
      },
      {
        $push: {
          discount_users_used: userId,
        },
        $inc: {
          discount_uses_count: 1,
        },
      },
      {
        new: true,
      },
    )
    if (!updatedDiscount) {
      throw new BadRequestError('Apply discount failed, please try again!')
    }
    return {
      productsApplied: productsCartUpdate,
      amount,
      totalOrderValue,
      totalPrice: totalOrderValue - amount,
    }
  }

  static async cancelDiscount({ code, shopId, userId }) {
    const foundDiscount = await checkDiscountCodeIsExist({
      isUpdate: false,
      isDiscountGlobal: false,
      shopId,
      discount_code: code,
    })

    /**
     *  TODO: check again condition to cancel discount:
     *  - UserId cancel not contain in user_used ?
     *  - use count recently = 0 ?
     *  - expired should be pass cancel ?
     *  - exist discount should be pass cancel ?
     */

    if (!foundDiscount?.discount_is_active) {
      throw new NotFoundError('Discount not exist!')
    }

    const firstIndex = foundDiscount.discount_users_used.indexOf(userId)

    const updateUserUsed = [...foundDiscount.discount_users_used].slice(
      firstIndex,
      -1,
    )

    if (firstIndex === -1) {
      throw new BadRequestError('You not use discount code before')
    }

    const cancelUpdate = await discountModel.findOneAndUpdate(
      {
        discount_code: code,
        discount_shopId: convertToMongoObjectId(shopId),
      },
      {
        $set: {
          discount_users_used: updateUserUsed,
        },

        $inc: {
          discount_uses_count: -1,
        },
      },
      {
        new: true,
      },
    )

    if (!cancelUpdate) {
      throw new BadRequestError(
        'Something went wrong in the cancelation process, please try again!',
      )
    }
    return cancelUpdate
  }

  static async deleteDiscount({ id, shopId }) {
    if (!shopId) {
      throw new BadRequestError('Invalid request!')
    }

    const deletedResponse = await discountModel.findOneAndDelete({
      _id: convertToMongoObjectId(id),
      discount_shopId: convertToMongoObjectId(shopId),
    })
    if (!deletedResponse) {
      throw new NotFoundError('Discount not found to delete!')
    }
    return deletedResponse
  }
}

module.exports = DiscountService
