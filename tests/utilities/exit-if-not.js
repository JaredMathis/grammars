let {
    consoleLog,
    exitIfNot,
    isEqualJson,
} = require('../../utilities');

(function test() {
    consoleLog('testing exitIfNot');

    let calls = [];
    let exitLambda = (a) => calls.push(a.split('\n').join('\\n'));

    exitIfNot(a => false, 'inner message', exitLambda)();
    exitIfNot(isEqualJson)(calls, ["inner message; Called [empty string]. Expecting truth-y. Got: false;\\n    Arguments:\\n      {}"]);

    consoleLog('testing exitIfNot complete');
})();