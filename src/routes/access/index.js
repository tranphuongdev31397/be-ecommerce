'use strict'

const express = require('express')
const accessController = require('../../controllers/access.controller')
const asyncHandler = require('../../helpers/asyncHandler')
const { authenticate, authenticateV2 } = require('../../auth/authUltils')
const router = express.Router()

// sign up
router.post('/shop/signup', asyncHandler(accessController.signUp))
// Login
router.post('/shop/login', asyncHandler(accessController.login))

///----*---Authenticate---*---///
router.use(authenticateV2)

router.get('/shop/refresh-token', asyncHandler(accessController.refreshToken))

router.get('/shop/logout', asyncHandler(accessController.logout))

module.exports = router
