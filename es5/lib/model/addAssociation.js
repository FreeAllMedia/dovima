/* Component Dependencies */
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = addAssociation;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _jargon = require("jargon");

var _jargon2 = _interopRequireDefault(_jargon);

var _associationSetterJs = require("../associationSetter.js");

var _associationSetterJs2 = _interopRequireDefault(_associationSetterJs);

var _collectionJs = require("../collection.js");

var _collectionJs2 = _interopRequireDefault(_collectionJs);

var _incognito = require("incognito");

var _incognito2 = _interopRequireDefault(_incognito);

//private functions

var _ = require("./");

var _2 = _interopRequireDefault(_);

function getSetterFunctionHasOne(association, privateAssociationName, privateImplicitAssociationName) {
  var _this = this;

  this[privateAssociationName] = null;

  return function (newModel) {
    if (newModel && _this[privateAssociationName] !== newModel) {
      if (!(newModel instanceof _2["default"])) {
        throw new Error("Cannot set a non model entity onto this property. It should inherit from Model");
      }

      _this[privateAssociationName] = newModel;
      _this[privateImplicitAssociationName] = newModel.id;

      newModel[association.foreignName] = _this;
    }
  };
}

function getImplicitSetterFunctionHasOne(association, privateAssociationName, privateImplicitAssociationName) {
  var _this2 = this;

  this[privateAssociationName] = null;

  return function (newId) {
    //reset the association when assign associationId
    _this2[privateImplicitAssociationName] = newId;
    _this2[privateAssociationName] = null;
  };
}

function getSetterFunctionHasMany(association, privateAssociationName) {
  var _this3 = this;

  /* Set to null by default */
  this[privateAssociationName] = new _collectionJs2["default"](association);

  return function (newModel) {
    if (newModel && _this3[privateAssociationName] !== newModel) {
      _this3[privateAssociationName] = newModel;
    }
  };
}

function getImplicitSetterFunctionHasMany() {
  return null;
}

function getSetterFunctionBelongsTo(association, privateAssociationName, privateImplicitAssociationName) {
  var _this4 = this;

  this[privateAssociationName] = null;

  return function (newModel) {
    if (newModel && _this4[privateAssociationName] !== newModel) {
      if (!(newModel instanceof _2["default"])) {
        throw new Error("Cannot set a non model entity onto this property. It should inherit from Model");
      }

      _this4[privateAssociationName] = newModel;
      _this4[privateImplicitAssociationName] = newModel.id;

      var pluralForeignName = (0, _jargon2["default"])(association.foreignName).plural.toString();

      if (!association.ambiguous) {
        if (newModel.hasOwnProperty(association.foreignName)) {
          newModel[association.foreignName] = _this4;
        } else if (newModel.hasOwnProperty(pluralForeignName)) {
          //lookup is it exist and dont add it in that case
          newModel[pluralForeignName].push(_this4);
        } else {
          throw new Error("Neither \"" + association.foreignName + "\" or \"" + pluralForeignName + "\" are valid associations on \"" + newModel.constructor.name + "\"");
        }
      }
    }
  };
}

function getImplicitSetterFunctionBelongsTo(association, privateAssociationName, privateImplicitAssociationName) {
  var _this5 = this;

  this[privateAssociationName] = null;

  return function (newId) {
    //reset the association when assign associationId
    _this5[privateImplicitAssociationName] = newId;
    _this5[privateAssociationName] = null;
  };
}

var getSetterFunctionByAssociationType = {
  "hasOne": getSetterFunctionHasOne,
  "hasMany": getSetterFunctionHasMany,
  "belongsTo": getSetterFunctionBelongsTo
};

var getImplicitSetterFunctionByAssociationType = {
  "hasOne": getImplicitSetterFunctionHasOne,
  "hasMany": getImplicitSetterFunctionHasMany,
  "belongsTo": getImplicitSetterFunctionBelongsTo
};

/**
 * @example
 * ```
 * const associationDetails = {
 *     name: "users",
 *     type: "hasMany",
 *     constructor: User
 * };
 *
 * [addAssociation](associationDetails);
 * ```
 * @method addAssociation
 * @param {Object.<String, *>} associationDetails Object containing association details in key/value pairs.
 */

function addAssociation(associationDetails) {
  var _this6 = this;

  var association = {
    parent: this,
    type: associationDetails.type,
    constructor: associationDetails.constructor
  };

  /* Default Values */

  switch (associationDetails.type) {
    case "hasOne":
    case "hasMany":
      association.foreignKey = (0, _jargon2["default"])(this.constructor.name).foreignKey.toString();
      association.foreignId = (0, _jargon2["default"])(association.foreignKey).camel.toString();
      break;
    case "belongsTo":
      association.foreignKey = (0, _jargon2["default"])(associationDetails.name).foreignKey.toString();
      association.foreignId = (0, _jargon2["default"])(association.foreignKey).camel.toString();
  }

  // TODO: AS
  association.foreignName = (0, _jargon2["default"])(this.constructor.name).camel.toString();

  /* Override Values */

  var associationSetter = new _associationSetterJs2["default"](association);

  /* Set private space for value to be stored internally */

  var privateAssociationName = "_" + associationDetails.name;

  var implicitAssociationName = associationDetails.name + "Id";
  var privateImplicitAssociationName = "_" + implicitAssociationName;

  /* Association Setter By Type */

  var setterFunction = undefined,
      implicitSetterFunction = undefined;

  setterFunction = getSetterFunctionByAssociationType[associationDetails.type].call(this, association, privateAssociationName, privateImplicitAssociationName);
  implicitSetterFunction = getImplicitSetterFunctionByAssociationType[associationDetails.type].call(this, association, privateAssociationName, privateImplicitAssociationName);

  var newProperties = {};
  newProperties[privateAssociationName] = {
    enumerable: false,
    writable: true
  };
  newProperties[associationDetails.name] = {
    enumerable: true,
    set: setterFunction,
    get: function get() {
      return _this6[privateAssociationName];
    }
  };
  if (implicitSetterFunction) {
    newProperties[privateImplicitAssociationName] = {
      enumerable: false,
      writable: true
    };
    newProperties[implicitAssociationName] = {
      enumerable: true,
      set: implicitSetterFunction,
      get: function get() {
        return _this6[privateImplicitAssociationName];
      }
    };
  }
  Object.defineProperties(this, newProperties);

  // Object.defineProperty(
  // 	this,
  // 	privateAssociationName,
  // 	{
  // 		enumerable: false,
  // 		writable: true
  // 	}
  // );

  // Object.defineProperty(
  // 	this,
  // 	associationDetails.name,
  // 	{
  // 		enumerable: true,
  // 		set: setterFunction,
  // 		get: () => {
  // 			return this[privateAssociationName];
  // 		}
  // 	}
  // );

  this[associationDetails.name] = associationDetails.value;

  (0, _incognito2["default"])(this).associations[associationDetails.name] = association;

  return associationSetter;
}

module.exports = exports["default"];