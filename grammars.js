const fs = require('fs');

const specialToken = '#';
const ruleToken = '|';
const includeToken = specialToken + 'include'
const importToken = specialToken + 'import'

module.exports = {
    fileToGrammar,
    parseGrammar,
    attemptToProve,
    isValidGrammar,
    isValidProof,
    ruleToken,
    substituteRule,
    isValidRule,
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
    loop,
    range,
    readTextFile,
    summarize,
    exitIfNot,
    throwNotImplemented,
    throws,
}
= require('./utilities');

// TODO: Whitespace abstraction/as a constant/tokenization.

function isValidRule(rule) {
    let log = true;
    let verbose = false;

    logIndent(() => {
        if (verbose)
        if (log) {
            consoleLog('isValidRule entered');
        }
    
        if (!isDefined(rule)) {
            if (log) {
                consoleLog({rule});
                consoleLog('isValidRule: expecting rule to be defined');
            }
            return false;
        }
    
        if (!isDefined(rule.left)) {
            if (log) {
                consoleLog({rule});
                consoleLog('isValidRule: expecting left to be defined.');
            }
            return false;
        }
    
        if (!isValidSide(rule.left.text)) {
            if (log) {
                consoleLog({rule});
                consoleLog('isValidRule: expecting left to be valid side.');
            }
            return false;
        } 
    
        if (!isDefined(rule.right)) {
            if (log) {
                consoleLog({rule});
                consoleLog('isValidRule: expecting right to be defined.');
            }
            return false;
        }
        
        if (!isValidSide(rule.right.text)) {
            if (log) {
                consoleLog({rule});
                consoleLog('isValidRule: expecting right to be valid side.');
            }
            return false;
        } 
        
        // Redundant rule
        if (rule.left.text === rule.right.text) {
            if (log) {
                consoleLog({rule});
                consoleLog('isValidRule: left and right sides of rule cannot be the same.');
            }
            return false;
        }
    });

    return true;
}

function isValidSide(side) {
    let log = true;

    let result = true;

    logIndent(() => {
        if (!isDefined(side)) {
            if (log) {
                consoleLog('isValidSide: expecting side to be defined');
            }
            result = false;
            return;
        }
    
        if (!isString(side)) {
            if (log) {
                consoleLog('isValidSide: expecting side to be string');
            }
            result = false;
            return;
        }
    
        if (side.indexOf(' ') >= 0) {
            if (log) {
                consoleLog('isValidSide: expecting side to not contain spaces');
            }
            result = false;
            return;
        }
    });

    return result;
}


