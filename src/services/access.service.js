const bcrypt = require("bcrypt");
const crypto = require("node:crypto");
const KeyTokenService = require("./keyToken.service");

const shopModel = require("../models/shop.model");
const { createTokenPair } = require("../auth/authUltils");
const { getInitData } = require("../utils");
const { BadRequestError } = require("../core/error.response");

const ROLE = {
  SHOP: "SHOP",
  WRITER: "WRITER",
  EDITOR: "EDITOR",
  ADMIN: "ADMIN",
};
class AccessService {
  static signUp = async (body) => {
    const { name, email, password } = body;

    const holderShop = await shopModel.findOne({ email }).lean();

    if (holderShop) {
      throw new BadRequestError("Shop already registered!");
    }
    // Password hash
    const passwordHash = await bcrypt.hash(password, 10);

    const newShop = await shopModel.create({
      name,
      email,
      password: passwordHash,
      roles: [ROLE.SHOP],
    });

    if (newShop) {
      /*/
        Can be return success CREATED  
        OR
        Sign in with sign in func
        /**/

      const publicKey = crypto.randomBytes(64).toString("hex");
      const privateKey = crypto.randomBytes(64).toString("hex");

      const keyStore = await KeyTokenService.createKeyToken({
        userId: newShop._id,
        publicKey,
        privateKey,
      });

      console.log(keyStore);

      if (!keyStore) {
        // throw error
        return {
          code: "xxx",
          message: "keyStore created failed",
        };
      }

      const tokens = await createTokenPair(
        { userId: newShop._id, email, name },
        publicKey,
        privateKey
      );

      return {
        data: getInitData({
          object: newShop,
          fields: ["_id", "name", "email"],
        }),
        tokens,
      };
    }

    return {
      code: 201, // CREATED success
      metadata: null,
    };
  };
}

module.exports = AccessService;
