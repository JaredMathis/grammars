let {
    exitIfNot,
    isDefined,
} = require('../../utilities');

let {
    fileToGrammar,
    attemptToProve,
} = require('../../grammars');

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