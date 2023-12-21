'use strict'

const { Created } = require('../core/success.response')
const DiscountService = require('../services/discount.service')

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
}

module.exports = new DiscountController()
