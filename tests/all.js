let log = true;

let {
    loop,
    getCurrentPath,
} = require('./../utilities');

let tests = [
    ('./grammars/all'),
    ('./utilities/all'),
    ('./v1'),
    ('./v2'),
];

console.log('');
loop(tests, (test) => {
    require(test);
}, log);