
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

function undirectedPath(graph, a, b) {
    exitIfNot(isValidGraph)(graph);

    let reach = [a];
    let i = 0;
    while (i < reach.length) {
        let current = reach[i];
        for (let n of neighbors(graph, current)) {
            // Do not add neighbor if already exists.
            if (reach.includes(n)) {
                continue;
            }
            if (n === b) {
                return true;
            }
            reach.push(n);
        }
        i++;
    }

    return false;
}

console.log('testing undirectedPath');
exitIfNot(isEqual)(undirectedPath([[1, 2]], 1, 2), true);
exitIfNot(isEqual)(undirectedPath([[1, 2]], 2, 1), true);
exitIfNot(isEqual)(undirectedPath([[1, 2], [2, 3]], 3, 1), true);
exitIfNot(isEqual)(undirectedPath([[1, 2], [2, 3]], 1, 3), true);
exitIfNot(isEqual)(undirectedPath([[1, 2], [2, 3], [4, 5]], 1, 4), false);
exitIfNot(isEqual)(undirectedPath([[1, 2], [2, 3], [4, 5]], 1, 5), false);

function neighbors(graph, v) {
    exitIfNot(isValidGraph)(graph);
    exitIfNot(isValidVertex)(v);

    let result = [];
    for (let edge of graph) {
        if (edge[0] === v) {
            result.push(edge[1]);
        }
        if (edge[1] === v) {
            result.push(edge[0]);
        }
    }
    return result;
}

function containsUndirectedEdge(graph, a, b) {
    exitIfNot(isValidVertex)(a);
    exitIfNot(isValidVertex)(b);

    for (let edge of graph) {
        if (edgeEquals(edge, [a, b])) {
            return true;
        }
    }
}

function isValidVertex(a) {
    if (!isDefined(a)) {
        return false;
    }

    return isInteger(a);
}

function isValidGraph(graph) {
    let log = true;

    let result;

    if (log) consoleLog('isGraph entered: ' + JSON.stringify({graph}));
    logIndent(() => {
        if (!isArray(graph)) {
            result = false;
            if (log) consoleLog('graph is not array');
            return;
        }
    
        for (let edge of graph) {
            if (!isValidEdge(edge)) {
                result = false;
                if (log) consoleLog('expecting edge');
                return;
            }
        }

        if (!isDistinct(graph, edgeEquals)) {
            result = false;
            if (log) consoleLog('contains duplicate edge');
            return;
        }

        result = true;
    });

    return result;
}

console.log('testing isValidGraph')
exitIfNot(isEqual)(isValidGraph([[1, 2]]), true);
// Cannot contain duplicate edge
exitIfNot(isEqual)(isValidGraph([[1, 2], [1, 2]]), false);
exitIfNot(isEqual)(isValidGraph([[1, 2],[2,1]]), false);
exitIfNot(isEqual)(isValidGraph([1, 2]), false);
console.log('testing isValidGraph complete')

function edgeEquals(a, b) {
    if (!isValidEdge(a)) {
        return false;
    }
    if (!isValidEdge(b)) {
        return false;
    }
    if (a.length !== b.length) {
        return false;
    }
    a.sort();
    b.sort();
    
    for (let i of range(a.length)) {
        if (a[i] !== b[i]) {
            return false;
        }
    }

    return true;
}

console.log('testing edgeEquals')
exitIfNot(isEqual)(edgeEquals([1, 2], [1, 3]), false)
exitIfNot(isEqual)(edgeEquals([1, 2], [1, 2]), true)
// Order should not matter.
exitIfNot(isEqual)(edgeEquals([1, 2], [2, 1]), true)
exitIfNot(isEqual)(edgeEquals([1, 2], [3, 2]), false)
console.log('testing edgeEquals complete')

/**
 * An edge is an array of integers of length 2. 
 * @param {*} edge 
 */
function isValidEdge(edge) {
    if (!isArray(edge)) {
        return false;
    }

    if (edge.length !== 2) {
        return false;
    }

    for (let v of edge) {
        if (!isValidVertex(v)) {
            return false;
        }
    }

    if (!isDistinct(edge)) {
        return false;
    }

    return true;
}

console.log('testing isValidEdge')
exitIfNot(isEqual)(isValidEdge([1, 2]), true);
// Vertices must be distinct
exitIfNot(isEqual)(isValidEdge([1, 1]), false);
// Vertices must be integers
exitIfNot(isEqual)(isValidEdge([1, '2']), false);
exitIfNot(isEqual)(isValidEdge([1, undefined]), false);
// Cannot have 1 vertex
exitIfNot(isEqual)(isValidEdge([1]), false);
// Cannot have 3 vertices
exitIfNot(isEqual)(isValidEdge([1,2,3]), false);
console.log('testing isValidEdge complete')
