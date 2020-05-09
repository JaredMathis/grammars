const fs = require('fs');

module.exports = {
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
    onOff,
    processExit,
    range,
    readTextFile,
    summarize,
    exitIfNot,
    throwNotImplemented,
    throws,
}
;

let indent = 0;

function throwNotImplemented(message) {
    throw new Error('not implemented: ' + message);
}

function isUndefined(n) {
    return typeof(n) === 'undefined';
}

function isDefined(n) {
    return !isUndefined(n);
}

function throwMessage(message) {
    throw new Error(message);
}

/**
 * This is a function so it's only in one spot.
 */
function processExit() {
    console.log('calling process.exit(1)');
    process.exit(1);
}

function exitIfNot(lambda, message, exitLambda, value) {
    let log = false;
    let verbose = true;
    let logErrorMessage = true;
    let logErrorStack = false;

    if (log)
    if (verbose)
    console.log('exitIfNot: entered; ' + JSON.stringify({ value, message }));

    if (!isDefined(exitLambda)) {
        exitLambda = processExit;
    }

    if (lambda === false) {
        lambda = () => false;
        resultLambda();
        return;
    }

    if (!isDefined(lambda)) {
        throw new Error('Expecting lambda to be defined: ' + lambda);
    }
    if (isDefined(message)) {
        if (message.toString() !== message) {
            throw new Error('Message is defined. Expecting string: ' + message);
        }
    }

    if (log)
    if (verbose)
    console.log('exitIfNot: leaving; ' + message);

    return resultLambda;
    
    function resultLambda() {
        let result;
        try {
            if (log)
            if (verbose)
            console.log('  exitIfNot: resultLambda calling lambda ' + message);

            result = lambda.apply(null, arguments);

            if (log)
            if (verbose)
            console.log('  exitIfNot: resultLambda lambda called ' + message);

        } catch (e) {

            if (log)
            if (verbose)
            console.log('  exitIfNot: resultLambda exception ' + message);

            let errorMessage = getErrorMessage(arguments, result, e);
            throw new Error(errorMessage);
        }

        if (!result) {
            let errorMessage = getErrorMessage(arguments, result);

            if (exitLambda === processExit) {
                if (logErrorMessage) {
                    let l = 
                    console.log('  exitIfNot: calling exitLambda; message: ' + message);
                    console.log('    errorMessage: ');
                    console.log('      ' + errorMessage);
                }
                if (logErrorStack) {                
                    let stack = new Error().stack;
                    console.log(stack);
                }
            }
            
            exitLambda(errorMessage);
        }
    }

    function getErrorMessage(args, result, inner) {
        let extra = isDefined(inner) ? "; " + inner : "";

        let errorMessage = "";

        if (message) {
            errorMessage += message;
            errorMessage += '; ';
        }

        errorMessage += 'Called ' + summarize(lambda.name);
        errorMessage += '. Expecting truth-y. Got: ' + JSON.stringify(result);

        errorMessage += ";\n";
        let prefix = "    ";
        errorMessage += prefix + "Arguments:\n";
        prefix += "  ";
        for (let index in args) {
            errorMessage += prefix;
            let m = {};
            m[index] = args[index];
            errorMessage += JSON.stringify(m);
            errorMessage += "\n";
            index++;
        }
        if (args.length === 0) {
            errorMessage += prefix;
            errorMessage += "{}";
        }

        errorMessage += extra;

        return errorMessage;
    }
}


function isEqual(a, b) {
    exitIfNot(isDefined)(a);
    exitIfNot(isDefined)(b);
    return a === b;
}

function isInteger(n) {
    exitIfNot(isDefined, 'Expecting n to be defined: ' + n)(n);

    //console.log('isInteger ' + typeof(n) + ' ' + n);

    let result = parseInt(n, 10) === n;

    return result;
}

function isAtLeast(n, i) {
    //console.log('isAtLeast ' + typeof(n) + ' ' + n);

    exitIfNot(isInteger, ' expecting n to be integer: ' + n)(n);
    exitIfNot(isInteger, ' expecting i to be integer: ' + i)(i);

    return n >= i;

}

function isAtMost(n, i) {
    return isAtLeast(i, n);
}

function range(count, offset) {
    exitIfNot(isInteger)(count);
    exitIfNot(isAtLeast)(count, 0);

    if (isUndefined(offset)) {
        offset = 0;
    }

    let result = [];
    for (let i = 0; i < count; i++) {
        result.push(i + offset);
    }

    return result;
}

function isEqualJson(a, b) {
    let aJson = JSON.stringify(a);
    let bJson = JSON.stringify(b);
    return aJson === bJson;
}

exitIfNot(isEqualJson)(range(0), []);
exitIfNot(isEqualJson)(range(1), [0]);
exitIfNot(isEqualJson)(range(2), [0, 1]);
exitIfNot(isEqualJson)(range(3), [0, 1, 2]);
exitIfNot(isEqualJson)(range(3, 1), [1, 2, 3]);



function isString(n) {
    exitIfNot(isDefined, 'Expecting n to be defined: ' + n)(n);
    return n.toString() === n;
}

