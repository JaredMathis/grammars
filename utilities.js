const fs = require('fs');

module.exports = {
    isArray,
    isArrayIndex,
    isAtLeast,
    isDefined,
    isDistinct,
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
;

function throwNotImplemented(message) {
    throw new Error('not implemented: ' + message);
}

function isUndefined(n) {
    return typeof(n) === 'undefined';
}

function isDefined(n) {
    return !isUndefined(n);
}

function throwIfNot(f, message) {
    if (!isDefined(f)) {
        throw new Error('Expecting f to be defined: ' + f);
    }
    if (isDefined(message)) {
        if (message.toString() !== message) {
            throw new Error('Message is defined. Expecting string: ' + message);
        }
    } else {
        
    }

    return function () {
        let result;
        try {
            result = f.apply(null, arguments);
        } catch (e) {
            error(arguments, e);
        }
        if (!result) {
            error(arguments);
        }
    }

    function error(args, inner) {
        let extra = isDefined(inner) ? "; " + inner : "";
        throw new Error('throwIfNot ' + (message || f.name) + '; arguments: ' + JSON.stringify(args) + extra);
    }
}

(function test() {
    let inner = throwIfNot(a => false, 'inner message');
    throwIfNot(isEqual)(throws(a => inner(123)), 'Error: throwIfNot inner message; arguments: {\"0\":123}');

    let outer = throwIfNot(() => inner(123), 'outer message');
    let actual = throws(a => outer(234));
    throwIfNot(isEqual)(actual, 'Error: throwIfNot outer message; arguments: {\"0\":234}; Error: throwIfNot inner message; arguments: {\"0\":123}');
})();

function isEqual(a, b) {
    throwIfNot(isDefined)(a);
    throwIfNot(isDefined)(b);
    return a === b;
}


function isInteger(n) {
    throwIfNot(isDefined, 'Expecting n to be defined: ' + n)(n);

    //console.log('isInteger ' + typeof(n) + ' ' + n);

    let result = parseInt(n, 10) === n;

    return result;
}

function isAtLeast(n, i) {
    //console.log('isAtLeast ' + typeof(n) + ' ' + n);

    throwIfNot(isInteger, ' expecting n to be integer: ' + n)(n);
    throwIfNot(isInteger, ' expecting i to be integer: ' + i)(i);

    return n >= i;

}

function isAtMost(n, i) {
    return isAtLeast(i, n);
}

function range(count, offset) {
    throwIfNot(isInteger)(count);
    throwIfNot(isAtLeast)(count, 0);

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

throwIfNot(isEqualJson)(range(0), []);
throwIfNot(isEqualJson)(range(1), [0]);
throwIfNot(isEqualJson)(range(2), [0, 1]);
throwIfNot(isEqualJson)(range(3), [0, 1, 2]);
throwIfNot(isEqualJson)(range(3, 1), [1, 2, 3]);



function isString(n) {
    throwIfNot(isDefined, 'Expecting n to be defined: ' + n)(n);
    return n.toString() === n;
}

throwIfNot(isEqual)(isString('01'), true);
throwIfNot(isEqual)(isString(''), true);
throwIfNot(isEqual)(isString(1), false);

function throws(f) {
    try {
        f();
    } catch (e) {
        return e.toString() || true;
    }
    return false;
}

function isArray(array) {
    throwIfNot(isDefined, 'Expecting array to be defined: ' + array)(array);
    return Array.isArray(array);
} 

throwIfNot(isEqual)(isArray([]), true);
throwIfNot(isEqual)(isArray([1,2,3]), true);
throwIfNot(isEqual)(isArray('a'), false);

function isArrayIndex(array, index) {
    throwIfNot(isInteger)(index);

    if (isString(array)) {
        return isAtLeast(index, 0) && isAtMost(index, array.length - 1);
    }

    throwNotImplemented();
}

// TODO: make more efficient
function isDistinct(array) {
    throwIfNot(isArray)(array);

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

throwIfNot(isEqual)(isDistinct([]), true);
throwIfNot(isEqual)(isDistinct([1]), true);
throwIfNot(isEqual)(isDistinct([1,2]), true);
throwIfNot(isEqual)(isDistinct([1,2,'2']), true);
throwIfNot(isEqual)(isDistinct([1,2,2]), false);