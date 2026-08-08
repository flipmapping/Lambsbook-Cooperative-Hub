'use strict';

const fs = require('fs');
const path = require('path');

function normalize(p) {
  return fs.realpathSync(path.resolve(p));
}

function validateTopology(root) {
  return {
    root: normalize(root),
    valid: true
  };
}

module.exports = {
  normalize,
  validateTopology
};
