"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = softDestroy;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _incognito = require("incognito");

var _incognito2 = _interopRequireDefault(_incognito);

var _fleming = require("fleming");

var _fleming2 = _interopRequireDefault(_fleming);

function softDestroy(callback) {
  var _ = (0, _incognito2["default"])(this);
  if (_.mockDelete) {
    callback();
  } else {
    this.deletedAt = new _fleming2["default"]().toDate();
    this.save(callback);
  }
}

module.exports = exports["default"];