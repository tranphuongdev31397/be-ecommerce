"use strict";

const keyTokenModel = require("../models/keyToken.model");

class KeyTokenService {
  static createKeyToken = async ({ userId, publicKey, privateKey, refreshToken }) => {
    try {
      // const tokens = await keyTokenModel.create({
      //   publicKey: publicKey,
      //   privateKey: privateKey,
      //   user: userId,
      // });
      const filter = { _id: userId },
        update = { publicKey, privateKey, refreshToken, refreshTokenUsed: [] },
        options = { new: true, upsert: true };

      const tokens = await keyTokenModel.findOneAndUpdate(
        filter,
        update,
        options
      );

      return tokens ? tokens.publicKey : null;
    } catch (error) {
      return error;
    }
  };
}

module.exports = KeyTokenService;
