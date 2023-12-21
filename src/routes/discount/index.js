'use strict'

const express = require('express')
const asyncHandler = require('../../helpers/asyncHandler')
const { authenticateV2 } = require('../../auth/authUltils')
const discountController = require('../../controllers/discount.controller')
const router = express.Router()

///----*---Authenticate---*---///
router.use(authenticateV2)

router.post('/create', asyncHandler(discountController.createDiscountByShop))

module.exports = router
