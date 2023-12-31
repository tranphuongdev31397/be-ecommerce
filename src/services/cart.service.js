'use strict'

const { some } = require('lodash')
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

  static async updateQuantityProduct({ product, userId }) {
    const { id, quantity } = product

    const cartUpdated = await cartModel.findOneAndUpdate(
      {
        'cart_products.id': id,
        cart_userId: convertToMongoObjectId(userId),
      },

      {
        $set: {
          'cart_products.$.quantity': quantity,
        },
      },

      {
        new: true,
        upsert: true,
      },
    )

    if (!cartUpdated) {
      throw new BadRequestError('Update quantity failed!')
    }

    // TODO: Need delete product if quantity res <= 0
    return cartUpdated
  }

  static async updateCart({ userId, product }) {
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

    if (product.quantity <= 0) {
      return await _cart.updateOne(
        {
          $pull: {
            cart_products: {
              id: product.id,
            },
          },
        },
        {
          new: true,
        },
      )
    }

    if (!some(_cart.cart_products, it => product.id === it.id)) {
      return await _cart.updateOne(
        {
          $push: {
            cart_products: product,
          },
        },
        {
          new: true,
        },
      )
    } else {
      // Quantity > 0 && product available
      return await CartService.updateQuantityProduct({
        product,
        userId,
      })
    }
  }
}

module.exports = CartService
