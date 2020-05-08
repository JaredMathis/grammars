let {
    exitIfNot,
    consoleLog,
    isEqual,
} = require('../../utilities');

let {
    isValidRule,
} = require('../../grammars');

consoleLog('testing isValidRule');

exitIfNot(isEqual)(isValidRule({ left: {text: 'a' }, right: { text: 'b' } }), true);
exitIfNot(isEqual)(isValidRule({ left: {text: '' }, right: { text: 'b' } }), true);
exitIfNot(isEqual)(isValidRule({ left: {text: 'a' }, right: { text: '' } }), true);

consoleLog('testing isValidRule complete');
