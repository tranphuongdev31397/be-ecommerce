"use strict";

const { HEADER } = require("../constants/request");
const { Created, SuccessResponse } = require("../core/success.response");
const AccessService = require("../services/access.service");

class AccessController {
  signUp = async (req, res, next) => {
    new Created({
      message: "Registered",
      metadata: await AccessService.signUp(req.body),
    }).send(res);
  };

  login = async (req, res, next) => {
    new SuccessResponse({
      message: "Login Success",
      metadata: await AccessService.login(req.body),
    }).send(res);
  };

  logout = async (req, res, next) => {
    new SuccessResponse({
      message: "Logout Success",
      metadata: await AccessService.logout(req.keyStore),
    }).send(res);
  };

  refreshToken = async (req, res, next) => {
    const refreshToken = req.refreshToken;
    const user = req.user;
    const keyStore = req?.keyStore;
    new SuccessResponse({
      message: "Verify success!",
      metadata: await AccessService.refreshToken({
        refreshToken,
        user,
        keyStore,
      }),
    }).send(res);
  };
}

module.exports = new AccessController();