exitIfNot(isEqual)(isString('01'), true);
exitIfNot(isEqual)(isString(''), true);
exitIfNot(isEqual)(isString(1), false);

/**
 * If lambda() does not throw, returns false.
 * Otherwise:
 *  If there is an error message, returns the error message.
 *  Otherwise returns true.
 * @param {*} lambda 
 */
function throws(lambda) {
    try {
        lambda();
    } catch (e) {
        return e.toString() || true;
    }
    return false;
}

function isArray(array) {
    exitIfNot(isDefined, 'Expecting array to be defined: ' + array)(array);
    return Array.isArray(array);
} 

exitIfNot(isEqual)(isArray([]), true);
exitIfNot(isEqual)(isArray([1,2,3]), true);
exitIfNot(isEqual)(isArray('a'), false);

function isArrayIndex(array, index) {
    exitIfNot(isInteger)(index);

    if (isString(array) || isArray(array)) {
        return isAtLeast(index, 0) && isAtMost(index, array.length - 1);
    }

    return false;
}

// TODO: make more efficient
function isDistinct(array, isEqualLambda) {
    exitIfNot(isArray)(array);

    if (isUndefined(isEqualLambda)) {
        isEqualLambda = isEqual;
    }

    for (let i of range(array.length)) {
        for (let j of range(array.length)) {
            if (j <= i) {
                continue;
            }
            if (isEqualLambda(array[i], array[j])) {
                return false;
            }
        }
    }

    return true;
}

exitIfNot(isEqual)(isDistinct([]), true);
exitIfNot(isEqual)(isDistinct([1]), true);
exitIfNot(isEqual)(isDistinct([1,2]), true);
exitIfNot(isEqual)(isDistinct([1,2,'2']), true);
exitIfNot(isEqual)(isDistinct([1,2,2]), false);

function arraySkip(array, skipCount) {
    let log = false;

    if (log) console.log('arraySkip entered ' + JSON.stringify({array, skipCount}))

    exitIfNot(isArray)(array);
    exitIfNot(isInteger)(skipCount);

    if (array.length === 0) {
        exitIfNot(isEqual)(skipCount, 0);
        return [];
    }    

    exitIfNot(isArrayIndex)(array, skipCount);

    let result = [];
    for (let i = skipCount; i < array.length; i++) {
        result.push(array[i]);
    }

    return result;
}

exitIfNot(isEqualJson)([1], arraySkip([1], 0));
exitIfNot(isEqualJson)([2], arraySkip([1, 2], 1));
exitIfNot(isEqualJson)([], arraySkip([], 0));

// TODO: replace fs.existsSync with this function
function readTextFile(fileName) {
    exitIfNot(isString)(fileName);

    if (!fs.existsSync(fileName)) {
        consoleLog('readTextFile: file does not exist: ' + fileName);
        processExit();
    }

    let result = fs.readFileSync(fileName, 'utf8');
    return result;
}

/**
 * CAnnot call consoleLog
 * @param {*} o 
 */
function summarize(o) {
    let log = false;
    if (log) console.log('summarize entered');

    let maxStringLength = 150;

    let result = "";

    if (isUndefined(o)) {
        result += "[undefined]";
        return result;
    }

    if (o === false) {
        result += "false";
        return result;
    }
    if (o === true) {
        result += "true";
        return result;
    }

    if (isString(o)) {
        if (o.length === 0) {
            result += "[empty string]";
            return result;
        }

        if (o === " ") {
            o = `"${o}"`;
        }
        
        let continuation = "...";

        if (o.length > maxStringLength) {
            result += o.slice(0, maxStringLength - continuation.length) + continuation;
        } else {
            result += o;
        }
        return result;
    }
    if (isArray(o)) {
        let result = "array ";
        if (o.length === 0) {
            result += "[]";
            return result;
        }
        result += o.length;
        result += ' items';
        let i = 0;
        while (result.length < maxStringLength && i < o.length) {
            result += ` [${i}]=` + summarize(JSON.stringify(o[i]));
            i++;
        }
        return summarize(result);
    }

    if (isInteger(o)) {
        return o.toString();
    }

    let keys = Object.keys(o);

    if (keys.length === 0) {
        if (log) console.log('  keys.length===0 ');
    } 
    let summary = "{" + keys.map(k => summarizeProperty(o, k)).join(', ') + "}";
    return summarize(summary);

    function summarizeProperty(o, key) {
        let valueSummary = summarize(o[key]);
        let summary = key + ": " + valueSummary;
        return summarize(summary);
    }
}

function isStringNonEmpty(s) {
    return isString(s) 
        && s.length > 0;
}

function logIndent(lambda) {
    exitIfNot(isDefined(lambda));

    indent++;
    lambda();
    indent--;
}
/**
 * Logs to console. 
 * Indents messages. To indent call logIndent(). 
 * Summarizes the log message.
 * Cannot call exitIfNot.
 * @param {*} message 
 */
function consoleLog(message) {
    let summary = summarize(message);

    let result = summary;

    // Indent left
    for (let i of range(indent)) {
        result = "  " + result;
    }

    console.log(result);
}

