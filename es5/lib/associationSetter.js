"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ambiguous = Symbol(),
    dependent = Symbol();

var AssociationSetter = (function () {
	function AssociationSetter(association) {
		_classCallCheck(this, AssociationSetter);

		this.association = association;

		switch (association.type) {
			case "belongsTo":
				Object.defineProperties(this, {
					"ambiguous": {
						get: this[ambiguous]
					}
				});
				break;
			case "hasOne":
			case "hasMany":
				Object.defineProperties(this, {
					"dependent": {
						get: this[dependent]
					}
				});
				break;
		}
	}

	_createClass(AssociationSetter, [{
		key: "foreignName",
		value: function foreignName(name) {
			this.association.foreignName = name;
			return this;
		}
	}, {
		key: "where",
		value: function where() {
			for (var _len = arguments.length, options = Array(_len), _key = 0; _key < _len; _key++) {
				options[_key] = arguments[_key];
			}

			this.association.where = options;
			return this;
		}
	}, {
		key: "andWhere",
		value: function andWhere() {
			this.association.andWhere = this.association.andWhere || [];

			for (var _len2 = arguments.length, options = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
				options[_key2] = arguments[_key2];
			}

			this.association.andWhere.push(options);
			return this;
		}
	}, {
		key: "through",
		value: function through(associationName) {
			this.association.through = associationName;
			return this;
		}
	}, {
		key: "as",
		value: function as(associationName) {
			this.association.as = associationName;
			return this;
		}
	}, {
		key: ambiguous,
		value: function value() {
			this.association.ambiguous = true;
		}
	}, {
		key: dependent,
		value: function value() {
			this.association.dependent = true;
		}
	}]);

	return AssociationSetter;
})();

exports["default"] = AssociationSetter;
module.exports = exports["default"];