const bcrypt = require('bcrypt')
const crypto = require('node:crypto')
const KeyTokenService = require('./keyToken.service')

const shopModel = require('../models/shop.model')
const { createTokenPair, generateToken } = require('../auth/authUltils')
const { getInitData } = require('../utils')
const { BadRequestError, AuthFailError } = require('../core/error.response')
const ShopService = require('./shop.service')
const { includes } = require('lodash')

const ROLE = {
  SHOP: 'SHOP',
  WRITER: 'WRITER',
  EDITOR: 'EDITOR',
  ADMIN: 'ADMIN',
}
class AccessService {
  static login = async ({ email, password, refreshToken = null }) => {
    /**
     * 1. Find email is available
     * 2. Compare password
     * 3. Create Tokens and Save
     * 4. Generate Tokens
     * 5. Get Data and return Login
     */
    const foundShop = await ShopService.findEmail(email, [
      '_id',
      'name',
      'password',
      'email',
    ])

    if (!foundShop) {
      throw new BadRequestError('Shop not found!')
    }

    const matchPassword = await bcrypt.compare(password, foundShop.password)
    if (!matchPassword) {
      throw new AuthFailError('Password not match!')
    }

    const tokens = await generateToken(foundShop)

    return {
      data: foundShop,
      tokens,
    }
  }

  static logout = async keyStore => {
    return await KeyTokenService.removeKeyById(keyStore._id)
  }
  static signUp = async body => {
    const { name, email, password } = body

    const holderShop = await shopModel.findOne({ email }).lean()

    if (holderShop) {
      throw new BadRequestError('Shop already registered!')
    }
    // Password hash
    const passwordHash = await bcrypt.hash(password, 10)

    const newShop = await shopModel.create({
      name,
      email,
      password: passwordHash,
      roles: [ROLE.SHOP],
    })

    if (newShop) {
      /*/
        Can be return success CREATED  
        OR
        Sign in with sign in func
        /**/

      const publicKey = crypto.randomBytes(64).toString('hex')
      const privateKey = crypto.randomBytes(64).toString('hex')

      const keyStore = await KeyTokenService.createKeyToken({
        userId: newShop._id,
        publicKey,
        privateKey,
      })

      if (!keyStore) {
        // throw error
        return {
          code: 'xxx',
          message: 'keyStore created failed',
        }
      }

      const tokens = await createTokenPair(
        { userId: newShop._id, email, name },
        publicKey,
        privateKey,
      )

      return {
        data: getInitData({
          object: newShop,
          fields: ['_id', 'name', 'email'],
        }),
        tokens,
      }
    }

    return {
      code: 201, // CREATED success
      metadata: null,
    }
  }

  static refreshToken = async ({ refreshToken, user, keyStore }) => {
    const { userId, email } = user

    if (includes(keyStore.refreshTokenUsed, refreshToken)) {
      // Can write the code to send email for user to warning
      await KeyTokenService.removeKeyByUserId(userId)

      throw new BadRequestError('Some thing when wrong! Please login again')
    }

    if (refreshToken !== keyStore.refreshToken || !keyStore) {
      throw new AuthFailError('Invalid token!')
    }

    const foundShop = await ShopService.findEmail(email, [
      '_id',
      'name',
      'password',
      'email',
    ])

    if (!foundShop) {
      throw new BadRequestError("Shop isn't register!")
    }

    const tokens = await createTokenPair(
      { userId: foundShop._id, email: foundShop.email, name: foundShop.name },
      keyStore.publicKey,
      keyStore.privateKey,
    )

    await keyStore.updateOne({
      $set: {
        refreshToken: tokens.refreshToken,
      },
      $addToSet: {
        refreshTokenUsed: refreshToken,
      },
    })

    return {
      data: foundShop,
      tokens,
    }
  }
}

module.exports = AccessService
