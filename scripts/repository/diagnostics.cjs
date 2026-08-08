'use strict';

function emitViolation(v) {
  return Object.freeze({
    timestamp: new Date().toISOString(),
    severity: 'error',
    ...v
  });
}

module.exports = {
  emitViolation
};
