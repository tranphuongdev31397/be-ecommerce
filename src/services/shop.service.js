"use strict";

const shopModel = require("../models/shop.model");

class ShopService {
  // Query Db service

  static findEmail = async (email, select = {}) => {
    return shopModel
      .findOne({ email })
      .select(select)
      .lean();
  };
}

module.exports = ShopService;
