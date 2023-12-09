"use strict";

const _ = require("lodash");

const getInitData = ({ fields = [], object = {} }) => {
  return _.pick(object, fields);
};


module.exports = {
    getInitData
}
