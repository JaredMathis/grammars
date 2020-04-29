const fs = require('fs');

module.exports = {
    arraySkip,
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
    consoleLog,
    range,
    readTextFile,
    summarize,
    exitIfNot: exitIfNot,
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

function exitIfNot(lambda, message, exitLambda) {
    let log = true;
    let verbose = false;
    if (log)
    if (verbose)
    console.log('exitIfNot: entered; ' + message);

    if (!isDefined(exitLambda)) {
        exitLambda = () => process.exit(1);
    }

    if (!isDefined(lambda)) {
        throw new Error('Expecting lambda to be defined: ' + lambda);
    }
    if (isDefined(message)) {
        if (message.toString() !== message) {
            throw new Error('Message is defined. Expecting string: ' + message);
        }
    }

    return function () {
        let result;
        try {
            result = lambda.apply(null, arguments);
        } catch (e) {
            let errorMessage = getErrorMessage(arguments, result, e);
            throw new Error(errorMessage);
        }
        if (!result) {
            let errorMessage = getErrorMessage(arguments, result);

            if (exitLambda !== throwMessage)
            if (log) {
                console.log('exitIfNot: exiting');
                console.log('  ' + errorMessage);

                let stack = new Error().stack;
                console.log(stack);
            }
            
            exitLambda(errorMessage);
        }
    }

    function getErrorMessage(args, result, inner) {
        let extra = isDefined(inner) ? "; " + inner : "";

        let errorMessage = "exitIfNot: ";

        if (message) {
            errorMessage += message;
        }

        errorMessage += '; Called ' + summarize(lambda.name);
        errorMessage += '. Expecting truth-y. Got: ' + JSON.stringify(result);

        errorMessage += "; Arguments: " + JSON.stringify(args);

        errorMessage += extra;

        return errorMessage;
    }
}

(function test() {
    consoleLog('testing exitIfNot');

    let inner = exitIfNot(a => false, 'inner message', throwMessage);
    exitIfNot(isEqual)(throws(a => inner(123)), 'Error: exitIfNot inner message; arguments: {\"0\":123}');

    let outer = exitIfNot(() => inner(123), 'outer message', throwMessage);
    let actual = throws(a => outer(234));
    exitIfNot(isEqual)(actual, 'Error: exitIfNot outer message; arguments: {\"0\":234}; Error: exitIfNot inner message; arguments: {\"0\":123}');

    consoleLog('testing exitIfNot complete');
})();

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
function isDistinct(array) {
    exitIfNot(isArray)(array);

    for (let i of range(array.length)) {
        for (let j of range(array.length)) {
            if (j <= i) {
                continue;
            }
            if (array[i] === array[j]) {
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

function* arraySkip(array, skipCount) {
    let log = false;

    if (log) console.log('arraySkip entered ' + JSON.stringify({array, skipCount}))

    exitIfNot(isArray)(array);

    if (array.length === 0) {
        return skipCount === 0;
    }    
    exitIfNot(isArrayIndex)(array, skipCount);

    for (let i = skipCount; i < array.length; i++) {
        yield array[i];
    }
}

exitIfNot(isEqualJson)([1], [...arraySkip([1], 0)]);
exitIfNot(isEqualJson)([2], [...arraySkip([1, 2], 1)]);
exitIfNot(isEqualJson)([], [...arraySkip([], 0)]);
exitIfNot(throws(() => [...arraySkip([], -1)]));
exitIfNot(throws(() => [...arraySkip([], 1)]));
exitIfNot(isEqual)(throws(() => [...arraySkip([], 0)]), false);

// TODO: replace fs.existsSync with this function
function readTextFile(fileName) {
    exitIfNot(isString)(fileName);

    if (!fs.existsSync(fileName)) {
        throw new Error('readTextFile: file does not exist: ' + summarize(fileName));
    }

    let result = fs.readFileSync(fileName, 'utf8');
    return result;
}

function summarize(o) {
    let log = true;

    let maxStringLength = 150;

    let result = "";

    if (isUndefined(o)) {
        result += "[undefined]";
        return result;
    }

    if (isString(o)) {
        if (o.length === 0) {
            result += "[empty string]";
            return result;
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
            result += ` [${i}]=` + summarize(JSON.stringify(o[0]));
            i++;
        }
        return summarize(result);
    }

    let properties = Object.getOwnPropertyNames(o);
    if (properties.length >= 1) {
        let key0 = properties[0];
        let summary0 = summarizeProperty(o, key0);

        if (properties.length === 1) {
            result += summary0;
            return result;

        } else if (properties.length === 2) {
            let key1 = properties[1];
            let summary1 = summarizeProperty(o, key1);

            result += " ";
            result += summary1;

            // TODO: compress two summaries.
            if (result.length > maxStringLength) {
                throwNotImplemented('composite summary too large: ' + result);
            }
        }

        function summarizeProperty(o, key) {
            let valueSummary = summarize(o[key]);
            let summary = key + ": " + valueSummary;
            return summarize(summary);
        }
    } 

    throwNotImplemented("summarize needs implementation: type: " + typeof(o));
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

// Cannot call exitIfNot
function consoleLog(message) {
    let summary = summarize(message);

    let result = summary;

    for (let i of range(indent)) {
        result = "  " + result;
    }

    console.log(result);
}