const { Schema, model } = require('mongoose')
const PRODUCT_TYPE = require('../constants/product')

const COLLECTION_NAME = 'Products'
const DOCUMENT_NAME = 'Product'
// Declare the Schema of the Mongo model
const productSchema = new Schema(
  {
    product_name: { type: String, required: true },
    product_thumb: { type: String, required: true },
    product_description: String,
    product_price: { type: Number, required: true },
    product_quantity: { type: Number, required: true },
    product_type: {
      type: String,
      required: true,
      enum: [
        PRODUCT_TYPE.ELECTRONIC,
        PRODUCT_TYPE.CLOTHING,
        PRODUCT_TYPE.FURNITURE,
      ],
    },
    product_shop: { type: Schema.Types.ObjectId, ref: 'Shop' },
    product_attributes: { type: Schema.Types.Mixed, required: true },
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true,
  },
)

//Define model product type

const clothingSchema = new Schema(
  {
    brand: { type: String, require: true },
    size: String,
    material: String,
    product_shop: { type: Schema.Types.ObjectId, ref: 'Shop' },
  },
  {
    collection: 'Clothings',
    timestamps: true,
  },
)

const electronicSchema = new Schema(
  {
    manufacturer: {
      type: String,
      require: true,
    },
    model: String,
    color: String,
    product_shop: { type: Schema.Types.ObjectId, ref: 'Shop' },
  },
  {
    collection: 'Electronics',
    timestamps: true,
  },
)

const furnitureSchema = new Schema(
  {
    manufacturer: {
      type: String,
      require: true,
    },
    model: String,
    color: String,
    product_shop: { type: Schema.Types.ObjectId, ref: 'Shop' },
  },
  {
    collection: 'Furnitures',
    timestamps: true,
  },
)

//Export the model
module.exports = {
  productModel: model(DOCUMENT_NAME, productSchema),
  productClothingModel: model('Clothing', clothingSchema),
  productElectronicModel: model('Electronic', electronicSchema),
  productFurnitureModel: model('Furniture', furnitureSchema),
}
