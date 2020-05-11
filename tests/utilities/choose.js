let {
    exitIfNot,
    isEqualJson,
    choose,
    range,
    consoleLog,
} = require('../../utilities')

consoleLog('choose testing');
exitIfNot(isEqualJson)(choose(range(1, 1), 1), [[1]])
exitIfNot(isEqualJson)(choose(range(2, 1), 1), [[1],[2]])
exitIfNot(isEqualJson)(choose(range(2, 1), 2), [[1,2]])
exitIfNot(isEqualJson)(choose(range(3, 1), 1), [[1],[2],[3]])
exitIfNot(isEqualJson)(choose(range(3, 1), 2), [[1,2],[1,3],[2,3]])
exitIfNot(isEqualJson)(choose(range(3, 1), 3), [[1,2,3]])
exitIfNot(isEqualJson)(choose(range(4, 1), 2), [[1,2],[1,3],[1,4],[2,3],[2,4],[3,4]])
exitIfNot(isEqualJson)(choose(range(4, 1), 3), [[1,2,3],[1,2,4],[1,3,4],[2,3,4]])
exitIfNot(isEqualJson)(choose(range(4, 1), 4), [[1,2,3,4]])
consoleLog('choose testing complete');