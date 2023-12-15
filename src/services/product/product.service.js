'use strict'

const PRODUCT_TYPE = require('../../constants/product')
const { BadRequestError } = require('../../core/error.response')
const {
  productModel,
  productClothingModel,
  productElectronicModel,
  productFurnitureModel,
} = require('../../models/product.model')

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
  }) {
    this.product_name = product_name
    this.product_thumb = product_thumb
    this.product_description = product_description
    this.product_price = product_price
    this.product_quantity = product_quantity
    this.product_type = product_type
    this.product_shop = product_shop
    this.product_attributes = product_attributes
  }

  async createProduct(product_id) {
    return await productModel.create({
      ...this,
      _id: product_id,
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
