"use strict";

const { ReasonPhrases, StatusCodes } = require("../utils/httpStatusCode");

class SuccessResponse {
  constructor({
    message,
    statusCode = StatusCodes.OK,
    reasonStatus = ReasonPhrases.OK,
    metadata = {},
  }) {
    this.message = message || reasonStatus;
    this.status = statusCode;
    this.metadata = metadata;
  }

  send(res, headers = {}) {
    return res.status(this.status).json(this);
  }

  
}

class OK extends SuccessResponse {
  constructor({ message, metadata }) {
    super({
      message,
      metadata,
    });
  }
}

class Created extends SuccessResponse {
  constructor({
    message,
    statusCode = StatusCodes.CREATED,
    reasonStatus = ReasonPhrases.CREATED,
    metadata,
  }) {
    super({
      message,
      metadata,
      statusCode,
      reasonStatus,
    });
  }
}

module.exports = {
  OK,
  Created,
  SuccessResponse
};
