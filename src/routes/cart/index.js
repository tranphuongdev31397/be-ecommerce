'use strict'

const express = require('express')
const asyncHandler = require('../../helpers/asyncHandler')
const { authenticateV2 } = require('../../auth/authUltils')
const cartController = require('../../controllers/cart.controller')
const router = express.Router()

///----*---Authenticate---*---///
router.use(authenticateV2)

router.post('/update', asyncHandler(cartController.updateCart))

module.exports = router
