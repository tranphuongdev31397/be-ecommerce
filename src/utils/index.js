'use strict'

const _ = require('lodash')

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

// const removeNullUndefinedNestedObject = obj => {
//   if (typeof obj !== 'object') {
//     return obj
//   }

//   const result = _.isArray(obj) ? [] : {}

//   _.forEach(obj, (value, key) => {
//     if (typeof value === 'object' && value !== null) {
//       const newValue = removeNullUndefinedNestedObject(value)
//       result[key] = newValue
//     } else if (!_.isUndefined(value) && !_.isNull(value)) {
//       result[key] = value
//     }
//   })

//   return result
// }

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

module.exports = {
  getInitData,
  omitData,
  getSelectData,
  getUnselectData,
  removeUndefinedAndNullNestedObject,
}
