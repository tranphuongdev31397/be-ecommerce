'use strict'

const { isEmpty } = require('lodash')
const PRODUCT_TYPE = require('../../constants/product')
const { BadRequestError } = require('../../core/error.response')
const {
  productModel,
  productClothingModel,
  productElectronicModel,
  productFurnitureModel,
} = require('../../models/product.model')
const {
  updateProductByShop,
} = require('../../models/repositories/product.repo')

const { insertInventory } = require('../../models/repositories/inventory.repo')

class ProductService {
  constructor({
    product_name,
    product_thumb,
    product_description,
    product_price,
    product_quantity,
    product_type,
    product_shop,
    product_attributes,
    product_ratings,
    product_variations,
  }) {
    this.product_name = product_name
    this.product_thumb = product_thumb
    this.product_description = product_description
    this.product_price = product_price
    this.product_quantity = product_quantity
    this.product_type = product_type
    this.product_shop = product_shop
    this.product_attributes = product_attributes
    this.product_ratings = product_ratings
    this.product_variations = product_variations
  }

  async createProduct(product_id) {
    const inventoryCreated = await insertInventory({
      productStock: this.product_quantity,
      productId: product_id,
      shopId: this.product_shop,
    })

    if (!inventoryCreated) {
      throw new BadRequestError(
        'Inventory product create failed, please try again!',
      )
    }

    const productCreated = await productModel.create({
      ...this,
      product_inventory: inventoryCreated._id,
      _id: product_id,
    })

    if (!productCreated) {
      throw new BadRequestError('Product create failed, please try again!')
    }

    return productCreated
  }

  async updateProduct({ productId, shopId, payload }) {
    return await updateProductByShop({
      payload,
      productId,
      shopId,
      model: productModel,
    })
  }
}

function generateProductTypeClass(model, productType) {
  return class extends ProductService {
    async createProduct() {
      const newProduct = await model.create({
        ...this.product_attributes,
        product_shop: this.product_shop,
      })

      if (!newProduct) {
        throw new BadRequestError(`${productType} create failed!`)
      }

      const product = await super.createProduct(newProduct._id)

      if (!product) {
        throw new BadRequestError(`Invalid product type ${productType}`)
      }

      return product
    }

    async updateProduct({ productId, shopId }) {
      //Shop can't update product's another shop

      // Find product by productId and ShopId

      if (!productId || !shopId) {
        throw new BadRequestError(
          'Invalid request, product not found or shop not found!',
        )
      }

      const objectParams = this

      if (objectParams?.product_attributes) {
        const attributeUpdate = await updateProductByShop({
          payload: objectParams.product_attributes,
          shopId,
          productId,
          model,
        })

        if (!attributeUpdate) {
          throw new BadRequestError('Product type update failed!')
        }
      }

      const productUpdated = await super.updateProduct({
        productId,
        shopId,
        payload: objectParams,
      })

      if (!productUpdated) {
        throw new BadRequestError('Product update failed!')
      }

      return productUpdated
    }
  }
}

const Clothing = generateProductTypeClass(
  productClothingModel,
  PRODUCT_TYPE.CLOTHING,
)
const Electronics = generateProductTypeClass(
  productElectronicModel,
  PRODUCT_TYPE.ELECTRONIC,
)
const Furniture = generateProductTypeClass(
  productFurnitureModel,
  PRODUCT_TYPE.FURNITURE,
)

module.exports = {
  Clothing,
  Electronics,
  Furniture,
}
