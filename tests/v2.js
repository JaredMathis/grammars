let grammars = [
    'v2/addition.g',
    'v2/eat.g',
    'v2/find.g',
    'v2/reverse.g',
    'v2/reverse2.g',
    'v2/reverse3.g',
    'v2/reverse3.g',
    'v2/binary.g',
];

// TODO: throw if file in v2 that isn't in the list.

const { fileToGrammar } = require('../grammars');

console.log('Checking v2');

for (let g of grammars) {
    fileToGrammar(g);
}