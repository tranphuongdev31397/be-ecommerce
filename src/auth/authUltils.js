'use strict'
const JWT = require('jsonwebtoken')
const KeyTokenService = require('../services/keyToken.service')
const { AuthFailError, NotFoundError } = require('../core/error.response')
const crypto = require('node:crypto')
const asyncHandler = require('../helpers/asyncHandler')
const { HEADER } = require('../constants/request')

const createTokenPair = async (payload, publicToken, privateKey) => {
  try {
    const accessToken = await JWT.sign(payload, publicToken, {
      expiresIn: '3 days',
    })
    const refreshToken = await JWT.sign(payload, privateKey, {
      expiresIn: '7 days',
    })

    // Verify public Token
    if (publicToken) {
      JWT.verify(accessToken, publicToken, (err, decode) => {
        if (err) {
          console.error('error verify', err)
        } else {
          console.log('decode verify', decode)
        }
      })
    }

    return { accessToken, refreshToken }
  } catch (error) {
    console.log(error)
  }
}

const generateToken = async shop => {
  const publicKey = crypto.randomBytes(64).toString('hex')
  const privateKey = crypto.randomBytes(64).toString('hex')

  const tokens = await createTokenPair(
    { userId: shop._id, email: shop.email, name: shop.name },
    publicKey,
    privateKey,
  )

  const keyStore = await KeyTokenService.createKeyToken({
    userId: shop._id,
    refreshToken: tokens.refreshToken,
    publicKey,
    privateKey,
  })

  if (!keyStore) {
    throw new AuthFailError()
  }

  return tokens
}

const authenticate = asyncHandler(async (req, res, next) => {
  /**
   * 1. Check userId is missing ??
   * 2. Verify accessToken
   * 4. Find users in DB
   * 4. Compare keystore with user
   * 5. Save keystore in req
   */

  const userId = req.headers[HEADER.CLIENT_ID]?.toString()
  if (!userId) {
    throw new AuthFailError('Invalid request!')
  }

  // Find keyStore
  const keyStore = await KeyTokenService.findByUserId(userId)

  if (!keyStore) {
    throw new NotFoundError('Key store not found!')
  }

  //Verify token

  try {
    const token = req.headers[HEADER.AUTHORIZATION]?.toString()

    if (!token) {
      throw new AuthFailError('Authorization!')
    }

    const decodeUser = JWT.verify(token, keyStore?.publicKey)

    if (decodeUser.userId !== userId) {
      throw new AuthFailError('Invalid UserId')
    }

    req.keyStore = keyStore

    next()
  } catch (error) {
    throw error
  }
})

const authenticateV2 = asyncHandler(async (req, res, next) => {
  /**
   * 1. Decode token:
   *    Not found token => error
   *    Decode fail => error
   *    Decode success => Have info user
   *    Find Keystore => Fail => throw Error not register
   * 2. Verify token
   *    Access success =>  compare userDecoded.userId === verifyDecode.userId => Fail throw error
   *    Access Fail  => Verify Refresh
   *    Refresh fail => Token Expired
   *    Refresh Success => compare decodeToken.userId === verifyDecode.userId => Token Access expired status xxx => FE call API refresh
   *    Note: headers.authorization luôn là access token đến khi hết hạn, FE sẽ nhận được lỗi xxx và từ đó sẽ ghi đè lại token thành refresh
   * Pass all => save keyStore, userId
   */

  //Verify token
  const token = req.headers[HEADER.AUTHORIZATION]?.toString()

  if (!token) {
    throw new AuthFailError('Authorization!')
  }

  const userDecoded = await JWT.decode(token)

  if (!userDecoded) {
    throw new AuthFailError('Invalid Request')
  }

  // Find keyStore
  const keyStore = await KeyTokenService.findByUserId(userDecoded?.userId)

  const refreshToken = req.headers?.[HEADER.REFRESH_TOKEN]?.toString()
  if (!keyStore) {
    throw new AuthFailError('Key store not found')
  }

  try {
    //Verify refresh

    if (refreshToken) {
      JWT.verify(refreshToken, keyStore?.privateKey, (error, refreshDecode) => {
        if (error) {
          throw new AuthFailError('Token expired!, please login again!')
        }
        req.user = refreshDecode
        req.refreshToken = refreshToken
        req.keyStore = keyStore
        next()
        return
      })
    } else {
      //Verify Access
      JWT.verify(token, keyStore?.publicKey, (error, accessDecode) => {
        if (error) {
          throw new AuthFailError('Token expired!', 409)
        }
        req.user = accessDecode
        req.refreshToken = refreshToken
        req.keyStore = keyStore
        next()
      })
    }
  } catch (error) {
    throw error
  }
})

module.exports = {
  createTokenPair,
  generateToken,
  authenticate,
  authenticateV2,
}
