let grammars = [
    'v1/addition.g',
    'v1/boolean.g',
    'v1/comparison.g',
    'v1/multiplication.g',
    'v1/multiply.g',
    'v1/parenthesis.g',
    'v1/primes.g',
    'v1/subtract.g',
    'v1/test.g',
];

const { fileToGrammar } = require('./../grammars');
const { 
    consoleLog,
    loop,
} = require('./../utilities');

let log = true;

if (log) consoleLog('Checking v1');

loop(grammars, g => {
    if (log) consoleLog({g})
    fileToGrammar(g);
}, log);