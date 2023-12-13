const { Schema, model } = require('mongoose') // Erase if already required

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
      enum: ['Electronics', 'Clothing', 'Furniture'],
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
  },
  {
    collection: 'Electronics',
    timestamps: true,
  },
)

//Export the model
module.exports = {
  productModel: model(DOCUMENT_NAME, productSchema),
  productClothingModel: model('Clothing', clothingSchema),
  productElectronicModel: model('Electronic', electronicSchema),
}
