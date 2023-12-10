"use strict";
const JWT = require("jsonwebtoken");
const KeyTokenService = require("../services/keyToken.service");
const { AuthFailError } = require("../core/error.response");
const crypto = require("node:crypto");


const createTokenPair = async (payload, publicToken, privateKey) => {
  try {
    const accessToken = await JWT.sign(payload, publicToken, {
      expiresIn: "3 days",
    });
    const refreshToken = await JWT.sign(payload, privateKey, {
      expiresIn: "7 days",
    });

    // Verify public Token
    if (publicToken) {
      JWT.verify(accessToken, publicToken, (err, decode) => {
        if (err) {
          console.error("error verify", err);
        } else {
          console.log("decode verify", decode);
        }
      });
    }

    return { accessToken, refreshToken };
  } catch (error) {
    console.log(error);
  }
};

const generateToken = async (shop) => {
  const publicKey = crypto.randomBytes(64).toString("hex");
  const privateKey = crypto.randomBytes(64).toString("hex");

  const tokens = await createTokenPair(
    { userId: shop._id, email: shop.email, name: shop.name },
    publicKey,
    privateKey
  );

  const keyStore = await KeyTokenService.createKeyToken({
    userId: shop._id,
    refreshToken: tokens.refreshToken,
    publicKey,
    privateKey,
  });

  if (!keyStore) {
    throw new AuthFailError();
  }

  return tokens;
};

module.exports = {
  createTokenPair,
  generateToken
};
