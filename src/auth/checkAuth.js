"use strict";

const { includes } = require("lodash");
const ApiKeyService = require("../services/apiKey.service");
const { HEADER } = require("../constants/request");



const checkApiKeys = async (req, res, next) => {
  try {
    const key = req.headers[HEADER.API_KEY].toString();
    console.log(key);
    if (!key) {
      return res.status(403).json({
        code: 403,
        message: "Forbidden",
      });
    }
    const objKey = await ApiKeyService.findById(key);
    console.log("objectKey", objKey);
    if (!objKey) {
      return res.status(403).json({
        code: 403,
        message: "Forbidden",
      });
    }

    req.objKey = objKey;

    return next();
  } catch (error) {
    next(error);
  }
};

const checkPermission = (permission) => {
  return (req, res, next) => {
    const permissions = req?.objKey?.permissions;
    if (!permissions) {
      return res.status(403).json({
        code: 403,
        message: "Forbidden",
      });
    }

    const isValid = includes(permissions, permission);

    if (!isValid) {
      return res.status(403).json({
        code: 403,
        message: "Permission denied!",
      });
    }

    return next();
  };
};



module.exports = { checkApiKeys, checkPermission };
