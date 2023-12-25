'use strict'

const { model, Schema, Type } = require('mongoose') // Erase if already required
const { DISCOUNT_TYPE, APPLICABLE_PRODUCTS } = require('../constants/discount')

const COLLECTION_NAME = 'Discounts'
const DOCUMENT_NAME = 'Discount'

const discountSchema = new Schema(
  {
    discount_name: {
      type: String,
      required: true,
    },
    discount_description: {
      type: String,
      required: true,
    },
    discount_type: {
      type: String,
      enum: [DISCOUNT_TYPE.FIXED_VALUE, DISCOUNT_TYPE.PERCENTAGE],
      default: DISCOUNT_TYPE.FIXED_VALUE,
      required: true,
    },
    discount_value: {
      type: Number,
      required: true,
    },
    discount_max_value: {
      type: Number,
      required: true,
    },
    discount_code: {
      type: String,
      required: true,
    },
    discount_start_date: {
      type: Date,
      required: true,
    },
    discount_end_date: {
      type: Date,
      required: true,
    },
    discount_max_uses: {
      type: Number,
      required: true,
      default: 20,
    },
    discount_uses_count: {
      type: Number,
      required: true,
      default: 0,
    },
    discount_users_used: {
      type: Array,
      default: [],
    },
    discount_max_uses_per_user: {
      type: Number,
      required: true,
    },
    discount_min_order_value: {
      type: Number,
      required: true,
    },
    discount_shopId: {
      type: Schema.Types.ObjectId,
      ref: 'Shop',
    },
    //Status
    discount_is_active: {
      type: Boolean,
      default: true,
    },
    discount_applies_to: {
      type: String,
      enum: [APPLICABLE_PRODUCTS.ALL, APPLICABLE_PRODUCTS.SPECIFIC],
      default: APPLICABLE_PRODUCTS.ALL,
      required: true,
    },
    discount_products_ids: {
      // If discount apply all products, this fields will be ignore
      type: Array,
      default: [],
    },
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true,
  },
)

//Export the model
module.exports = model(DOCUMENT_NAME, discountSchema)
