"use strict";
const JWT = require("jsonwebtoken");

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

module.exports = {
  createTokenPair,
};
