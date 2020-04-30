const fs = require('fs');

module.exports = {
    checkFile: fileToGrammar,
    parseGrammar,
    prove: attemptToProve,
}
;

const {
    arraySkip,
    consoleLog,
    isArray,
    isArrayIndex,
    isAtLeast,
    isDefined,
    isDistinct,
    isEqual,
    isEqualJson,
    isInteger,
    isString,
    isStringNonEmpty,
    isUndefined,
    logIndent,
    range,
    readTextFile,
    summarize,
    exitIfNot,
    throwNotImplemented,
    throws,
}
= require('./utilities');

const specialToken = '#';
const ruleToken = '|';
const includeToken = specialToken + 'include'
const importToken = specialToken + 'import'

// TODO: Whitespace abstraction/as a constant/tokenization.

function isValidRule(rule) {
    let log = false;
    if (log) console.log('isValidRule entered ' + JSON.stringify(rule));

    if (!isDefined(rule)) {
        if (log) consoleLog('expecting rule to be defined: ' + rule);
        return false;
    }

    if (!isDefined(rule.left)) {
        if (log) consoleLog('expecting left to be defined. rule: ' + JSON.stringify(rule));
        return false;
    }

    if (!isValidSide(rule.left.text)) {
        return false;
    } 

    if (!isDefined(rule.right)) {
        if (log) consoleLog('expecting right to be defined. rule: ' + JSON.stringify(rule));
        return false;
    }
    
    if (!isValidSide(rule.right.text)) {
        return false;
    } 
    
    // Redundant rule
    if (rule.left.text === rule.right.text) {
        return false;
    }

    return true;
}

exitIfNot(isEqual)(isValidRule({ left: {text: 'a' }, right: { text: 'b' } }), true);
exitIfNot(isEqual)(isValidRule({ left: {text: '' }, right: { text: 'b' } }), true);
exitIfNot(isEqual)(isValidRule({ left: {text: 'a' }, right: { text: '' } }), true);
exitIfNot(isEqual)(isValidRule({ left: {text: '' }, right: { text: '' } }), false);

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

consoleLog('testing isValidRule');

exitIfNot(isEqual)(isValidRule({ left: { text: 'a' }, right: { text: 'b' } }), true);
exitIfNot(isEqual)(isValidRule({ left: 'a', right: { text: 'b' } }), false);
exitIfNot(isEqual)(isValidRule({ left: { text: 'a' }, right: 'b' }), false);
exitIfNot(isEqual)(isValidRule({ left: { text: 'a ' }, right: { text: 'b' } }), false);
exitIfNot(isEqual)(isValidRule({ left: { text: 'a' }, right: { text: 'b ' } }), false);
exitIfNot(isEqual)(isValidRule({ left: { text: 1 }, right: { text: 'b' } }), false);
exitIfNot(isEqual)(isValidRule({ left: { text: undefined }, right: { text: 'b' } }), false);
exitIfNot(isEqual)(isValidRule({ left: { text: 'a' }, right: { text: 1 } }), false);
exitIfNot(isEqual)(isValidRule({ left: { text: 'a' }, right: { text: undefined } }), false);
exitIfNot(isEqual)(isValidRule({ right: 'b' }), false);
exitIfNot(isEqual)(isValidRule({ left: { text: 'a' } }), false);

consoleLog('testing isValidRule complete');

