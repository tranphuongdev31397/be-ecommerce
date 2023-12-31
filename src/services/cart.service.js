'use strict'

const { find } = require('lodash')
const { BadRequestError, NotFoundError } = require('../core/error.response')
const cartModel = require('../models/cart.model')
const { getDetailProduct } = require('../models/repositories/product.repo')
const shopModel = require('../models/shop.model')
const { convertToMongoObjectId } = require('../utils')

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
        $inc: {
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

    return cartUpdated
  }

  static async addProductToCart({ product, userId }) {
    return await cartModel.findOneAndUpdate(
      {
        cart_userId: convertToMongoObjectId(userId),
      },
      {
        $push: {
          cart_products: product,
        },
      },
      {
        new: true,
      },
    )
  }

  static async removeProductFromCart({ userId, productId }) {
    return await cartModel.findOneAndUpdate(
      {
        cart_userId: convertToMongoObjectId(userId),
      },
      {
        $pull: {
          cart_products: {
            id: productId,
          },
        },
      },
      {
        new: true,
      },
    )
  }

  static async updateCart({ userId, product, isAdd }) {
    /**
     * How to use:
     * FE send payload product:
     * {
     * id: product_id
     * quantity: quantity currently from FE
     * }
     * isAdd: if "true" quantity is equal incQuantity
     */
    // Validate

    if (product.quantity < 0) {
      throw new BadRequestError(
        "Something went wrong, quantity can't less than 0",
      )
    }

    let _cart = await cartModel
      .findOne({
        cart_userId: convertToMongoObjectId(userId),
      })
      .lean()

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

    const currentProductInCart = find(
      _cart.cart_products,
      it => product.id === it.id,
    )

    if (!currentProductInCart) {
      // Push new product in cart if product hasn't in current cart
      const result = await CartService.addProductToCart({ product, userId })

      if (!result) {
        throw new BadRequestError('Something went wrong, please try again')
      }

      return result
    }
    const incQuantity = isAdd
      ? product.quantity
      : product.quantity - currentProductInCart.quantity

    const quantityAfterUpdate = currentProductInCart.quantity + incQuantity

    if (incQuantity === 0) {
      return _cart
    }

    if (quantityAfterUpdate <= 0) {
      // Remove product
      const removeResult = await CartService.removeProductFromCart({
        userId,
        productId: product.id,
      })

      if (!removeResult) {
        throw new NotFoundError('Something went wrong, please try again!')
      }
      return removeResult
    }

    // incQuantity > 0 && product available
    return await CartService.updateQuantityProduct({
      product: {
        id: product.id,
        quantity: incQuantity,
      },
      userId,
    })
  }
}

module.exports = CartService
