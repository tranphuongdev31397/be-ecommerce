'use strict'

const { Created, SuccessResponse } = require('../core/success.response')
const DiscountService = require('../services/discount.service')
const { removeUndefinedAndNullNestedObject } = require('../utils')

class DiscountController {
  async createDiscountByShop(req, res, next) {
    new Created({
      message: 'Discount created!',
      metadata: await DiscountService.createDiscountByShop({
        ...req.body,
        discount_shopId: req.user.userId,
      }),
    }).send(res)
  }

  async updateDiscountByShop(req, res, next) {
    const cleanBody = removeUndefinedAndNullNestedObject(req.body)
    new SuccessResponse({
      message: 'Discount update success!',
      metadata: await DiscountService.updateProductByShop({
        ...cleanBody,
        discount_shopId: req.user.userId,
      }),
    }).send(res)
  }

  async getProductsShopOfDiscount(req, res, next) {
    const { _limit, _page, ...query } = req.query

    new SuccessResponse({
      metadata: await DiscountService.getProductsShopOfDiscount({
        ...query,
        limit: _limit,
        page: _page,
      }),
    }).send(res)
  }

  async getAllDiscountOfShop(req, res, next) {
    const { _limit, _page, sort, select, shopId } = req.query
    new SuccessResponse({
      metadata: await DiscountService.getAllDiscountOfShop({
        shopId,
        sort,
        select,
        // Pagination
        limit: _limit,
        page: _page,
      }),
    }).send(res)
  }

  async applyDiscountCode(req, res, next) {
    const body = req.body

    new SuccessResponse({
      message: 'Applied discount code!',
      metadata: await DiscountService.applyDiscount({
        ...body,
        userId: req.user.userId,
      }),
    }).send(res)
  }
  async cancelDiscountCode(req, res, next) {
    const body = req.body

    new SuccessResponse({
      message: 'Canceled discount code!',
      metadata: await DiscountService.cancelDiscount({
        ...body,
        userId: req.user.userId,
      }),
    }).send(res)
  }
}

module.exports = new DiscountController()
