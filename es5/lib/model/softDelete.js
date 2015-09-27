"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = softDelete;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _flowsync = require("flowsync");

var _flowsync2 = _interopRequireDefault(_flowsync);

function softDelete(callback) {
  var _this = this;

  _flowsync2["default"].series([function (done) {
    _this.beforeDelete(done);
  }, function (done) {
    _this.softDestroy(done);
  }, function (done) {
    _this.afterDelete(done);
  }], function (errors) {
    callback(errors);
  });
}

module.exports = exports["default"];