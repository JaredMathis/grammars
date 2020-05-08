
const {
    arraySkip,
    choose,
    chooseAtMost,
    consoleLog,
    ensureKeyExists,
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
    max,
    range,
    readTextFile,
    summarize,
    exitIfNot,
    throwNotImplemented,
    throws,
    onOff,
}
= require('./utilities');

function isValidSatVariable(variable) {
    if (!isDefined(variable)) {
        return false;
    }

    if (!isInteger(variable)) {
        return false;
    }

    if (variable === 0) {
        return false;
    }

    return true;
}

exitIfNot(isEqual)(isValidSatVariable(undefined), false);
exitIfNot(isEqual)(isValidSatVariable('a'), false);
exitIfNot(isEqual)(isValidSatVariable(1), true);
exitIfNot(isEqual)(isValidSatVariable(-1), true);
exitIfNot(isEqual)(isValidSatVariable(0), false);

function isValidSatClause(clause) {
    if (!isArray(clause)) {
        return false;
    }

    for (let variable of clause) {
        if (!isValidSatVariable(variable)){
            return false;
        }
    }

    if (!isDistinct(clause)) {
        return false;
    }

    return true;
}

// Must be array
exitIfNot(isEqual)(isValidSatClause(1), false);
exitIfNot(isEqual)(isValidSatClause([]), true);
// Must contain variables
exitIfNot(isEqual)(isValidSatClause([1]), true);
exitIfNot(isEqual)(isValidSatClause([1,2,3]), true);
exitIfNot(isEqual)(isValidSatClause(['a']), false);
// Must be unique
exitIfNot(isEqual)(isValidSatClause([1,2,3,3]), false);

function isValidSat(sat) {
    if (!isArray(sat)) {
        return false;
    }

    if (sat.length < 1) {
        return false;
    }

    for (let clause of sat) {
        if (!isValidSatClause(clause)) {
            return false;
        }
    }

    return true;
}

// Must be array
exitIfNot(isEqual)(isValidSat(1), false);
// Must contain numbers
exitIfNot(isEqual)(isValidSat([[1]]), true);
exitIfNot(isEqual)(isValidSat(['a']), false);
// Must have at least 1 clause
exitIfNot(isEqual)(isValidSat([]), false);


function isValid3Sat(sat) {
    if (!isValidSat(sat)) {
        return false;
    }

    for (let clause of sat) {
        if (clause.length > 3) {
            return false;
        }
    }

    return true;
}

exitIfNot(isEqual)(isValid3Sat(1), false);
exitIfNot(isEqual)(isValid3Sat([]), false);
exitIfNot(isEqual)(isValid3Sat([[1]]), true);
exitIfNot(isEqual)(isValid3Sat([[1,2,3]]), true);
exitIfNot(isEqual)(isValid3Sat([[1,2,3,4]]), false);

/**
 * Gets the SAT variable.
 * -1 -> 1
 * 1 -> 1
 * @param {*} variable 
 */
function getSatVariable(variable) {
    exitIfNot(isValidSatVariable)(variable);
    return Math.abs(variable);
}

function getSatVariables(sat) {
    exitIfNot(isValidSat)(sat);

    let result = {};
    for (let clause of sat) {
        for (let variable of clause) {
            let v = getSatVariable(variable);
            result[v] = true;
        }
    }
    let variables = Object
        .keys(result)
        .map(i => parseInt(i, 10));
    variables.sort();
    return variables;
}

exitIfNot(isEqualJson)(getSatVariables([[3,2,1]]), [1,2,3]);
exitIfNot(isEqualJson)(getSatVariables([[3,2,1],[-3,-2]]), [1,2,3]);

function to3Sat(sat) {
    let variables = getSatVariables(sat);

    throwNotImplemented('to3Sat');
}

function toPossibilities(sat) {
    let log = false;
    if (log) consoleLog('toPossibilities entered');

    exitIfNot(isValid3Sat)(sat);

    let result = {};

    logIndent(() => {
        for (let c of sat) {
            for (let v of c) {
                for (let w of c) {
                    if (w === v) {
                        continue;
                    }
    
                    let p = [-v, -w];
                    p.sort();
                    let pJson = JSON.stringify(p);
                    ensureKeyExists(result, pJson, function () { return {}; });
                    if (log) consoleLog({result});
    
                    for (let x of c) {
                        if (x === v || x === w) {
                            continue;
                        }
    

                        ensureKeyExists(result[pJson], x, function () { return {}; });
                        result[pJson][x] = true;
                    }
                }
            }
        }
    });

    return result;
}

