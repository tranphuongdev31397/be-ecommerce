'use strict'

const _ = require('lodash')
const { Types } = require('mongoose')

const getInitData = ({ fields = [], object = {} }) => {
  return _.pick(object, fields)
}

const omitData = ({ fields = [], object = {} }) => {
  return _.omit(object, fields)
}

const getSelectData = (selectArr = []) => {
  return Object.fromEntries(_.map(selectArr, key => [key, 1]))
}

const getUnselectData = (selectArr = []) => {
  return Object.fromEntries(_.map(selectArr, key => [key, 0]))
}

const convertToMongoObjectId = id => {
  return new Types.ObjectId(id)
}

function removeUndefinedAndNullNestedObject(obj) {
  return _.transform(obj, (result, value, key) => {
    if (_.isObject(value)) {
      // Recursively clean nested objects
      const cleanedValue = removeUndefinedAndNullNestedObject(value)
      // Omit key if value is an empty object or array
      if (!(_.isEmpty(cleanedValue) && _.isArray(value))) {
        result[key] = cleanedValue
      }
    } else if (!_.isUndefined(value) && !_.isNull(value)) {
      // Include key-value pairs if value is not undefined or null
      result[key] = value
    }
  })
}

function checkExpiredDate({ start_date, end_date }) {
  const today = moment(new Date()).unix()
  const endDate = moment(new Date(start_date)).unix()

  const startDate = moment(new Date(end_date)).unix()

  return !!(today > endDate || today < startDate)
}

function countOccurrencesByKey(array, key) {
  const counts = {}

  _.forEach(array, (value, i) => {
    const element = value?.[key] || value

    counts[element] = (counts?.[element] || 0) + 1
  })

  return counts
}

module.exports = {
  getInitData,
  omitData,
  getSelectData,
  getUnselectData,
  removeUndefinedAndNullNestedObject,
  convertToMongoObjectId,
  checkExpiredDate,
  countOccurrencesByKey,
}
