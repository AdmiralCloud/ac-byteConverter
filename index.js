const _ = require('lodash')

const byteConverter = function() {
  const valueMap = [
    { exp: 0, si: 'B', iec: 'b', iecExp: 1 },
    { exp: 3, si: 'kB', iec: 'KiB', iecExp: 10 },
    { exp: 6, si: 'MB', iec: 'MiB', iecExp: 20 },
    { exp: 9, si: 'GB', iec: 'GiB', iecExp: 30 },
    { exp: 12, si: 'TB', iec: 'TiB', iecExp: 40 },
    { exp: 15, si: 'PB', iec: 'PiB', iecExp: 50 },
    { exp: 18, si: 'EB', iec: 'EiB', iecExp: 60 },
    { exp: 21, si: 'ZB', iec: 'ZiB', iecExp: 70 },
    { exp: 24, si: 'YB', iec: 'YiB', iecExp: 80 }
  ]

  /**
   * Converts value into unit.
   * If unit is not given, try to determine based on power of ten
   * @param value FLOAT byte value
   */
  const format = function(value, unit, options) {
    if (_.isNil(value)) {
      return { message: 'valueRequired' }
    }

    if (!_.isNumber(value)) {
      return { message: 'valueMustBeANumber' }
    }

    // return 0 value as 0
    if (value === 0) {
      return value.toString()
    }

    if (_.isObject(unit)) {
      options = unit
      unit = null
    }

    // define default options
    options = options || {}
    if (!_.get(options, 'system')) {
      // detect system (check if there is an i)
      if (unit && _.endsWith(unit, 'iB')) {
        _.set(options, 'system', 'iec')
      }
      else {
        _.set(options, 'system', 'si')
      }
    }

    let base = 10

    if (_.get(options, 'system') === 'iec') {
      base = 2
    }

    let map

    if (!unit) {
      const autoDetectRegex = /(\d.*\+)(\d{1,2})/
      const autoDetect = value.toExponential() // 5.079899957e+9
      const expArray = autoDetect.match(autoDetectRegex)
      const exp = Math.floor(parseInt(_.get(expArray, '[2]')) / 3) * 3
      map = _.find(valueMap, { exp: exp })
      unit = _.get(map, _.get(options, 'system'))
    }
    else {
      if (_.get(options, 'system') === 'iec') {
        map = _.find(valueMap, { iec: unit })
      }
      else {
        map = _.find(valueMap, { si: unit })
      }
    }

    if (!map) {
      return { message: 'unitInvalid' }
    }

    // convert
    let exp = _.get(map, 'exp')

    if (_.get(options, 'system') === 'iec') {
      exp = _.get(map, 'iecExp')
    }

    const divider = Math.pow(base, exp)
    value = _.round(value / divider, _.get(options, 'decimals', 2))

    return value + unit
  }

  /**
   * Ingests a "human readable" value and returns value in bytes
   * If you send a non-string value, the value is just returned
   */
  const parse = function(value, options) {
    if (_.isNil(value)) {
      return { message: 'valueRequired' }
    }

    if (_.isNumber(value)) {
      return value
    }

    if (!_.isString(value)) {
      return { message: 'valueMustBeAString' }
    }

    const regex = /([0-9.]*)(\D*)/
    const res = value.match(regex) // 1KiB
    const orgValue = _.trim(res[1])
    const unit = _.trim(res[2])

    // return zero value ('0' -> 0)
    if (_.parseInt(orgValue) === 0) {
      return _.parseInt(orgValue)
    }

    options = options || {}

    if (!_.get(options, 'system')) {
      if (_.endsWith(unit, 'iB')) {
        _.set(options, 'system', 'iec')
      }
      else {
        _.set(options, 'system', 'si')
      }
    }

    let map

    if (_.get(options, 'system') === 'iec') {
      map = _.find(valueMap, { iec: unit })
    }
    else {
      map = _.find(valueMap, { si: unit })
    }

    if (!map) {
      return { message: 'unitInvalid' }
    }

    let exp = _.get(map, 'exp')

    if (_.get(options, 'system') === 'iec') {
      exp = _.get(map, 'iecExp')
    }

    let base = 10

    if (_.get(options, 'system') === 'iec') {
      base = 2
    }

    const byteValue = orgValue * Math.pow(base, exp)

    return byteValue
  }

  return {
    format: format,
    parse: parse
  }
}

module.exports = byteConverter()
