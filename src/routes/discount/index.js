'use strict'

const express = require('express')
const asyncHandler = require('../../helpers/asyncHandler')
const { authenticateV2 } = require('../../auth/authUltils')
const discountController = require('../../controllers/discount.controller')
const router = express.Router()

router.get(
  '/getProductsShopOfDiscount',
  asyncHandler(discountController.getProductsShopOfDiscount),
)

router.get(
  '/getAllDiscountOfShop',
  asyncHandler(discountController.getAllDiscountOfShop),
)

///----*---Authenticate---*---///
router.use(authenticateV2)

router.post('/create', asyncHandler(discountController.createDiscountByShop))

router.patch('/update', asyncHandler(discountController.updateDiscountByShop))
router.post('/applyCode', asyncHandler(discountController.applyDiscountCode))
router.post('/cancel', asyncHandler(discountController.cancelDiscountCode))
router.delete(
  '/deleteByShop/:id',
  asyncHandler(discountController.deleteDiscountByShop),
)

module.exports = router
