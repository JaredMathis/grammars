let {
    exitIfNot,
    isEqualJson,
    consoleLog,
} = require('../../utilities');

let {
    isValidSubstitution,
} = require('../../grammars');

(function test() {

    consoleLog('testing isValidSubstitution');
    exitIfNot(isEqualJson)(isValidSubstitution({ left: { text: 'a' }, right: { text: 'b' } }, 0, 'a', 'b'), {"success":true});
    exitIfNot(isEqualJson)(isValidSubstitution({ left: { text: 'a' }, right: { text: 'b' } }, 0, 'a', 'c'), {"success":false,"message":"rule right does not substitute into current"});
    exitIfNot(isEqualJson)(isValidSubstitution({ left: { text: 'a' }, right: { text: 'b' } }, 0, 'a', ''), {"success":false,"message":"previous and current lengths are incompatible with rule"});
    exitIfNot(isEqualJson)(isValidSubstitution({ left: { text: 'a' }, right: { text: 'b' } }, 0, 'a', 'a'), {"success":false,"message":"rule right does not substitute into current"});
    exitIfNot(isEqualJson)(isValidSubstitution({ left: { text: 'a' }, right: { text: 'bb' } }, 0, 'a', 'bb'), {"success":true});
    exitIfNot(isEqualJson)(isValidSubstitution({ left: { text: 'a' }, right: { text: 'bb' } }, 1, 'a', 'bb'), {"success":false,"message":"previous is too short for rule"});
    exitIfNot(isEqualJson)(isValidSubstitution({ left: { text: 'a' }, right: { text: 'bb' } }, 1, 'aa', 'abb'), {"success":true});
    exitIfNot(isEqualJson)(isValidSubstitution({ left: { text: 'a' }, right: { text: 'bb' } }, 1, 'aaa', 'abba'), {"success":true});
    exitIfNot(isEqualJson)(isValidSubstitution({ left: { text: 'a' }, right: { text: '' } }, 1, 'aaa', 'aa'), {"success":true});
    exitIfNot(isEqualJson)(isValidSubstitution({ left: { text: 'a' }, right: { text: '' } }, 1, 'aaa', 'aaa'), {"success":false,"message":"previous and current lengths are incompatible with rule"});
    exitIfNot(isEqualJson)(isValidSubstitution({ left: { text: 'a' }, right: { text: 'bb' } }, 1, 'aaa', 'abbd'), {"success":false,"message":"current does not match does not substitute into current"});
    consoleLog('testing isValidSubstitution complete');
    
})();