"use strict";

const { Created } = require("../core/success.response");
const AccessService = require("../services/access.service");

class AccessController {
  signUp = async (req, res, next) => {
    new Created({
      message: "Registered",
      metadata: await AccessService.signUp(req.body),
    }).send(res);
  };

  login = async (req, res, next) => {
    new Created({
      message: "Login",
      metadata: await AccessService.login(req.body),
    }).send(res);
  };
}

module.exports = new AccessController();
