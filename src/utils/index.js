'use strict'

const _ = require('lodash')

const getInitData = ({ fields = [], object = {} }) => {
  return _.pick(object, fields)
}

const getSelectData = (selectArr = []) => {
  return Object.fromEntries(_.map(selectArr, key => [key, 1]))
}

const getUnselectData = (selectArr = []) => {
  return Object.fromEntries(_.map(selectArr, key => [key, 0]))
}

module.exports = {
  getInitData,
  getSelectData,
  getUnselectData,
}
