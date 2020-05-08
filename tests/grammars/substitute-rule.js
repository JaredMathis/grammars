
let {
    exitIfNot,
    isDefined,
    isEqual,
} = require('../../utilities');

let { 
    substituteRule 
} = require('../../grammars');

(function test() {
    let rule = {
        left: {
            text: 'b',
        },
        right: {
            text: 'dd',
        }
    };
    let result;
    
    result = substituteRule(rule, 'abc', 1);
    exitIfNot(isDefined)(result);
    exitIfNot(isEqual)(result.success, true);
    exitIfNot(isEqual)(result.substituted, 'addc');
    
    result = substituteRule(rule, 'abc', 0);
    exitIfNot(isDefined)(result);
    exitIfNot(isEqual)(result.success, false);

    result = substituteRule(rule, 'abc', 2);
    exitIfNot(isDefined)(result);
    exitIfNot(isEqual)(result.success, false);
    
})();