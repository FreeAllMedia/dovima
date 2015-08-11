"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _ = require("../../");

var _2 = _interopRequireDefault(_);

/**
 * Setup Model Examples
 */

/* Simple Example */

var User = (function (_Model) {
  _inherits(User, _Model);

  function User() {
    _classCallCheck(this, User);

    _get(Object.getPrototypeOf(User.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(User, [{
    key: "associate",
    value: function associate() {
      this.hasOne("address", Address);

      this.hasOne("postalCode", PostalCode).through("address");

      this.hasMany("photos", Photo);

      // this.hasMany("deletedPhotos", Photo)
      // 	.where("deletedAt", "!=", null);

      this.hasOne("primaryPhoto", Photo).where("isPrimary", true);

      this.hasMany("photoLikes", PhotoLike);
      this.hasMany("likedPhotos", Photo).through("photoLikes");

      this.hasMany("comments", Comment).through("photos");

      this.hasMany("deletedComments", Comment).through("photos").where("comments.deletedAt", "!=", null);
    }
  }, {
    key: "validate",
    value: function validate() {
      this.ensure("photos", _.isPresent);
    }
  }]);

  return User;
})(_2["default"]);

exports.User = User;

var Address = (function (_Model2) {
  _inherits(Address, _Model2);

  function Address() {
    _classCallCheck(this, Address);

    _get(Object.getPrototypeOf(Address.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(Address, [{
    key: "associate",
    value: function associate() {
      this.belongsTo("user", User);
      this.belongsTo("postalCode", PostalCode);
    }
  }, {
    key: "validate",
    value: function validate() {
      this.ensure("photos", _.isPresent);
    }
  }]);

  return Address;
})(_2["default"]);

exports.Address = Address;

var PostalCode = (function (_Model3) {
  _inherits(PostalCode, _Model3);

  function PostalCode() {
    _classCallCheck(this, PostalCode);

    _get(Object.getPrototypeOf(PostalCode.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(PostalCode, [{
    key: "associate",
    value: function associate() {
      this.hasMany("addresses");
    }
  }]);

  return PostalCode;
})(_2["default"]);

exports.PostalCode = PostalCode;

var PhotoLike = (function () {
  function PhotoLike() {
    _classCallCheck(this, PhotoLike);
  }

  _createClass(PhotoLike, [{
    key: "associate",
    value: function associate() {
      this.belongsTo("user", User);
      this.belongsTo("photo", User);
    }
  }, {
    key: "validate",
    value: function validate() {
      this.ensure("user", _.isPresent);
      this.ensure("photo", _.isPresent);
    }
  }]);

  return PhotoLike;
})();

exports.PhotoLike = PhotoLike;

var Photo = (function (_Model4) {
  _inherits(Photo, _Model4);

  function Photo() {
    _classCallCheck(this, Photo);

    _get(Object.getPrototypeOf(Photo.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(Photo, [{
    key: "associate",
    value: function associate() {
      this.belongsTo("user", User).ambiguous;

      this.hasMany("comments", Comment);

      this.hasMany("commentAuthors", User).through("comments").as("author");

      this.hasMany("photoLikes", PhotoLike);

      this.hasMany("likedByUsers", User).through("photoLikes");
    }
  }, {
    key: "validate",
    value: function validate() {
      this.ensure("user", _.isPresent);
    }
  }]);

  return Photo;
})(_2["default"]);

exports.Photo = Photo;

var Comment = (function (_Model5) {
  _inherits(Comment, _Model5);

  function Comment() {
    _classCallCheck(this, Comment);

    _get(Object.getPrototypeOf(Comment.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(Comment, [{
    key: "associate",
    value: function associate() {
      this.belongsTo("photo", Photo);
      this.belongsTo("author", User);
    }
  }]);

  return Comment;
})(_2["default"]);

exports.Comment = Comment;