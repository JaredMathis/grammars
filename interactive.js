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
    exitIfNot,
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
    processExit();
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



(function test() {
    let fileName = 'v2/find.g';
    let grammar = fileToGrammar(fileName);

    let premise;
    let conclusion;
    let result;

    let layersDeep = 7;

    let remaining = `
    m1s 1as
    `;

    // TODO drop parenthesis out;
    // fix grammar rules

    let i = 0;
    let parts = remaining.split('\n');
    for (let part of parts) {
        let pair = part.trim();
        if (pair.length === 0) {
            continue;
        }
        i++;
        let parts2 = pair.split(' ');
        if (parts2.length !== 2) {
            throwNotImplemented(JSON.stringify({ pair }));
        }
        premise = parts2[0];
        conclusion = parts2[1];
        result = attemptToProve(grammar, premise, conclusion, fileName, layersDeep);
    
        if (result.proof) {
            let proofs = result.proof.map(p => p.text)
            if (isDistinct(proofs)) {  
                if (result.proof.length === 2) {
                    console.log(i + ' Only 2 steps. Not adding proof.')
                } else {
                    console.log(i + ' Adding proof.')

                    for (let p of result.proof) {
                        console.log(p);
                    }

                    addProofToFile(fileName, result.proof);
                }
            } else {
                console.log(i + ' Contains duplicate steps. Not adding proof.')
                let output = false;
                if (output) {
                    
                }
            }

        } else {
            if (result.existing) {
                console.log(i + ' Already exists');
            } else {
                console.log(i + ' No proof.');
            }
        }
    }

    for (let r of remaining) {

    }
})();

(function test() {
    let grammar = fileToGrammar('v2/find-stop.g');

    console.log({ grammar });
})();