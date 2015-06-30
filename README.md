# Dovima.js [![npm version](https://img.shields.io/npm/v/dovima.svg)](https://www.npmjs.com/package/dovima) [![license type](https://img.shields.io/npm/l/dovima.svg)](https://github.com/FreeAllMedia/dovima.git/blob/master/LICENSE) [![npm downloads](https://img.shields.io/npm/dm/dovima.svg)](https://www.npmjs.com/package/dovima) ![ECMAScript 6 & 5](https://img.shields.io/badge/ECMAScript-6%20/%205-red.svg)

ES6 generic model with lots of useful special features like relations, validations, logical deletion, finding, typed collections, chained readable usage. It uses [almaden](https://github.com/FreeAllMedia/almaden) as the database adapter.

```javascript
//Declaring models with relationships
//On runtime you need to set the static Model.database to a valid [almaden](https://github.com/FreeAllMedia/almaden) object
import Model from "dovima";
import {isPresent} from "dovima"; //dovima-provided validation
import {isNotEmpty} from "proven"; //validation utility framework


class TruckOwner extends Model {
  associate() {
    this.belongsTo("truck", Truck);
    this.belongsTo("owner", Owner);
  }
}

class Truck extends Model {
  initialize() {
    this.softDelete;
  }

  associate() {
    this.hasMany("truckOwners");
    this.hasMany("owners", Owner)
      .through("truckOwners");
    this.hasMany("wheels", Wheel);
    this.hasOne("steeringWheel", SteeringWheel);
  }

  validate() {
    this.ensure("brand", isNotEmpty);
    this.ensure("wheels", isPresent);
    this.ensure("steeringWheel", isPresent);
  }
}

class Owner extends Model {
  associate() {
    this.hasMany("truckOwners", TruckOwner);
    this.hasMany("trucks", Truck)
      .through("truckOwners");
  }
}

class Wheel extends Model {
  associate() {
    this.belongsTo("truck", Truck);
  }
  save(callback) {
    wheelSaveSpy(callback);
    super.save(callback);
  }
}

class SteeringWheel extends Model {
  associate() {
    this.belongsTo("truck", Truck);
  }
  save(callback) {
    steeringWheelSaveSpy(callback);
    super.save(callback);
  }
}

class Seat extends Model {
  associate() {
    this.belongsTo("truck", Truck);
  }
}
```

# Quality and Compatibility

[![Build Status](https://travis-ci.org/FreeAllMedia/dovima.png?branch=master)](https://travis-ci.org/FreeAllMedia/dovima) [![Code Climate](https://codeclimate.com/github/FreeAllMedia/dovima/badges/gpa.svg)](https://codeclimate.com/github/FreeAllMedia/dovima) [![Dependency Status](https://david-dm.org/FreeAllMedia/dovima.png?theme=shields.io)](https://david-dm.org/FreeAllMedia/dovima?theme=shields.io) [![Dev Dependency Status](https://david-dm.org/FreeAllMedia/dovima/dev-status.svg)](https://david-dm.org/FreeAllMedia/dovima?theme=shields.io#info=devDependencies)

*Every build and release is automatically tested on the following platforms:*

![node 0.12.x](https://img.shields.io/badge/node-0.12.x-brightgreen.svg) ![node 0.11.x](https://img.shields.io/badge/node-0.11.x-brightgreen.svg) ![node 0.10.x](https://img.shields.io/badge/node-0.10.x-brightgreen.svg)
![iojs 2.x.x](https://img.shields.io/badge/iojs-2.x.x-brightgreen.svg) ![iojs 1.x.x](https://img.shields.io/badge/iojs-1.x.x-brightgreen.svg)


<!-- [![Sauce Test Status](https://saucelabs.com/browser-matrix/dovima.svg)](https://saucelabs.com/u/dovima) -->


*If your platform is not listed above, you can test your local environment for compatibility by copying and pasting the following commands into your terminal:*

```
npm install dovima
cd node_modules/dovima
gulp test-local
```

# Installation

Copy and paste the following command into your terminal to install Dovima:

```
npm install dovima --save
```

## Import / Require

```
// ES6
import Model from "dovima";
```

```
// ES5
var Model = require("dovima");
```

```
// Require.js
define(["require"] , function (require) {
    var Model = require("dovima");
});
```

# Getting Started
Dovima provides a Model class which you should extend with your own models like the Truck example. It is similar to the Active Record pattern.
Besides of extending the base Model you will need to set the Model.database static property to a valid [almaden](https://github.com/FreeAllMedia/almaden) object. Almaden is a DB-agnostic adapter with query chaining support.

Important note: Dovima follows a strict casing rule. Object properties are always camelCased and database fields are snake_cased.

## Features
Dovima lets you (use the truck example at the top of this README as a reference to understand feature explanations):

### Relate models
You can relate models with the `hasOne`, `hasMany` and `belongsTo` methods provided by the Model base class by writing the `associate` method.

### Add validations
Also Dovima let's you add validation to the models property by writing a simple `validate` method. You can call the `ensure(propertyName, validator)` method and that will receive the property name on the model to execute the validator. For validations there are some provided within Dovima (isPresent) and some provided by the [proven](https://github.com/FreeAllMedia/proven) package. Validations can be sync or async and new ones can be created anytime by using the same interface.

### Soft delete
When you write your Model class you can mark it as a soft delete able Model by calling the `this.softDelete` property on the `initialize` method, case in which it will add the logical deletion behavior, so then when you delete it, it will be an update and it will be excluded from regular model queries except if you find explicitly the deleted ones. See below on find for that example.

### Find models
Finding will return the error and the result collection using the node callback convention (error, data).

Find a truck with id = 3.
```javascript
Truck
  .find
  .one
  .where("id", "3")
  .results((error, trucks) => {
      //do something with the first truck on the collection (in this case will be just one for sure)
    });
```

Find all trucks.
```javascript
Truck
  .find
  .all
  .where("brand", "like", "Mer%")
  .results((error, trucks) => {
      //do something with all the Mer% trucks
    });
```

Find deleted trucks.
```javascript
Truck
  .find
  .deleted
  .where("brand", "like", "Mer%")
  .results((error, trucks) => {
      //do something with all the Mer% trucks that where logically deleted (see softDelete model feature)
    });
```

### Save/update models
You can save models with the primary key (id by default) and the appropiate timestamps (createdAt and updatedAt) managed automatically by dovima.
```javascript
truck.save((error) => {
    //the truck variable now it has an id if it's new and a createdAt property
    //or just an updatedAt property refreshed if it was an existing one
  });
```

### Delete models
```javascript
truck.delete((error) => {
    //as the truck model was marked with soft delete, the truck will have a new deletedAt property
    //otherwise, it does nothing (yet)
  });
```

# How to Contribute

See something that could use improvement? Have a great feature idea? We listen!

You can submit your ideas through our [issues system](https://github.com/FreeAllMedia/dovima/issues), or make the modifications yourself and submit them to us in the form of a [GitHub pull request](https://help.github.com/articles/using-pull-requests/).

We always aim to be friendly and helpful.

## Running Tests

It's easy to run the test suite locally, and *highly recommended* if you're using Dovima.js on a platform we aren't automatically testing for.

```
npm test
```
