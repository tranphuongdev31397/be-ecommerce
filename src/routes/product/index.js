'use strict'

const express = require('express')
const asyncHandler = require('../../helpers/asyncHandler')
const { authenticateV2 } = require('../../auth/authUltils')
const productController = require('../../controllers/product.controller')
const router = express.Router()
router.get(
  '/detail/:productId',
  asyncHandler(productController.getDetailProduct),
)

router.get('/search', asyncHandler(productController.searchProductByUser))
router.get('/getAll', asyncHandler(productController.getAllProducts))

///----*---Authenticate---*---///
router.use(authenticateV2)

router.get('/publish/:id', asyncHandler(productController.publicProductByShop))
router.get(
  '/unpublish/:id',
  asyncHandler(productController.unpublishProductByShop),
)
router.get(
  '/getShopProducts',
  asyncHandler(productController.getAllProductsForShop),
)

router.post('/create', asyncHandler(productController.createProduct))
router.patch('/update', asyncHandler(productController.updateProductByShop))

module.exports = router
