const { model, Schema, Type } = require('mongoose') // Erase if already required

const { CART_STATES } = require('../constants/cart')

// Config
const { PENDING, ACTIVE, FAILED, COMPLETED } = CART_STATES

const COLLECTION_NAME = 'Carts'
const DOCUMENT_NAME = 'Cart'

// Schema

const cartSchema = new Schema(
  {
    cart_state: {
      type: String,
      enum: [ACTIVE, PENDING, COMPLETED, FAILED],
      default: ACTIVE,
      require: true,
    },
    cart_products: {
      type: Array,
      required: true,
      default: [],
    },
    cart_userId: {
      type: Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
    },
  },
  {
    collection: COLLECTION_NAME,
    timeseries: {
      createdAt: 'createdOn',
      updatedAt: 'modifiedOn',
    },
  },
)

module.exports = model(DOCUMENT_NAME, cartSchema)
