"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = softDestroy;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _incognito = require("incognito");

var _incognito2 = _interopRequireDefault(_incognito);

function softDestroy(callback) {
  var _ = (0, _incognito2["default"])(this);
  if (_.mockDelete) {
    callback();
  } else {
    this.deletedAt = Date.now;
    this.save(callback);
  }
}

module.exports = exports["default"];