function isValidSubstitution(rule, index, previous, current) {
    let log = true;
    let verbose = true;

    if (log) consoleLog('isValidSubstitution entered ' + JSON.stringify({ index, previous, current, rule }));

    let result = {
        success: true,
    }

    logIndent(() => {

        if (!isValidRule(rule)) {
            result.success = false;
            result.message = 'invalid rule';
            return;
        }
        if (!isString(previous)) {
            result.success = false;
            result.message = 'previous is not string';
            return;
        }
        if (!isString(current)) {
            result.success = false;
            result.message = 'current is not string';
            return;
        }

        let left = rule.left.text;
        let right = rule.right.text;

        if (log) consoleLog(JSON.stringify({ left, right }));

        let a = previous.length - left.length;
        let b = current.length - right.length;

        if (a !== b) {
            result.success = false;
            result.message = 'previous and current lengths are incompatible with rule';
            return;
        }

        if (index + left.length > previous.length) {
            result.message = 'previous is too short for rule';
            result.success = false;
            return;
        }

        if (index + right.length > current.length) {
            result.message = 'current is too short for rule';
            result.success = false;
            return;
        }

        // Rule left substitutes into previous
        for (let i of range(left.length)) {
            let previousIndex = i + index;
            let previousI = previous[previousIndex];
            let leftI = left[i];
            if (log) 
            if (verbose)
            consoleLog('left rule into previous ' + JSON.stringify({ previousI, leftI, previousIndex, i }));

            if (!isEqual(previousI, leftI)) {
                result.success = false;
                result.message = 'rule left does not substitute into previous';
                return;
            }
        }

        // TODO: figure out what this for-block is for
        // Before substitution matches
        for (let i of range(index)) {
            let a = previous[i];
            let b = current[i];
            if (log) 
            if (verbose)
            consoleLog('before ' + JSON.stringify({ a, b }))

            if (!isEqual(a, b)) {
                result.success = false;
                result.message = 'TODO';
                return;
            }
        }

        // Rule right substitutes into current
        for (let i of range(right.length)) {
            let a = current[i + index];
            let b = right[i];
            if (log) 
            if (verbose)
            consoleLog('right rule into current ' + JSON.stringify({ a, b }));
            
            if (!isEqual(a, b)) {
                result.success = false;
                result.message = 'rule right does not substitute into current';
                return;
            }
        }

        // After substitution matches
        for (let i = index + left.length; i < previous.length; i++) {
            let a = previous[i];
            let b = current[i - left.length + right.length];
            if (log) 
            if (verbose)
            consoleLog('right rule into current ' + JSON.stringify({ a, b }));
            
            if (!isEqual(a, b)) {
                result.success = false;
                result.message = 'current does not match does not substitute into current';
                return;
            }
        }
   
    });

    if (log) consoleLog('isValidSubstitution leaving ' + JSON.stringify({ result }));

    return result;  
}

console.log('testing isValidSubstitution');
exitIfNot(isEqualJson)(isValidSubstitution({ left: { text: 'a' }, right: { text: 'b' } }, 0, 'a', 'b'), {"success":true});
exitIfNot(isEqualJson)(isValidSubstitution({ left: { text: 'a' }, right: { text: 'b' } }, 0, 'a', 'c'), {"success":false,"message":"rule right does not substitute into current"});
exitIfNot(isEqualJson)(isValidSubstitution({ left: { text: 'a' }, right: { text: 'b' } }, 0, 'a', ''), {"success":false,"message":"previous and current lengths are incompatible with rule"});
exitIfNot(isEqualJson)(isValidSubstitution({ left: { text: 'a' }, right: { text: 'b' } }, 0, 'a', 'a'), {"success":false,"message":"rule right does not substitute into current"});
exitIfNot(isEqualJson)(isValidSubstitution({ left: { text: 'a' }, right: { text: 'bb' } }, 0, 'a', 'bb'), {"success":true});
exitIfNot(isEqualJson)(isValidSubstitution({ left: { text: 'a' }, right: { text: 'bb' } }, 1, 'a', 'bb'), {"success":false,"message":"previous is too short for rule"});
exitIfNot(isEqualJson)(isValidSubstitution({ left: { text: 'a' }, right: { text: 'bb' } }, 1, 'aa', 'abb'), {"success":true});
exitIfNot(isEqualJson)(isValidSubstitution({ left: { text: 'a' }, right: { text: 'bb' } }, 1, 'aaa', 'abba'), {"success":true});
exitIfNot(isEqualJson)(isValidSubstitution({ left: { text: 'a' }, right: { text: '' } }, 1, 'aaa', 'aa'), {"success":true});
exitIfNot(isEqualJson)(isValidSubstitution({ left: { text: 'a' }, right: { text: '' } }, 1, 'aaa', 'aaa'), {"success":false,"message":"previous and current lengths are incompatible with rule"});
exitIfNot(isEqualJson)(isValidSubstitution({ left: { text: 'a' }, right: { text: 'bb' } }, 1, 'aaa', 'abbd'), {"success":false,"message":"current does not match does not substitute into current"});
console.log('testing isValidSubstitution complete');

function isValidGrammar(grammar) {
    let log = false;

    if (isUndefined(grammar)) {
        return false;
    }

    if (isUndefined(grammar.rules)){
        return false;
    }
    if (!isArray(grammar.rules)){
        return false;
    }

    if (grammar.rules.length < 1) {
        if (log) consoleLog('grammar needs at least 1 rule');
        return false;
    }

    for (let r of grammar.rules) {
        if (!isValidRule(r)) {
            if (log) consoleLog('expecting r to be valid rule');
            return false;
        }
    }

    for (let r of grammar.rules) {
        for (let q of grammar.rules) {
            if (r === q) {
                continue;
            }
            if (r.left.text === q.left.text && r.right.text === q.right.text) {
                if (log) consoleLog('Duplicate rules: ' + JSON.stringify({ r, q }, ' ', 2));
                return false;
            }
        }
    }

    return true;
}

