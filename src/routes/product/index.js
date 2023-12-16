'use strict'

const express = require('express')
const asyncHandler = require('../../helpers/asyncHandler')
const { authenticateV2 } = require('../../auth/authUltils')
const productController = require('../../controllers/product.controller')
const router = express.Router()

router.get('/search', asyncHandler(productController.searchProductByUser))

///----*---Authenticate---*---///
router.use(authenticateV2)

router.post('/create', asyncHandler(productController.createProduct))
router.get(
  '/getShopProducts',
  asyncHandler(productController.getAllProductsForShop),
)
router.get('/publish/:id', asyncHandler(productController.publicProductByShop))
router.get(
  '/unpublish/:id',
  asyncHandler(productController.unpublishProductByShop),
)

module.exports = router
