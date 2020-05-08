
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

function undirectedPathAttempt(graph, a, b) {
    return undirectedPathAttempt(graph, a, b);
}

function degree(graph, v) {
    return neighbors(graph, v).length;
}

exitIfNot(isEqual)(degree([[1, 2]], 1), 1);
exitIfNot(isEqual)(degree([[1, 2], [2, 3]], 1), 1);
exitIfNot(isEqual)(degree([[1, 2], [1, 3]], 1), 2);

function hasNeighbors(graph, v) {
    return degree(graph, v) > 0;
}

function smallestNeighbor(graph, current) {
    exitIfNot(hasNeighbors)(graph, current);

    let smallest;
    if (isValidVertex(smallest)){
        throwNotImplemented('initial value of smallest should not be a vertex');
    }
    for (let n of neighbors(graph, current)) {
        if (isUndefined(smallest)) {
            smallest = n;
            continue;
        }
        if (n < smallest) {
            smallest = n;
        }
    }
    return smallest;
}

exitIfNot(isEqual)(smallestNeighbor([[1, 2]], 1), 2);
exitIfNot(isEqual)(smallestNeighbor([[1, 2], [2, 3]], 1), 2);
exitIfNot(isEqual)(smallestNeighbor([[1, 2], [2, 3]], 2), 1);
exitIfNot(isEqual)(smallestNeighbor([[1, 2], [2, 3]], 3), 2);
exitIfNot(isEqual)(smallestNeighbor([[1, 2], [1, 3]], 1), 2);
exitIfNot(isEqual)(smallestNeighbor([[1, 2], [1, 3]], 2), 1);
exitIfNot(isEqual)(smallestNeighbor([[1, 2], [1, 3]], 3), 1);

function vertices(graph) {
    exitIfNot(isValidGraph)(graph); 
    
    let verticesLookup = {};
    for (let edge of graph) {
        let a = edge[0];
        let b = edge[1];
        for (let v of [a, b]) {
            if (verticesLookup[v]) {
                continue;
            }
            verticesLookup[v] = true;
        }
    }

    let result = Object.keys(verticesLookup);
    result.sort();

    return result;
}

exitIfNot(isEqual)(vertices([[1,2]]), [1,2]);
exitIfNot(isEqual)(vertices([[1,2],[2,3]]), [1,2,3]);
exitIfNot(isEqual)(vertices([[1,2],[2,3],[1,3]]), [1,2,3]);
exitIfNot(isEqual)(vertices([[1,2],[2,3],[1,4]]), [1,2,3,4]);
exitIfNot(isEqual)(vertices([[1,2],[2,3],[1,5]]), [1,2,3,5]);

function vertexCount(graph) {
    exitIfNot(isValidGraph)(graph);

    return vertices(graph).length;
}

exitIfNot(isEqual)(vertexCount([[1,2]]), 2);
exitIfNot(isEqual)(vertexCount([[1,2],[2,3]]), 3);
exitIfNot(isEqual)(vertexCount([[1,2],[2,3],[1,3]]), 3);
exitIfNot(isEqual)(vertexCount([[1,2],[2,3],[1,4]]), 4);
exitIfNot(isEqual)(vertexCount([[1,2],[2,3],[1,5]]), 4);

/**
 * @param {*} graph 
 * @param {*} start 
 * @param {*} minimum 
 * @param {*} chooser Accepts a graph and vertex; Needs to be deterministic
 */
function todo(graph, start, minimum, chooser) {
    let smallest;

    let smallest = greatest(getChoices, smallestGreaterThan);

    return smallest;
}


function greatest(getChoices, greater) {
    exitIfNot(isDefined)(getChoices);
    exitIfNot(isDefined)(greater);

    let result;
    for (let choice of getChoices()) {
        if (greater(choice, result)) {
            result = choice;
        }
    }

    // Error if there were no choices.
    exitIfNot(isDefined)(result);

    return result;
}

let current;

let next = smallestGreaterThan(graph, current, current, chooser);
if (isUndefined(next)) {
    // back up
    // of all choices that lead to current, choose smallest
}

function next(graph, current, previous, chooser) {
    let afterCurrent = after(graph, current, previous, chooser);

    if (isDefined(afterCurrent)) {
        return afterCurrent;
    }

    
}

function* getBefore(graph, current, minimum, chooser) {
    for (let v of vertices(graph)) {
        let afterV = after(graph, v, chooser);
        if (afterV === current) {
            yield v;
        }
    }
}

function after(graph, current, minimum, chooser) {
    let smallest;

    smallest = greatest(getChoices(graph, current, chooser), smallestGreaterThan(minimum));

    return smallest;
}

function smallestGreaterThan(minimum) {
    exitIfNot(isInteger)(minimum);

    return function greaterThan(choice, candidate) {
        exitIfNot(isInteger)(choice);
        return candidate > minimum && choice > candidate;
    }
}

function* getChoices(graph, start, chooser) {
    let current = start;

    let remainingChoices = vertexCount(graph);
    while (remainingChoices >= 0) {
        remainingChoices--;

        let next = chooser(graph, current);
        yield next;

        current = next;
    }
}