consoleLog('testing isValidGrammar')
exitIfNot(isEqual)(isValidGrammar(), false);
exitIfNot(isEqual)(isValidGrammar({ start: undefined }), false);
exitIfNot(isEqual)(isValidGrammar({ start: ' ' }), false);
exitIfNot(isEqual)(isValidGrammar({ start: 'a' }), false);
exitIfNot(isEqual)(isValidGrammar({ start: 'a', rules: undefined }), false);
exitIfNot(isEqual)(isValidGrammar({ start: 'a', rules: [] }), false);
exitIfNot(isEqual)(isValidGrammar({ start: 'a', rules: [undefined] }), false);
exitIfNot(isEqual)(isValidGrammar({ start: 'a', rules: [{ left: { text: undefined }, right: { text: undefined }}] }), false);
exitIfNot(isEqual)(isValidGrammar({ start: 'a', rules: [{ left: { text: ' ' }, right: { text: undefined } }] }), false);
exitIfNot(isEqual)(isValidGrammar({ start: 'a', rules: [{ left: { text: undefined }, right: { text: ' ' } }] }), false);
exitIfNot(isEqual)(isValidGrammar({ start: 'a', rules: [{ left: { text: ' ' }, right: { text: ' ' } }] }), false);
exitIfNot(isEqual)(isValidGrammar({ start: 'a', rules: [{ left: { text: 'a' }, right: { text: ' ' } }] }), false);
exitIfNot(isEqual)(isValidGrammar({ start: 'a', rules: [{ left: { text: 'a' }, right: { text: 'b'  }}] }), true);
exitIfNot(isEqual)(isValidGrammar({ start: 'a', rules: [{ left: { text: ' ' }, right: { text: 'b'  }}] }), false);
exitIfNot(isEqual)(isValidGrammar({ start: 'a', rules: [{ left: { text: '' }, right: { text: 'b' } }] }), true);
exitIfNot(isEqual)(isValidGrammar({ start: 'a', rules: [{ left: { text: '' }, right: { text: 'b' } },{ left: { text: '' }, right: { text: 'b' } }] }), false);
exitIfNot(isEqual)(isValidGrammar({ start: 'a', rules: [{ left: { text: '' }, right: { text: '' } }] }), false);
consoleLog('testing isValidGrammar complete');

function isProof(p) {
    exitIfNot(isDefined)(p);
    exitIfNot(isString, 'p.text')(p.text);
    return true;
}

function isValidProof(grammar, proof, fileName) {
    let log = true;

    if (log) consoleLog('isValidProof entered');

    let result = {};

    logIndent(() => {
        result.valid = true;
        
        if (!isValidGrammar(grammar, fileName)) {
            result.valid = false;
            result.message = 'Invalid grammar';
            if (isDefined(fileName)) {
                result.message += ' ' + fileName;
            }
            return;
        }

        exitIfNot(isArray, 'proof')(proof);
        
        if (proof.length === 1) {
            result.valid = false;
            result.message = 'Proof cannot be 1 step';
            return;
        }

        for (let p of proof) {
            exitIfNot(isProof, 'expecting proof: ' + JSON.stringify(p))(p);
        }

        let valid;

        let substitutionResult;
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
                    substitutionResult = isValidSubstitution(r, i, previous.text, current.text);
                    valid = substitutionResult.success;
                    
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

        console.log('here',{substitutionResult, a:isDefined(substitutionResult)})
        exitIfNot(isDefined, 'expecting substitutionResult to be defined')(substitutionResult)

        if (!valid) {
            result.valid = false;
            result.message = 'Invalid substitution: ' + substitutionResult.message;
            result.previous = previous;
            result.current = current;
            if (log) consoleLog('invalid ' + JSON.stringify({ substitutionResult, result }));
        }
    });

    return result;
}