exitIfNot(isEqualJson)(toPossibilities([[3,2,1]]), {"[-2,-3]":{"1":true},"[-1,-3]":{"2":true},"[-1,-2]":{"3":true}});
exitIfNot(isEqualJson)(toPossibilities([[3,2,1],[3,2,-1]]), {"[-2,-3]":{"1":true,"-1":true},"[-1,-3]":{"2":true},"[-1,-2]":{"3":true},"[-3,1]":{"2":true},"[-2,1]":{"3":true}});
exitIfNot(isEqualJson)(toPossibilities([[3,2,1],[3,2,-1],[3,-2,1],[3,-2,-1]]), {"[-2,-3]":{"1":true,"-1":true},"[-1,-3]":{"2":true,"-2":true},"[-1,-2]":{"3":true},"[-3,1]":{"2":true,"-2":true},"[-2,1]":{"3":true},"[-3,2]":{"1":true,"-1":true},"[-1,2]":{"3":true},"[1,2]":{"3":true}});

function bruteForce(variables) {
    return onOff(variables, a => a, a => -a);
}

function contradicts(combination, possibilities, variable) {
    let log = false;
    if (log) consoleLog('contradicts entered');

    let result = false;

    loop(chooseAtMost(combination, 2), c => {
        c.sort();
        let key = JSON.stringify(c);
        let v = possibilities[key];
        if (log) consoleLog({variable,possibilities});
        if (isDefined(v)) {
            if (v[variable] && v[-variable]) {
                result = true;
            }
        } 
    });

    return result;
}

function isValidAll3Sat(sat) {
    if (!isValidSat(sat)) {
        return false;
    }

    for (let clause of sat) {
        if (clause.length !== 3) {
            return false;
        }
    }

    return true;
}

/**
 * Ensures clauses have length exactly 3.
 * @param {*} sat 
 */
function toAll3Sat(sat) {
    let log = false;
    if (log) consoleLog('toAll3Sat entered');

    let result = [];
    logIndent(() => {
        if (log) consoleLog({sat});

        exitIfNot(isValidSat)(sat);

        if (!isValid3Sat(sat)) {
            sat = to3Sat(sat);
        }
    
        let variables = getSatVariables(sat);
        // TODO: ensure this is in max int range
        let variable0 = max(variables) + 1;
        let variable1 = variable0 + 1;
        if (log) consoleLog({variable0, variable1});
    
        loop(sat, clause => {
            if (log) consoleLog({clause});

            if (clause.length == 1) {
                result.push([clause[0], variable0, variable1]);
                result.push([clause[0], variable0, -variable1]);
                result.push([clause[0], -variable0, variable1]);
                result.push([clause[0], -variable0, -variable1]);
                return true;
            } 
            if (clause.length === 2) {
                result.push([clause[0], clause[1], variable0]);
                result.push([clause[0], clause[1], -variable0]);
                return true;
            }
            result.push(clause);
        });

        if (log) consoleLog({result});
    });

    return result;
}

function satisfied(sat) {
    exitIfNot(isValidSat)(sat);

    if (!isValidAll3Sat(sat)) {
        sat = toAll3Sat(sat);
    }

    let possibilities = toPossibilities(sat);

    let variables = getSatVariables(sat);

    let variablesOf4 = chooseAtMost(variables, 4);

    let allValid = true;
    for (let _4variables of variablesOf4) {
        for (let combination of bruteForce(_4variables)) {
            for (let variable of variables) {
                let isValid = true;
                if (contradicts(combination, possibilities, variable)) {
                    isValid = false;
                }
                if (!isValid) {
                    allValid = false;
                    break;
                }

                break;
            }
        }
        if (!allValid) {
            return false;
        }
    }

    return true;
}

exitIfNot(isEqual)(satisfied([[1],[-1]]), false);



