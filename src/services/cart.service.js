'use strict'

const { find } = require('lodash')
const { BadRequestError, NotFoundError } = require('../core/error.response')
const cartModel = require('../models/cart.model')
const { getDetailProduct } = require('../models/repositories/product.repo')
const shopModel = require('../models/shop.model')
const {
  convertToMongoObjectId,
  getSelectData,
  getInitData,
} = require('../utils')

class CartService {
  static async createCart({ userId }) {
    const userFound = shopModel.findById(userId)
    if (!userFound) {
      throw new BadRequestError('User not found!')
    }
    return await cartModel.create({
      cart_userId: userId,
    })
  }

  static async updateQuantityProduct({ product, userCart, isAddOne }) {
    const { id, quantity } = product
    const cartUpdated = userCart.findOneAndUpdate(
      {
        'cart_products.id': id,
      },
      {
        'cart_products.$.quantity': isAddOne
          ? 1
          : 'cart_products.$.quantity' - quantity,
      },
      {
        new: true,
      },
    )

    if (!cartUpdated) {
      throw new BadRequestError('Update quantity failed!')
    }

    console.log(cartUpdated)
  }

  static async updateCart({ userId, product, isAddOne }) {
    let _cart = await cartModel.findOne({
      cart_userId: convertToMongoObjectId(userId),
    })

    if (!_cart) {
      _cart = await CartService.createCart({
        userId,
      })
    }

    const _product = await getDetailProduct({
      productId: product.id,
      isPublish: true,
    })

    if (!_product) {
      throw new NotFoundError('Product not found or not yet published!')
    }

    if (_product.product_shop.toString() === userId) {
      throw new BadRequestError("Can't buy your shop's product")
    }

    if (_cart.cart_products.length === 0) {
      return await _cart.updateOne(
        {
          cart_products: [product],
        },
        {
          new: true,
        },
      )
    } else {
      return await CartService.updateQuantityProduct({
        product,
        isAddOne,
        userCart: _cart,
      })
    }
  }
}

module.exports = CartService