consoleLog('testing isValidProof');
exitIfNot(isEqualJson)(isValidProof({ start: 'aa', rules: [{ left: { text: 'a' }, right: { text: 'b' } }]}, [{ text: 'a' }, { text: 'b' }]), { valid: true });
exitIfNot(isEqualJson)(isValidProof({ start: 'aa', rules: [{ left: { text: 'a' }, right: { text: 'b' } }]}, [{ text: 'a' }, { text: 'c' }]), {"valid":false,"message":"Invalid substitution: rule right does not substitute into current","previous":{"text":"a"},"current":{"text":"c"}});
exitIfNot(isEqualJson)(isValidProof({ start: 'aa', rules: [{ left: { text: 'a' }, right: { text: 'b' } }]}, [{ text: 'a' }]), {"valid":false,"message":"Proof cannot be 1 step"});
consoleLog('testing isValidProof complete');

function addProof(grammar, proof, fileName, lineNumber) {
    // TODO: make sure grammar is self-consistent??

    if (isUndefined(lineNumber)) {
        lineNumber = -1;
    }

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
}

function parseGrammar(text, fileName, files, grammar) {
    let log = true;
    let verbose = true;

    if (log) consoleLog('parseGrammar entered; ' + summarize({fileName}));
    logIndent(() => {
        exitIfNot(isString)(text);

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
    
        let proofBuffer = [];
    
        let isImporting = false;
        let importSubstitutions = {};
    
        let lineNumber = 0;
        for (let line of lines) {
            let trimmed = line.trim();
            lineNumber++;

            if (log)
            if (verbose)
            consoleLog(`processing line ${lineNumber}: ${summarize(line)}`);

            logIndent(() => {            
                let parts = line.split(' ')
                .map(s => s.trim())
                .filter(isStringNonEmpty);
            
                // Empty line
                if (parts.length === 0) {
                    // We're processing a theorem
                    tryAddProofAndClearProofBuffer();
                }
        
                // #
                if (parts[0] === specialToken) {
                    if (isImporting) {
                        if (parts.length === 0) {
                            throwNotImplemented();
                        } else if (parts.length === 1) {
                            // A single # is the end of an include section
                            isImporting = false;
                        } else if (parts.length === 2) {
                            // Invalid, we need to know what symbol to substitute
                            throwNotImplemented(getLineMessage('Expecting token after ' + parts[1]));
                        } else if (parts.length >= 3) {
                            let key = parts[1];
                            // Skip 2: # and key
                            let value = arraySkip(parts, 2);
                            if (importSubstitutions[key]) {
                                throwNotImplemented(getLineMessage('Duplicate defined symbol in ' + parts[1]));
                            }
        
                            importSubstitutions[key] = value;
        
                            // TODO: ensure key is part of target grammar file.
                        }
                    }
                    return;
                }
                    
                if (parts[0] === includeToken) {
                    let includeFileName = remaining.substring(includeToken.length).trim();
        
                    if (includeFileName === fileName) {
                        throwNotImplemented('including self file recursively');
                    }
        
                    fileToGrammar(includeFileName, files, grammar);      
                    
                    return;
                }
                
                if (parts[0] === importToken) {
                    if (log) 
                    consoleLog('encountered ' + importToken);
        
                    if (isImporting) {
                        throwNotImplemented('Encountered include token while including');
                    }
        
                    if (parts.length === 1) {
                        throwNotImplemented('expecting filename after token ' + importToken);
                    }
                    
                    isImporting = true;
                    importSubstitutions = {};
        
                    if (log) consoleLog(summarize({remaining,parts}));
        
                    let fileName = parts[0];
        
                    let imported = fileToGrammar(fileName);
        
                    let importSubstitutions = {};
        
                    let before;
                    for (let part of parts.slice(1)) {
                        if (isUndefined(before)) {
                            before = part[0];
                        }
                    }

                    throwNotImplemented('TODO');
                }
                
                if (trimmed.indexOf(ruleToken) >= 0) {
        
                    if (log)
                    if (verbose)
                    consoleLog('is rule');    
        
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
                    return;
                }

                if (log)
                if (verbose) 
                consoleLog({parts});
        
                if (log)
                if (verbose) 
                consoleLog('is proof step; pushing to proofBuilder');
        
                proofBuffer.push(textToSide(trimmed, lineNumber));
            });
        }
    
    
        if (proofBuffer.length !== 0) {
            tryAddProofAndClearProofBuffer();
        }
    
        exitIfNot(isValidGrammar)(grammar);
    
        function textToSide(trimmed, lineNumber) {
            return {
                text: trimmed,
                lineNumber,
            };
        }
    
        // Try - will not add if proof buffer is empty
        function tryAddProofAndClearProofBuffer() {
    
            if (log)
            if (verbose)
            consoleLog('addProofAndClearProofBuffer: entered; ' + summarize({proofBuffer}));
            
            // Do not process if there are no steps.
            if (proofBuffer.length === 0) return;
            
            addProof(grammar, proofBuffer, fileName, lineNumber);
    
            proofBuffer = [];
        }
    });

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

// files is optional
// grammar is optional
// returns grammar
function fileToGrammar(fileName, files, grammar) {
    let log = false;

    if (log) 
    console.log('checkFile entered', { 
        fileName});

    exitIfNot(isString, 'checkFile: fileName needs to be specified')(fileName);

    let text = readTextFile(fileName);

    if (log) 
    console.log('checkFile calling parseGrammar', { 
        fileName, 'text.length': text.length, files, grammar});
    
    grammar = parseGrammar(text, fileName, files, grammar);

    return grammar;
}

function substituteRule(rule, premise, index) {
    exitIfNot(isValidRule)(rule);
    exitIfNot(isString)(premise);
    exitIfNot(isArrayIndex)(premise, index);

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
    exitIfNot(isDefined)(result);
    exitIfNot(isEqual)(result.success, true);
    exitIfNot(isEqual)(result.substituted, 'addc');
    
    result = substituteRule(rule, 'abc', 0);
    exitIfNot(isDefined)(result);
    exitIfNot(isEqual)(result.success, false);

    result = substituteRule(rule, 'abc', 2);
    exitIfNot(isDefined)(result);
    exitIfNot(isEqual)(result.success, false);
    
})();

