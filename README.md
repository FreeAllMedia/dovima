# Dovima.js [![npm version](https://img.shields.io/npm/v/dovima.svg)](https://www.npmjs.com/package/dovima) [![license type](https://img.shields.io/npm/l/dovima.svg)](https://github.com/FreeAllMedia/dovima.git/blob/master/LICENSE) [![npm downloads](https://img.shields.io/npm/dm/dovima.svg)](https://www.npmjs.com/package/dovima) ![ECMAScript 6 & 5](https://img.shields.io/badge/ECMAScript-6%20/%205-red.svg)

ES6 generic model with lots of useful special features.

```javascript
import Dovima from "dovima";

const dovima = new Dovima;
dovima.saySomething(); // will output "Something"
```

# Quality and Compatibility

[![Build Status](https://travis-ci.org/FreeAllMedia/dovima.png?branch=master)](https://travis-ci.org/FreeAllMedia/dovima) [![Code Climate](https://codeclimate.com/github/FreeAllMedia/dovima/badges/gpa.svg)](https://codeclimate.com/github/FreeAllMedia/dovima) [![Dependency Status](https://david-dm.org/FreeAllMedia/dovima.png?theme=shields.io)](https://david-dm.org/FreeAllMedia/dovima?theme=shields.io) [![Dev Dependency Status](https://david-dm.org/FreeAllMedia/dovima/dev-status.svg)](https://david-dm.org/FreeAllMedia/dovima?theme=shields.io#info=devDependencies)

*Every build and release is automatically tested on the following platforms:*

![node 0.12.x](https://img.shields.io/badge/node-0.12.x-brightgreen.svg) ![node 0.11.x](https://img.shields.io/badge/node-0.11.x-brightgreen.svg) ![node 0.10.x](https://img.shields.io/badge/node-0.10.x-brightgreen.svg)
![iojs 2.x.x](https://img.shields.io/badge/iojs-2.x.x-brightgreen.svg) ![iojs 1.x.x](https://img.shields.io/badge/iojs-1.x.x-brightgreen.svg)


[![Sauce Test Status](https://saucelabs.com/browser-matrix/dovima.svg)](https://saucelabs.com/u/dovima)


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
import dovima from "dovima";
```

```
// ES5
var dovima = require("dovima");
```

```
// Require.js
define(["require"] , function (require) {
    var dovima = require("dovima");
});
```

# Getting Started

You should create on some directory a config

# How to Contribute

See something that could use improvement? Have a great feature idea? We listen!

You can submit your ideas through our [issues system](https://github.com/FreeAllMedia/dovima/issues), or make the modifications yourself and submit them to us in the form of a [GitHub pull request](https://help.github.com/articles/using-pull-requests/).

We always aim to be friendly and helpful.

## Running Tests

It's easy to run the test suite locally, and *highly recommended* if you're using Dovima.js on a platform we aren't automatically testing for.

```
npm test
```
