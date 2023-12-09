"use strict";

const keyTokenModel = require("../models/keyToken.model");

class KeyTokenService {
  static createKeyToken = async ({ userId, publicKey, privateKey }) => {
    try {
        const tokens = await keyTokenModel.create({
          publicKey: publicKey,
          privateKey: privateKey,
          user: userId,
        });


        return tokens ? tokens : null;
    } catch (error) {
      return error;
    }
  };
}

module.exports = KeyTokenService;
