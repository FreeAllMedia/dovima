# Dovima.js [![npm version](https://img.shields.io/npm/v/dovima.svg)](https://www.npmjs.com/package/dovima) [![license type](https://img.shields.io/npm/l/dovima.svg)](https://github.com/FreeAllMedia/dovima.git/blob/master/LICENSE) [![npm downloads](https://img.shields.io/npm/dm/dovima.svg)](https://www.npmjs.com/package/dovima) ![ECMAScript 6 & 5](https://img.shields.io/badge/ECMAScript-6%20/%205-red.svg)

[![Build Status](https://travis-ci.org/FreeAllMedia/dovima.png?branch=master)](https://travis-ci.org/FreeAllMedia/dovima) [![Coverage Status](https://coveralls.io/repos/FreeAllMedia/dovima/badge.svg)](https://coveralls.io/r/FreeAllMedia/dovima) [![Code Climate](https://codeclimate.com/github/FreeAllMedia/dovima/badges/gpa.svg)](https://codeclimate.com/github/FreeAllMedia/dovima) [![bitHound Score](https://www.bithound.io/github/FreeAllMedia/dovima/badges/score.svg)](https://www.bithound.io/github/FreeAllMedia/dovima)
[![Dependency Status](https://david-dm.org/FreeAllMedia/dovima.png?theme=shields.io)](https://david-dm.org/FreeAllMedia/dovima?theme=shields.io) [![Dev Dependency Status](https://david-dm.org/FreeAllMedia/dovima/dev-status.svg)](https://david-dm.org/FreeAllMedia/dovima?theme=shields.io#info=devDependencies)
![node 0.12.x](https://img.shields.io/badge/node-0.12.x-brightgreen.svg) ![node 0.11.x](https://img.shields.io/badge/node-0.11.x-brightgreen.svg) ![node 0.10.x](https://img.shields.io/badge/node-0.10.x-brightgreen.svg) ![iojs 2.x.x](https://img.shields.io/badge/iojs-2.x.x-brightgreen.svg) ![iojs 1.x.x](https://img.shields.io/badge/iojs-1.x.x-brightgreen.svg)

<!-- [![Sauce Test Status](https://saucelabs.com/browser-matrix/dovima.svg)](https://saucelabs.com/u/dovima) -->

Dovima is a high-quality, stand-alone ORM written in ES6. We call it a "supermodel" because it gracefully does everything you expect an ORM to do, plus a whole lot of time-saving, code-cleaning extra features that make it an absolute pleasure to work with.

# 1. Installation

```
$ npm install dovima --save
```

*You may wish to run the automated test suite to ensure that Dovima is fully compatible in your environment:*

```
$ cd node_modules/dovima
$ npm test
```

# 2. Import / Require

```
// ES6
import Model from "dovima";
```

```
// ES5
var Model = require("dovima");
```

# 3. Getting Started

Dovima doesn't require centralized schema files for associations, validations, or anything else. You simply define a model, add the features you want to it, and use it.

## 3.1 Define a Model

``` javascript
// models/user.js

import Model from "dovima";

class User extends Model {}
```

``` javascript
// test.js

import User from "./models/user.js";

const userAttributes = {
  name: "Bob Builder"
};

const user = new User(userAttributes);

user.name.should.eql(userAttributes.name);
```

## 3.2 Define Attribute Validations

``` javascript
// models/user.js

import Model, {isNotEmpty} from "dovima";

class User extends Model {
  validations() {
    this.validate("name", isNotEmpty);
  }
}
```

``` javascript
// test.js

import User from "./models/user.js";

const user = new User();

// Check if the model is valid or not
user.isValid((isValid) => {
  isValid.should.be.false;
});

// Get a list of all invalid attributes
// and the reasons they are invalid
user.invalidAttributes((invalidAttributes) => {
  invalidAttributes.should.eql({
    "name": ["cannot be empty"]
  });
});
```

## 3.3 Define Simple Associations

```
// models/user.js

import Model from "dovima";
import Article from "./models/article.js";
import Comment from "./models/comment.js";

class User extends Model {
  associations() {
    this.hasMany("articles", Article);

    this.hasMany("comments", Comment);

    this.hasMany("articleComments", Comment)
        .through("articles");
  }
}
```

```
// models/article.js

import Model from "dovima";
import User from "./models/user.js";
import Comment from "./models/comment.js";

class Article extends Model {
  associations() {
    this.belongsTo("user", User);
    this.hasMany("comments", Comment);
  }
}
```

```
// models/comment.js

import Model from "dovima";
import User from "./models/user.js";
import Article from "./models/article.js";

class Comment extends Model {
  associations() {
    this.belongsTo("user", User);
    this.belongsTo("article", Article);
  }
}
```

```
// test.js

import User from "./models/user.js";
import Article from "./models/article.js";
import Comment from "./models/comment.js";

const user = new User({
  name: "Bob Builder"
});

const article = new Article({
  title: "How to Build Things!",
  user: user
});

const commentAttributes = {
  user: user,
  article: article,
  text: "I really like this article."
};

const comment = new Comment(commentAttributes);

user.articles.push(article);
article.comments.push(comment);

const articleComment = user.articleComments[0];

articleComment.text.should.eql(commentAttributes.text);
```

## 3.4 Define Association Validations

``` javascript
// models/user.js

import Model, {isPresent} from "dovima";
import ProfilePicture from "./models/profilePicture.js";

class User extends Model {
  associations() {
    this.hasOne("profilePicture", ProfilePicture);
  }
  validations() {
    this.validate("profilePicture", isPresent);
  }
}
```

``` javascript
// test.js

import User from "./models/user.js";

const user = new User();

// Check if the model is valid or not
user.isValid((isValid) => {
  isValid.should.be.false;
});

// Get a list of all invalid attributes
// and the reasons they are invalid
user.invalidAttributes((invalidAttributes) => {
  invalidAttributes.should.eql({
    "profilePicture": ["must be present"]
  });
});
```

## 3.5 Define Custom Constructor

``` javascript
// models/user.js

import Model from "dovima";

class User extends Model {
  instantiate(attributes = {}, options = {}) {
    if (options.convertToDogYears) {
      this.age = attributes.age * 7;
    }
  }
}
```

``` javascript
// test.js

import User from "./models/user.js";

const user = new User({
  age: 8
}, {
  convertToDogYears: true
});

user.age.should.eql(56);
```

## 3.6 Global Data Persistence

**Note:** Dovima utilizes a database adapter called `almaden` to make calls to the database.

``` javascript
// models/user.js

import Model from "dovima";
import Article from "./models/article.js";

class User extends Model {
  associations() {
    this.hasMany("articles", Article);
  }
}
```

``` javascript
// models/article.js

import Model from "dovima";
import User from "./models/user.js";

class Article extends Model {
  associations() {
    this.belongsTo("user", User);
  }
}
```

``` javascript
// test.js

import Database from "almaden";

import Model from "dovima";

import User from "./models/user.js";
import Article from "./models/article.js";

const databaseCredentials = {
  client: "mysql",
  connection: {
    host     : "127.0.0.1",
    user     : "myUser",
    password : "123456789",
    database : "test"
  }
};

const database = new Database(databaseCredentials);

/**
 * Setting Model.database will cause all models to use it by default.
 */
Model.database = database;

/**
 * Set up the models
 */
const user = new User({
  name: "Norman"
});

const article = new Article({
  title: "Things Happening Around Town"
});

user.articles.push(article);

/**
 * Now, all models can .save(callback)
 */
user.save((error) => {
  if (error) { throw error; }
  // user was saved, and now has an id
  (user.id === undefined).should.be.false;
  // article was saved as well and has an id due to .save
  // propagating to all hasOne and hasMany associations
  (article.id === undefined).should.be.false;
});
```

### 3.6.1 K'Nex Compatibility

`almaden` is built on `knex`, so if you have an existing knex connection you'd like to use instead of creating a new one, just use the following instead of passing credentials:

``` javascript

import knex from "knex";
import Database from "almaden";
import Model from "dovima";

const databaseCredentials = {
  client: "mysql",
  connection: {
    host     : "127.0.0.1",
    user     : "myUser",
    password : "123456789",
    database : "test"
  }
};

const database = knex(databaseCredentials);

/**
 * Use existing knex connection
 */
Model.database = new Database({
  knex: database
});
```

## 3.7 Finding Models in Database

``` javascript
// models/user.js

import Model from "dovima";
import Article from "./models/article.js";

class User extends Model {
  associations() {
    this.hasMany("articles", Article);
  }
}
```

``` javascript
// models/article.js

import Model from "dovima";
import User from "./models/user.js";

class Article extends Model {
  associations() {
    this.belongsTo("user", User);
  }
}
```

``` javascript
// test.js

import Database from "almaden";

import Model from "dovima";

import User from "./models/user.js";
import Article from "./models/article.js";

const databaseCredentials = {
  client: "mysql",
  connection: {
    host     : "127.0.0.1",
    user     : "myUser",
    password : "123456789",
    database : "test"
  }
};

Model.database = new Database(databaseCredentials);

User
  .find.one
  .where("id", 1)
  .include("articles")
  .results((error, user) => {
    user.name.should.eql("Norman");
    user.articles[0].title.should.eql("Things Happening Around Town");
  });
```

## 3.8 Mocking Model Find Chain

``` javascript
// models/user.js

import Model from "dovima";

class User extends Model {}
```

``` javascript
// test.js

import User from "./models/user.js";

User.mock.find.one.where("id", 1).results({
  id: 1,
  name: "Bob"
});

User.find.one.where("id", 1).results((error, user) => {
  user.name.should.eql("Bob");
});
```

## 3.9 Mocking Model Instance

``` javascript
// models/user.js

import Model from "dovima";

class User extends Model {}
```

``` javascript
// test.js

import User from "./models/user.js";

const user = new User({id: 1});

user.mock.instance({
  id: 1,
  name: "Bob"
});

user.fetch(() => {
  user.id.should.eql(1);
  user.name.should.eql("Bob");
});
```
