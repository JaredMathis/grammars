const {
    isArray,
    isAtLeast,
    isDefined,
    isEqual,
    isEqualJson,
    isInteger,
    isString,
    isUndefined,
    range,
    throwIfNot,
    throwNotImplemented,
    throws,
} 
= require('./utilities');

const {
    parseGrammar,
} 
= require('./grammars');

const readlineSync = require('readline-sync');

function readStatement() {
    let input = readlineSync.prompt();
}

readStatement();
