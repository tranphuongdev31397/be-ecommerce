'use strict'

const express = require('express')

const router = express.Router()

const { checkApiKeys, checkPermission } = require('../auth/checkAuth')

//middleware
// check api key
router.use(checkApiKeys)
// check permission
router.use(checkPermission('0000'))

router.use('/v1/api/product', require('./product'))
router.use('/v1/api/discount', require('./discount'))
router.use('/v1/api/cart', require('./cart'))

router.use('/v1/api', require('./access'))

module.exports = router
