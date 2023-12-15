'use strict'

const express = require('express')
const asyncHandler = require('../../helpers/asyncHandler')
const { authenticateV2 } = require('../../auth/authUltils')
const productController = require('../../controllers/product.controller')
const router = express.Router()

///----*---Authenticate---*---///
router.use(authenticateV2)

router.post('/create', asyncHandler(productController.createProduct))

module.exports = router
