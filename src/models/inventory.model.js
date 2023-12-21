'use strict'

const { model, Schema, Type } = require('mongoose') // Erase if already required

const COLLECTION_NAME = 'Inventories'
const DOCUMENT_NAME = 'Inventory'

const inventorySchema = new Schema(
  {
    inventory_shopId: {
      type: Schema.Types.ObjectId,
      ref: 'Shop',
    },
    inventory_productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
    },
    inventory_stock: {
      type: Number,
      required: true,
    },
    inventory_location: {
      type: String,
      default: 'Unknown',
    },
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true,
  },
)

//Export the model
module.exports = model(DOCUMENT_NAME, inventorySchema)
