/* Component Dependencies */
import inflect from "jargon";
import AssociationSetter from "../associationSetter.js";
import Collection from "../collection.js";
import privateData from "incognito";

//private functions
function getSetterFunctionHasOne(association, privateAssociationName, privateImplicitAssociationName) {
  this[privateAssociationName] = null;

  return (newModel) => {
    if (newModel && this[privateAssociationName] !== newModel) {
      if(!(newModel instanceof Model)) {
        throw new Error("Cannot set a non model entity onto this property. It should inherit from Model");
      }

      this[privateAssociationName] = newModel;
      this[privateImplicitAssociationName] = newModel.id;

      newModel[association.foreignName] = this;
    }
  };
}

function getImplicitSetterFunctionHasOne(association, privateAssociationName, privateImplicitAssociationName) {
  this[privateAssociationName] = null;

  return (newId) => {
    //reset the association when assign associationId
    this[privateImplicitAssociationName] = newId;
    this[privateAssociationName] = null;
  };
}

function getSetterFunctionHasMany(association, privateAssociationName) {
  /* Set to null by default */
  this[privateAssociationName] = new Collection(association);

  return (newModel) => {
    if (newModel && this[privateAssociationName] !== newModel) {
      this[privateAssociationName] = newModel;
    }
  };
}

function getImplicitSetterFunctionHasMany() {
  return null;
}

function getSetterFunctionBelongsTo(association, privateAssociationName, privateImplicitAssociationName) {
  this[privateAssociationName] = null;

  return (newModel) => {
    if (newModel && this[privateAssociationName] !== newModel) {
      if(!(newModel instanceof Model)) {
        throw new Error("Cannot set a non model entity onto this property. It should inherit from Model");
      }

      this[privateAssociationName] = newModel;
      this[privateImplicitAssociationName] = newModel.id;

      const pluralForeignName = inflect(association.foreignName).plural.toString();

      if (!association.ambiguous) {
        if (newModel.hasOwnProperty(association.foreignName)) {
          newModel[association.foreignName] = this;
        } else if (newModel.hasOwnProperty(pluralForeignName)) {
          //lookup is it exist and dont add it in that case
          newModel[pluralForeignName].push(this);
        } else {
          throw new Error(`Neither "${association.foreignName}" or "${pluralForeignName}" are valid associations on "${newModel.constructor.name}"`);
        }
      }
    }
  };
}

function getImplicitSetterFunctionBelongsTo(association, privateAssociationName, privateImplicitAssociationName) {
  this[privateAssociationName] = null;

  return (newId) => {
    //reset the association when assign associationId
    this[privateImplicitAssociationName] = newId;
    this[privateAssociationName] = null;
  };
}

const getSetterFunctionByAssociationType = {
  "hasOne": getSetterFunctionHasOne,
  "hasMany": getSetterFunctionHasMany,
  "belongsTo": getSetterFunctionBelongsTo
};

const getImplicitSetterFunctionByAssociationType = {
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
export default function addAssociation (associationDetails) {
  const association = {
    parent: this,
    type: associationDetails.type,
    constructor: associationDetails.constructor
  };

  /* Default Values */

  switch(associationDetails.type) {
    case "hasOne":
    case "hasMany":
      association.foreignKey = inflect(this.constructor.name).foreignKey.toString();
      association.foreignId = inflect(association.foreignKey).camel.toString();
      break;
    case "belongsTo":
      association.foreignKey = inflect(associationDetails.name).foreignKey.toString();
      association.foreignId = inflect(association.foreignKey).camel.toString();
  }

  // TODO: AS
  association.foreignName = inflect(this.constructor.name).camel.toString();

  /* Override Values */

  const associationSetter = new AssociationSetter(association);

  /* Set private space for value to be stored internally */

  const privateAssociationName = "_" + associationDetails.name;

  const implicitAssociationName = `${associationDetails.name}Id`;
  const privateImplicitAssociationName = `_${implicitAssociationName}`;

  /* Association Setter By Type */

  let setterFunction,
    implicitSetterFunction;

  setterFunction = getSetterFunctionByAssociationType[associationDetails.type].call(this, association, privateAssociationName, privateImplicitAssociationName);
  implicitSetterFunction = getImplicitSetterFunctionByAssociationType[associationDetails.type].call(this, association, privateAssociationName, privateImplicitAssociationName);

  let newProperties = {};
  newProperties[privateAssociationName] = {
    enumerable: false,
    writable: true
  };
  newProperties[associationDetails.name] = {
    enumerable: true,
    set: setterFunction,
    get: () => {
      return this[privateAssociationName];
    }
  };
  if(implicitSetterFunction) {
    newProperties[privateImplicitAssociationName] = {
      enumerable: false,
      writable: true
    };
    newProperties[implicitAssociationName] = {
      enumerable: true,
      set: implicitSetterFunction,
      get: () => {
        return this[privateImplicitAssociationName];
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

  privateData(this).associations[associationDetails.name] = association;

  return associationSetter;
}

import Model from "./";
