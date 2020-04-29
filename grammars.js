const fs = require('fs');

module.exports = {
    checkFile,
    parseGrammar,
    prove,
}
;

const {
    isArray,
    isArrayIndex,
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

const specialToken = '#';
const ruleToken = '|';
const includeToken = 'include'

function isValidRule(rule) {
    let log = false;
    if (log) console.log('isValidRule entered ' + JSON.stringify(rule));

    throwIfNot(isDefined, 'expecting rule to be defined: ' + rule)(rule);

    throwIfNot(isDefined, 'expecting left to be defined. rule: ' + JSON.stringify(rule))(rule.left);
    if (!isValidSide(rule.left.text)) {
        return false;
    } 
    
    throwIfNot(isDefined)(rule.right);
    if (!isValidSide(rule.right.text)) {
        return false;
    } 
    
    // Redundant rule
    if (rule.left.text === rule.right.text) {
        return false;
    }

    return true;
}

throwIfNot(isEqual)(isValidRule({ left: {text: 'a' }, right: { text: 'b' } }), true);
throwIfNot(isEqual)(isValidRule({ left: {text: '' }, right: { text: 'b' } }), true);
throwIfNot(isEqual)(isValidRule({ left: {text: 'a' }, right: { text: '' } }), true);
throwIfNot(isEqual)(isValidRule({ left: {text: '' }, right: { text: '' } }), false);

function isValidSide(side) {
    if (!isDefined(side)) {
        return false;
    }

    if (!isString(side)) {
        return false;
    }

    if (side.indexOf(' ') >= 0) {
        return false;
    }

    return true;
}

throwIfNot(isEqual)(isValidRule({ left: { text: 'a' }, right: { text: 'b' } }), true);
throwIfNot(isEqual)(isValidRule({ left: 'a', right: { text: 'b' } }), false);
throwIfNot(isEqual)(isValidRule({ left: { text: 'a' }, right: 'b' }), false);
throwIfNot(isEqual)(isValidRule({ left: { text: 'a ' }, right: { text: 'b' } }), false);
throwIfNot(isEqual)(isValidRule({ left: { text: 'a' }, right: { text: 'b ' } }), false);
throwIfNot(isEqual)(isValidRule({ left: { text: 1 }, right: { text: 'b' } }), false);
throwIfNot(isEqual)(isValidRule({ left: { text: undefined }, right: { text: 'b' } }), false);
throwIfNot(isEqual)(isValidRule({ left: { text: 'a' }, right: { text: 1 } }), false);
throwIfNot(isEqual)(isValidRule({ left: { text: 'a' }, right: { text: undefined } }), false);
throwIfNot(throws)(() => isValidRule({ right: 'b' }), false);
throwIfNot(throws)(() => isValidRule({ left: { text: 'a' } }), false);

function isValidSubstitution(rule, index, previous, current) {
    let log = false;
    let verbose = true;

    if (log) console.log('isValidSubstitution entered ' + JSON.stringify({ index, previous, current, rule }));

    throwIfNot(isValidRule)(rule);
    throwIfNot(isString)(previous);
    throwIfNot(isString)(current);

    let left = rule.left.text;
    let right = rule.right.text;

    if (log) console.log('isValidSubstitution entered ' + JSON.stringify({ left, right }));

    let a = previous.length - left.length;
    let b = current.length - right.length;
    throwIfNot(isInteger)(a);
    throwIfNot(isInteger)(b);
    throwIfNot(isEqual, 'invalid length')(a, b);

    // Rule left substitutes into previous
    for (let i of range(left.length)) {
        let pi = i + index;
        let a = previous[pi];
        let b = left[i];
        if (log) 
        if (verbose)
        console.log('isValidSubstitution left rule into previous ' + JSON.stringify({ a, b, pi, i }));
        throwIfNot(isEqual)(a, b);
    }

    // Before substitution matches
    for (let i of range(index)) {
        let a = previous[i];
        let b = current[i];
        if (log) 
        if (verbose)
        console.log('isValidSubstitution before ' + JSON.stringify({ a, b }))
        throwIfNot(isEqual)(a, b);
    }

    // Rule right substitutes into current
    for (let i of range(right.length)) {
        let a = current[i + index];
        let b = right[i];
        if (log) 
        if (verbose)
        console.log('isValidSubstitution right rule into current ' + JSON.stringify({ a, b }));
        throwIfNot(isEqual)(a, b);
    }

    // After substitution matches
    for (let i = index + left.length; i < previous.length; i++) {
        let a = previous[i];
        let b = current[i - left.length + right.length];
        if (log) 
        if (verbose)
        console.log('isValidSubstitution right rule into current ' + JSON.stringify({ a, b }));
        throwIfNot(isEqual)(a, b);
    }

    return true;
}

throwIfNot(isEqual)(isValidSubstitution({ left: { text: 'a' }, right: { text: 'b' } }, 0, 'a', 'b'), true);
throwIfNot(throws)(() => isValidSubstitution({ left: { text: 'a' }, right: { text: 'b' } }, 0, 'a', 'c'));
throwIfNot(throws)(() => isValidSubstitution({ left: { text: 'a' }, right: { text: 'b' } }, 0, 'a', ''));
throwIfNot(throws)(() => isValidSubstitution({ left: { text: 'a' }, right: { text: 'b' } }, 0, 'a', 'a'));
throwIfNot(isEqual)(isValidSubstitution({ left: { text: 'a' }, right: { text: 'bb' } }, 0, 'a', 'bb'), true);
throwIfNot(throws)(() => isValidSubstitution({ left: { text: 'a' }, right: { text: 'bb' } }, 1, 'a', 'bb'));
throwIfNot(isEqual)(isValidSubstitution({ left: { text: 'a' }, right: { text: 'bb' } }, 1, 'aa', 'abb'), true);
throwIfNot(isEqual)(isValidSubstitution({ left: { text: 'a' }, right: { text: 'bb' } }, 1, 'aaa', 'abba'), true);
throwIfNot(isEqual)(isValidSubstitution({ left: { text: 'a' }, right: { text: '' } }, 1, 'aaa', 'aa'), true);
throwIfNot(throws)(() => isValidSubstitution({ left: { text: 'a' }, right: { text: '' } }, 1, 'aaa', 'aaa'));
throwIfNot(throws)(() => isValidSubstitution({ left: { text: 'a' }, right: { text: 'bb' } }, 1, 'aaa', 'abbd'));

function isValidGrammar(grammar) {
    throwIfNot(isDefined)(grammar);

    throwIfNot(isArray)(grammar.rules);
    throwIfNot(isAtLeast)(grammar.rules.length, 1);

    for (let r of grammar.rules) {
        throwIfNot(isValidRule, 'expecting r to be valid rule')(r);
    }

    for (let r of grammar.rules) {
        for (let q of grammar.rules) {
            if (r === q) {
                continue;
            }
            if (r.left.text === q.left.text && r.right.text === q.right.text) {
                throw new Error('Duplicate rules: ' + JSON.stringify({ r, q }, ' ', 2));
            }
        }
    }

    return true;
}

throwIfNot(throws)(() => isValidGrammar());
throwIfNot(throws)(() => isValidGrammar({ start: undefined }));
throwIfNot(throws)(() => isValidGrammar({ start: ' ' }));
throwIfNot(throws)(() => isValidGrammar({ start: 'a' }));
throwIfNot(throws)(() => isValidGrammar({ start: 'a', rules: undefined }));
throwIfNot(throws)(() => isValidGrammar({ start: 'a', rules: [] }));
throwIfNot(throws)(() => isValidGrammar({ start: 'a', rules: [undefined] }));
throwIfNot(throws)(() => isValidGrammar({ start: 'a', rules: [{ left: { text: undefined }, right: { text: undefined }}] }));
throwIfNot(throws)(() => isValidGrammar({ start: 'a', rules: [{ left: { text: ' ' }, right: { text: undefined } }] }));
throwIfNot(throws)(() => isValidGrammar({ start: 'a', rules: [{ left: { text: undefined }, right: { text: ' ' } }] }));
throwIfNot(throws)(() => isValidGrammar({ start: 'a', rules: [{ left: { text: ' ' }, right: { text: ' ' } }] }));
throwIfNot(throws)(() => isValidGrammar({ start: 'a', rules: [{ left: { text: 'a' }, right: { text: ' ' } }] }));
throwIfNot(isEqual)(isValidGrammar({ start: 'a', rules: [{ left: { text: 'a' }, right: { text: 'b'  }}] }), true);
throwIfNot(throws)(() => isValidGrammar({ start: 'a', rules: [{ left: { text: ' ' }, right: { text: 'b'  }}] }));
throwIfNot(isEqual)(isValidGrammar({ start: 'a', rules: [{ left: { text: '' }, right: { text: 'b' } }] }), true);
throwIfNot(throws)(() => isValidGrammar({ start: 'a', rules: [{ left: { text: '' }, right: { text: 'b' } },{ left: { text: '' }, right: { text: 'b' } }] }), true);
throwIfNot(throws)(() => isValidGrammar({ start: 'a', rules: [{ left: { text: '' }, right: { text: '' } }] }));

function isProof(p) {
    throwIfNot(isDefined)(p);
    throwIfNot(isString, 'p.text')(p.text);
    return true;
}

function isValidProof(grammar, proof, fileName) {
    let result = {};
    result.valid = true;

    let innerMessage;
    
    throwIfNot(isValidGrammar)(grammar, fileName);

    throwIfNot(isArray, 'proof')(proof);
    
    if (proof.length === 1) {
        result.valid = false;
        result.message = 'Proof cannot be 1 step';
        return result;
    }

    for (let p of proof) {
        throwIfNot(isProof)(p);
    }

    let valid;

    let previous;
    let current = { text: undefined };
    for (let p of proof) {
        previous = current;
        current = p;

        // The first is current is valid.
        if (isUndefined(previous.text)) {
            continue;
        }

        valid = false;
        for (let r of grammar.rules) {
            for (let i of range(previous.text.length)) {
                try {
                    valid = isValidSubstitution(r, i, previous.text, current.text);
                } catch (e) {
                    valid = false;
                    innerMessage = e;
                }
                
                if (valid) {
                    break;
                }
            }
            if (valid) {
                break;
            }
        }

        if (!valid) {
            break;
        }
    }

    if (!valid) {
        result.valid = false;
        result.message = 'Invalid substitution: ' + innerMessage;
        result.previous = previous;
        result.current = current;
    }

    return result;
}

throwIfNot(isEqualJson)(isValidProof({ start: 'aa', rules: [{ left: { text: 'a' }, right: { text: 'b' } }]}, [{ text: 'a' }, { text: 'b' }]), { valid: true });
throwIfNot(isEqualJson)(isValidProof({ start: 'aa', rules: [{ left: { text: 'a' }, right: { text: 'b' } }]}, [{ text: 'a' }, { text: 'c' }]), {"valid":false,"message":"Invalid substitution: Error: throwIfNot isEqual; arguments: {\"0\":\"c\",\"1\":\"b\"}","previous":{"text":"a"},"current":{"text":"c"}});
throwIfNot(isEqualJson)(isValidProof({ start: 'aa', rules: [{ left: { text: 'a' }, right: { text: 'b' } }]}, [{ text: 'a' }]), {"valid":false,"message":"Proof cannot be 1 step"});

function parseGrammar(text, fileName, files, grammar) {
    let log = false;
    let verbose = false;

    if (log) console.log('parseGrammar entered ' + JSON.stringify({ fileName }));

    throwIfNot(isString)(text);

    if (isUndefined(fileName)) {
        fileName = '(no fileName)';
    }

    if (isUndefined(files)) {
        files = [];
    }
    // Already processed
    if (files.includes(fileName)) {
        return;
    }
    files.push(fileName);

    if (isUndefined(grammar)) {
        grammar = { rules: [] };
    }

    let lines = text.split('\n');

    let proof = [];

    let lineNumber = 0;
    for (let line of lines) {
        let trimmed = line.trim();
        lineNumber++;

        if (log)
        if (verbose)
        console.log('parseGrammar ' + fileName + ' line ' + lineNumber + ' ' + line);
        
        if (trimmed.indexOf(specialToken) === 0) {
            let remaining = trimmed.substring(specialToken.length);
            // Special + ' ' is a comment
            if (remaining[0] == ' ') {
                continue;
            }
            
            if (remaining.indexOf(includeToken) === 0) {
                let includeFileName = remaining.substring(includeToken.length).trim();

                if (includeFileName === fileName) {
                    throwNotImplemented('including self file recursively');
                }

                checkFile(includeFileName, files, grammar);      
                
                continue;

            } else {
                throwNotImplemented('parseGrammar ' + fileName + ' line ' + lineNumber + ': Invalid usage of ' + specialToken + ' token');
            }
        }

        if (trimmed.indexOf(ruleToken) >= 0) {
            // Is rule.

            let ruleText = trimmed;
            let split = ruleText.split(ruleToken);
            let parts = split.length;
            if (parts !== 2) {
                throwNotImplemented('expecting ruleText to have 2 parts. ' + JSON.stringify({ parts, ruleText }));
            }
            let rule = { 
                left: textToSide(split[0].trim(), lineNumber), 
                right: textToSide(split[1].trim(), lineNumber),
                fileName,
            };
            grammar.rules.push(rule);
            continue;
        }

        if (trimmed === '') {            
            if (proof.length === 0) {
                //throwNotImplemented('proof is []; is there a double new line?');

                // empty line
                continue;
            }

            // We're processing a theorem
            checkProof();
            
            continue;
        }

        // This is a proof step.
        proof.push(textToSide(trimmed, lineNumber));
    }


    if (proof.length !== 0) {
        checkProof();
    }

    throwIfNot(isValidGrammar)(grammar);

    function textToSide(trimmed, lineNumber) {
        return {
            text: trimmed,
            lineNumber,
        };
    }

    function checkProof() {
        let result = isValidProof(grammar, proof, fileName);
        // If proof is valid, add it as a new grammar rule.
        if (result.valid) {
            let left = proof[0];
            let right = proof[proof.length - 1];
            let rule = { 
                left, 
                right,
                fileName,
            };
            grammar.rules.push(rule);
        } else {
            throw new Error('Invalid proof: ' + JSON.stringify({ fileName: fileName || 'no file name', result, lineNumber }, ' ', 2));
        }

        proof = [];
    }

    return grammar;
}

parseGrammar(`a${ruleToken}b

aa
ab
`);

parseGrammar(`a${ruleToken}b
b${ruleToken}c

a
b
c

aa
ab
bb
cb
cc
`);

parseGrammar(`a${ruleToken}b

aa
ba

b|c

a
b
c
`);

function checkFile(fileName, files, grammar) {
    let log = false;

    if (log) 
    console.log('checkFile entered', { 
        fileName});

    throwIfNot(isString, 'checkFile: fileName needs to be specified')(fileName);

    let text = fs.readFileSync(fileName, 'utf8');

    if (log) 
    console.log('checkFile calling parseGrammar', { 
        fileName, 'text.length': text.length, files, grammar});
    
    grammar = parseGrammar(text, fileName, files, grammar);

    return grammar;
}

function substituteRule(rule, premise, index) {
    throwIfNot(isValidRule)(rule);
    throwIfNot(isString)(premise);
    throwIfNot(isArrayIndex)(premise, index);

    let result = {
        success: false,
    };

    let left = rule.left.text;
    if (index + left.length > premise.length) {
        result.message = 'rule too big';
        return result;
    }

    let potential = premise.substring(index, index + left.length);
    if (potential !== left) {
        result.message = 'rule does not match';
        return result;
    }

    result.success = true;

    let before = premise.substring(0, index);
    let after = premise.substring(index + left.length);

    let right = rule.right.text;
    result.substituted = before + right + after;

    return result;
}

(function test() {
    let rule = {
        left: {
            text: 'b',
        },
        right: {
            text: 'dd',
        }
    };
    let result;
    
    result = substituteRule(rule, 'abc', 1);
    throwIfNot(isDefined)(result);
    throwIfNot(isEqual)(result.success, true);
    throwIfNot(isEqual)(result.substituted, 'addc');
    
    result = substituteRule(rule, 'abc', 0);
    throwIfNot(isDefined)(result);
    throwIfNot(isEqual)(result.success, false);

    result = substituteRule(rule, 'abc', 2);
    throwIfNot(isDefined)(result);
    throwIfNot(isEqual)(result.success, false);
    
})();

function prove(grammar, premise, conclusion) {
    throwIfNot(isValidGrammar)(grammar);
    throwIfNot(isString)(premise);
    throwIfNot(isString)(conclusion);

    let result = {};

    // Check for already proved.
    for (let rule of grammar.rules) {
        if (premise === rule.left.text 
            && conclusion === rule.right.text) {
            result.existing = rule;
            return result;
        }
    }

    let proof = [];
    result.proof = proof;
    proof.push(premise);

    trySubstitutions(premise, 2);

    return result;

    function trySubstitutions(premise, n) {
        for (let substitution of getSubstitutions(premise)) {
            proof.push(substitution);
            if (substitution === conclusion) {
                proof.push(conclusion);
                return true;
            }
            proof.pop();
            
            if (n >= 1) {
                if (trySubstitutions(substitution, n - 1)) {
                    return true;
                }
            }
        }
    }

    function* getSubstitutions(premise) {
        for (let rule of grammar.rules) {
            for (let i of range(premise.length)) {
                let { success, substituted } = substituteRule(rule, premise, i);
                if (success) {
                    yield substituted;
                }
            }
        }
    }
}

(function test() {
    let grammar = checkFile('v2/reverse2.g');

    let premise;
    let conclusion;
    let result;

    premise = '(1)c';
    conclusion = '(c1)';
    result = prove(grammar, premise, conclusion);
    throwIfNot(isDefined)(result);
    throwIfNot(isDefined)(result.existing);

    premise =       '(1)d';
    conclusion =    '(d1)';
    result = prove(grammar, premise, conclusion);

    console.log({result});
    if (result.proof) {
        for (let p of result.proof) {
            console.log(p);
        }
    }
})();



