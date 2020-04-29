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
    checkFile,
    prove,
} 
= require('./grammars');

const readlineSync = require('readline-sync');

if (process.argv.length <= 2) {
    console.log('interactive: Needs a command-line argument (file name to process)');
    process.exit(1);
}
if (process.argv.length > 3) {
    throwNotImplemented();
}

let fileName = process.argv[2];

run(fileName);

function run(fileName) {
    let grammar = checkFile(fileName);

    let running = true;
    while (running) {
        console.log('What conclusion would you like to prove?');
        let conclusion = readlineSync.prompt();

        console.log('What is the premise?');
        let premise = readlineSync.prompt();

        let result = prove(grammar, premise, conclusion);
        if (result.existing) {
            console.log('Already proved: ' + JSON.stringify(result.existing, ' ', 2));
        } else {
            throwNotImplemented();
        }
    }
}
