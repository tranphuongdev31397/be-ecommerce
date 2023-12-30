'use strict'

const { SuccessResponse } = require('../core/success.response')
const CartService = require('../services/cart.service')

class CartController {
  async updateCart(req, res, next) {
    const { product } = req.body || {}

    new SuccessResponse({
      message: 'Update cart success',
      metadata: await CartService.updateCart({
        userId: req.user.userId,
        product,
      }),
    }).send(res)
  }
}

module.exports = new CartController()
