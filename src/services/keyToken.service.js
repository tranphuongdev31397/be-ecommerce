'use strict'

const { Types } = require('mongoose')
const keyTokenModel = require('../models/keyToken.model')

class KeyTokenService {
  static createKeyToken = async ({
    userId,
    publicKey,
    privateKey,
    refreshToken,
  }) => {
    try {
      const filter = { user: userId },
        update = { publicKey, privateKey, refreshToken, refreshTokenUsed: [] },
        options = { new: true, upsert: true } // 'upsert : true' is mean if findOne notFound will be create new

      const tokens = await keyTokenModel.findOneAndUpdate(
        filter,
        update,
        options,
      )

      return tokens ? tokens.publicKey : null
    } catch (error) {
      return error
    }
  }

  // Query func
  static findByUserId = async userId => {
    return await keyTokenModel.findOne({ user: new Types.ObjectId(userId) })
  }

  static removeKeyById = async keyId => {
    return await keyTokenModel.deleteOne(keyId)
  }

  static removeKeyByUserId = async userId => {
    return await keyTokenModel.deleteOne({ user: new Types.ObjectId(userId) })
  }
}

module.exports = KeyTokenService
