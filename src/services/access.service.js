const bcrypt = require("bcrypt");
const crypto = require("node:crypto");
const KeyTokenService = require("./keyToken.service");

const shopModel = require("../models/shop.model");
const { createTokenPair, generateToken } = require("../auth/authUltils");
const { getInitData } = require("../utils");
const { BadRequestError, AuthFailError } = require("../core/error.response");
const ShopService = require("./shop.service");

const ROLE = {
  SHOP: "SHOP",
  WRITER: "WRITER",
  EDITOR: "EDITOR",
  ADMIN: "ADMIN",
};
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
      "_id",
      "name",
      "password",
      "email"
    ]);

    if(!foundShop){
      throw new BadRequestError("Shop not found!")
    }

    const matchPassword = await bcrypt.compare(password, foundShop.password)
    if(!matchPassword){
      throw new AuthFailError("Password not match!")
    }

    const tokens = await generateToken(foundShop)

    return {
      data: foundShop,
      tokens
    }
  };
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