function isPositive(i) {
    return isInteger(i) && i > 0;
}

function clone(o) {
    return JSON.parse(JSON.stringify(o));
}

function max(array) {
    exitIfNot(isArray)(array);

    exitIfNot(isPositive)(array.length);

    let max = array[0];
    for (let a of array) {
        exitIfNot(isInteger)(a);

        if (a > max) {
            max = a;
        }
    }

    return max;
}

exitIfNot(isEqual)(max([1]), 1)
exitIfNot(isEqual)(max([1,2]), 2)
exitIfNot(isEqual)(max([1,2,1]), 2)
exitIfNot(isEqual)(max([1,2,3,1]), 3)
exitIfNot(isEqual)(max([1,2,4,3,1]), 4)

function chooseAtMost(array, count) {
    exitIfNot(isArray)(array);
    exitIfNot(isInteger)(count);

    if (count > array.length) {
        count = array.length;
    }

    return choose(array, count);
}

function choose(array, count, except) {
    let log = false;
    if (log) consoleLog('choose entered ' + JSON.stringify({array,count,except}));

    exitIfNot(isArray)(array);
    exitIfNot(isPositive)(array.length);
    
    exitIfNot(isInteger)(count);
    exitIfNot(isPositive)(count);

    if (count > array.length) {
        throwNotImplemented();
    }

    let result = [];

    logIndent(() => {
    
        if (isUndefined(except)) {
            except = [];
        }
        exitIfNot(isArray)(except);
        for (let e of except) {
            exitIfNot(isInteger)(e);
            exitIfNot(isPositive)(e);
        }
        
        for (let i of range(array.length, 1)) {
            if (except.length >= 1) {
                let m = max(except);
        
                if (i <= m) {
                    continue;
                }
            }
    
            if (count === 1) {
                let choice = except.map(e => array[e - 1]).concat([array[i - 1]]);
                if (log) consoleLog('choosing single ' + JSON.stringify(choice));
                result.push(choice);
                continue;
            }
    
            let e = clone(except);
            e.push(i);
            logIndent(() => {
                for (let choice of choose(array, count - 1, e)) {
                    if (log) consoleLog('choosing ' + JSON.stringify({choice}));                    
                    result.push(choice);
                }
            });
        }
    });

    return result;
}


function onOff(array, on, off) {
    exitIfNot(isArray)(array);

    let remaining = array.slice(1);
    
    let result = [];

    if (array.length === 0) {
        result.push([]);
    } else {
        for (let b of onOff(remaining, on, off)) {
            result.push([on(array[0])].concat(b));
            result.push([off(array[0])].concat(b));
        }        
    }

    return result;
}

exitIfNot(isEqualJson)(onOff([], a => a, a => -a), [[]])
exitIfNot(isEqualJson)(onOff([1], a => a, a => -a), [[1], [-1]])
exitIfNot(isEqualJson)(onOff([1,2], a => a, a => -a), [[1,2],[-1,2],[1,-2],[-1,-2]])
exitIfNot(isEqualJson)(onOff([1,2,3], a => a, a => -a), [[1,2,3],[-1,2,3],[1,-2,3],[-1,-2,3],[1,2,-3],[-1,2,-3],[1,-2,-3],[-1,-2,-3]])

function ensureKeyExists(o, key, valueLambda) {
    let log = false;

    if (log) consoleLog('ensureKeyExists entered');

    exitIfNot(isDefined)(o);
    exitIfNot(isDefined)(key);

    logIndent(() => {
        if (!o.hasOwnProperty(key)) {
            let value = valueLambda();
            if (log) consoleLog(value);
            o[key] = value;
        }
    })
}

(function test() {
    let o = {};
    ensureKeyExists(o, 1, () => 2);
    exitIfNot(isEqualJson)(o, {"1":2});

    let a = [];
    ensureKeyExists(a, 1, () => 2);
    exitIfNot(isEqualJson)(a, [undefined, 2]);

    let result = {};
    let pJson = "123";
    ensureKeyExists(result, pJson, function () { return {} });
    exitIfNot(isEqualJson)(result, {"123":{}});
})();

function loop(array, lambda, log) {
    if (log) consoleLog('loop');

    if (isString(array)) {
        array = [...array];
    }
    exitIfNot(isArray)(array);

    exitIfNot(isDefined)(lambda);
    exitIfNot(isDefined)(log);

    logIndent(() => {
        let index = 0;

        for (let item of array) {
            if (log) consoleLog({index, item});

            let b;
            logIndent(() => {
                b = lambda(item, index);
            });
            if (b) {
                break;
            }
            index++;
        }

        if (log) consoleLog(index + ' loop iterations');
    });
}

// Test the console-logging of loop()
(function test() {
    let consoleLogOld = consoleLog;

    let logs = [];
    consoleLog = m => logs.push(m);
    loop([3,4], a => {}, true);
    exitIfNot(isEqualJson)(logs, ["loop",{"index":0,"item":3},{"index":1,"item":4},"2 loop iterations"]);

    consoleLog = consoleLogOld;
})();