function isValidSubstitution(rule, index, previous, current) {
    let log = false;
    let verbose = true;

    if (log) consoleLog('isValidSubstitution entered');

    let result = {
        success: true,
    }
    logIndent(() => {
        if (log) consoleLog({ index, previous, current, rule });

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

        if (log) consoleLog({ left, right });

        if (previous.length - left.length !== current.length - right.length) {
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

    if (log) consoleLog('isValidGrammar entered');

    let success;
    
    logIndent(() => {
        if (isUndefined(grammar)) {
            if (log) {
                consoleLog({grammar});
                consoleLog('grammar needs to be defined');
            }
            success = false;
            return;
        }
    
        if (isUndefined(grammar.rules)){
            if (log) {
                consoleLog({grammar});
                consoleLog('grammar rules need to be defined');
            }
            success = false;
            return;
        }
        if (!isArray(grammar.rules)){
            if (log) {
                consoleLog({grammar});
                consoleLog('grammar rules need to be array');
            }
            success = false;
            return;
        }
    
        if (grammar.rules.length < 1) {
            if (log) {
                consoleLog({grammar});
                consoleLog('grammar needs at least 1 rule');
            }
            success = false;
            return;
        }
    
        for (let r of grammar.rules) {
            if (!isValidRule(r)) {
                if (log) {
                    consoleLog({grammar});
                    consoleLog({r});
                    consoleLog('expecting r to be valid rule');
                }
                success = false;
                return;
            }
        }
    
        for (let r of grammar.rules) {
            for (let q of grammar.rules) {
                if (r === q) {
                    continue;
                }
                if (r.left.text === q.left.text && r.right.text === q.right.text) {
                    if (log) {
                        consoleLog('Duplicate rules');
                        consoleLog({ r });
                        consoleLog({ q });
                    }
                    success = false;
                    return;
                }
            }
        }
    
        success = true;
    });

    exitIfNot(success);

    if (log) consoleLog('isValidGrammar leaving');

    return success;
}

function isProof(p) {
    exitIfNot(isDefined)(p);
    exitIfNot(isString, 'p.text')(p.text);
    return true;
}

function isValidProof(grammar, proof, fileName) {
    let log = false;
    let verbose = false;

    let result = {};

    if (log) consoleLog('isValidProof entered');
    logIndent(() => {
        if (log) {
            let proofTexts = proof.map(p => p.text);
            consoleLog({proofTexts});
            if (verbose) console.log(JSON.stringify({grammar}, ' ', 2));
        }

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
        if (log) consoleLog('checking each proof step');
        loop(proof, p => {
            previous = current;
            current = p;

            // The first is current is valid.
            if (isUndefined(previous.text)) {
                if (log) 
                if (verbose)
                consoleLog('first proof step is always valid')
                return;
            }

            valid = false;
            if (log) 
            if (verbose)
            consoleLog({valid});
            loop(grammar.rules, r => {
                loop(previous.text, (t, i) => {
                    substitutionResult = isValidSubstitution(r, i, previous.text, current.text);
                    
                    if (log) 
                    if (verbose)
                    consoleLog({substitutionResult});

                    valid = substitutionResult.success;
                    
                    if (valid) {
                        return true;
                    }
                }, log && verbose);
                if (valid) {
                    return true;
                }
            }, log && verbose);

            if (!valid) {
                return true;
            }
        }, log && verbose);

        result.valid = valid;
        if (log) {
            consoleLog({substitutionResult});
            consoleLog({result});
        }
        exitIfNot(result.valid);
    });

    if (log) consoleLog('isValidProof leaving')

    return result;
}

function addProof(grammar, proof, fileName, lineNumber) {
    // TODO: make sure grammar is self-consistent??

    let log = false;

    if (log) consoleLog('addProof entered');
    logIndent(() => {
        if (isUndefined(lineNumber)) {
            lineNumber = -1;
        }
    
        let result = isValidProof(grammar, proof, fileName);
        if (!result.valid) {
            if (log) consoleLog('invalid proof');
            if (log) consoleLog({result});
        }
        exitIfNot(result.valid);
    
        // If proof is valid, add it as a new grammar rule.
        let left = proof[0];
        let right = proof[proof.length - 1];
        let rule = { 
            left, 
            right,
            fileName,
        };
        grammar.rules.push(rule);
    });
    if (log) consoleLog('addProof leaving');
}

function parseGrammar(text, fileName, files, grammar) {
    let log = false;
    let verbose = true;

    if (log) consoleLog('parseGrammar entered');
    logIndent(() => {
        exitIfNot(isString)(text);

        if (log) consoleLog({fileName});

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
        let importSubstitutions;
    
        let lineNumber = 0;
        loop(lines, (line, lineNumber) => {

            let trimmed = line.trim();
        
            let parts = line.split(' ')
                .map(s => s.trim())
                .filter(isStringNonEmpty);

            if (log) 
            if (verbose)
            consoleLog({parts});
    
            // #
            if (parts[0] === specialToken) {
                if (log) consoleLog('special token ' + specialToken);
                if (isImporting) {
                    if (parts.length === 0) {
                        throwNotImplemented();
                    } else if (parts.length === 1) {
                        // A single # is the end of an include section
                        isImporting = false;
                        if (log) consoleLog('not importing');

                        if (log) consoleLog({importSubstitutions});
                    } else if (parts.length === 2) {
                        // Invalid, we need to know what symbol to substitute
                        throwNotImplemented('Expecting token after ' + parts[1]);
                    } else if (parts.length >= 3) {
                        let key = parts[1];
                        // Skip 2: # and key
                        let value = arraySkip(parts, 2);
                        if (importSubstitutions[key]) {
                            throwNotImplemented('Duplicate defined symbol in ' + parts[1]);
                        }
    
                        if (log) consoleLog({key, value});
                        importSubstitutions[key] = value;
    
                        // TODO: ensure key is part of target grammar file.
                    }
                }
                return;
            }
                
            if (parts[0] === includeToken) {
                if (parts.length !== 2) {
                    throwNotImplemented('expecting parts.length to be 2');
                }

                let includeFileName = parts[1].trim();
    
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
                    throwNotImplemented('Encountered import token while including');
                }
    
                if (parts.length === 1) {
                    throwNotImplemented('expecting filename after token ' + importToken);
                }
                
                isImporting = true;
    
                let fileName = parts[1];
    
                let imported = fileToGrammar(fileName);
                if (log) {
                    consoleLog({imported});
                    let ruleLefts = imported.rules.map(r => r.left.text);
                    consoleLog({ruleLefts});
                }
    
                importSubstitutions = {};

                return;
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

            let step = textToSide(trimmed, lineNumber);
            if (log)
            if (verbose) 
            consoleLog({step});

            if (step.text.length === 0) {
                if (log)
                if (verbose) 
                consoleLog('is not proof step');
    
                if (proofBuffer.length !== 0) {
                    tryAddProofAndClearProofBuffer();
                }    

            } else {
                if (log)
                if (verbose) 
                consoleLog('is proof step; pushing to proofBuilder');
        
                proofBuffer.push(step);
            }    
        }, log);
    
        // Try to empty the buffer in case the file is missing
        // an ending new line.
        tryAddProofAndClearProofBuffer();

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
            consoleLog('tryAddProofAndClearProofBuffer entered');

            logIndent(() => {
                if (log)
                if (verbose)
                consoleLog({proofBuffer});

                // Do not process if there are no steps.
                if (proofBuffer.length === 0) return;
                
                addProof(grammar, proofBuffer, fileName, lineNumber);
        
                proofBuffer = [];
            });    

            if (log)
            if (verbose)
            consoleLog('tryAddProofAndClearProofBuffer leaving');
        }
    });

    if (log) consoleLog('parseGrammar leaving');

    return grammar;
}

// files is optional
// grammar is optional
// returns grammar
function fileToGrammar(fileName, files, grammar) {
    let log = false;

    if (log) 
    consoleLog('fileToGrammar entered', { 
        fileName});

    exitIfNot(isString, 'fileToGrammar: fileName needs to be specified')(fileName);

    let text = readTextFile(fileName);

    if (log) 
    consoleLog('fileToGrammar calling parseGrammar', { 
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
        consoleLog('attemptToProve: trySubstitutions ' + JSON.stringify({ l }));

        if (trySubstitutions(premise, l)) {
            if (log)
            if (verbose)
            consoleLog('attemptToProve: trySubstitutions found');

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




// TODO: compress proofs; don't worry about length
// Grammar: rename symbol

// TODO: re-arrange order of proofs to compress

// TOOD: check for atomic symbols/ambguity
// For example if [m] is a sequence, it should always appear together
// If another token is a subtoken of any token-pair
// for example a[b c]d and [bc] then ambiguous

consoleLog('grammars complete');