function attemptToProve(grammar, premise, conclusion, fileName, layersDeep) {
    let log = false;
    let verbose = true;

    exitIfNot(isValidGrammar)(grammar);
    exitIfNot(isString)(premise);
    exitIfNot(isString)(conclusion);

    if (premise === conclusion) {
        throw new Error('premise is equal to conclusion');
    }

    if (isUndefined(layersDeep)) {
        layersDeep = 3;
    }

    if (isUndefined(fileName)) {
        fileName = 'no file name';
    }

    let result = {
        success: true,
    };

    // Check for already proved.
    for (let rule of grammar.rules) {
        if (premise === rule.left.text 
            && conclusion === rule.right.text) {
            result.existing = rule;
            return result;
        }
    }

    let proofTexts = [];

    let success = false;
    for (let l of range(layersDeep, 1)) {
        if (log)
        if (verbose)
        console.log('attemptToProve: trySubstitutions ' + JSON.stringify({ l }));

        if (trySubstitutions(premise, l)) {
            if (log)
            if (verbose)
            console.log('attemptToProve: trySubstitutions found');

            success = true;
            break;
        }
    }
    if (!success) {
        result.success = false;
        return result;
    }

    result.proof = [];
    for (let t of proofTexts) {
        result.proof.push({ text: t });
    }

    addProof(grammar, result.proof, fileName);

    return result;

    function trySubstitutions(premise, n) {
        if (n <= 1) {
            return;
        }

        proofTexts.push(premise);
        
        for (let substitution of getSubstitutions(premise)) {
            proofTexts.push(substitution);
            if (substitution === conclusion) {
                return true;
            }
            proofTexts.pop();
            
            if (trySubstitutions(substitution, n - 1)) {
                return true;
            }
        }

        proofTexts.pop();
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

// Does not check proof validity
function addProofToFile(fileName, proof) {
    exitIfNot(isString)(fileName);
    exitIfNot(isArray)(proof);
    for (let p of proof) {
        exitIfNot(isProof)(p);
    }

    fs.appendFileSync(fileName, '\n');
    fs.appendFileSync(fileName, '\n');
    for (let p of proof) {
        fs.appendFileSync(fileName, p.text);
        fs.appendFileSync(fileName, '\n');
    }
}

(function test() {
    let fileName = 'v2/reverse2.g';
    let grammar = fileToGrammar(fileName);

    let premise;
    let conclusion;
    let result;

    premise = '(1)c';
    conclusion = '(c1)';
    result = attemptToProve(grammar, premise, conclusion);
    exitIfNot(isDefined)(result);
    exitIfNot(isDefined)(result.existing);
})();

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



// TODO: compress proofs; don't worry about length
// Grammar: rename symbol

// TODO: re-arrange order of proofs to compress

// TOOD: check for atomic symbols/ambguity
// For example if [m] is a sequence, it should always appear together
// If another token is a subtoken of any token-pair
// for example a[b c]d and [bc] then ambiguous