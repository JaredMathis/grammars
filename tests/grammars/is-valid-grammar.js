let {
    consoleLog,
    isEqual,
    exitIfNot,
} = require('../../utilities');

let grammars = require('../../grammars');
let { isValidGrammar } = grammars;

consoleLog('testing isValidGrammar');
exitIfNot(isEqual)(isValidGrammar({ start: 'a', rules: [{ left: { text: 'a' }, right: { text: 'b'  }}] }), true);
exitIfNot(isEqual)(isValidGrammar({ start: 'a', rules: [{ left: { text: '' }, right: { text: 'b' } }] }), true);
consoleLog('testing isValidGrammar complete');