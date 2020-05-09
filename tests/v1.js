let grammars = [
    'v1/addition.g',
    'v1/boolean.g',
    'v1/comparison.g',
    'v1/multiplication.g',
    'v1/multiply.g',
    'v1/parenthesis.g',
    'v1/primes.g',
    'v1/subtract.g',
    'v1/test.g',
];

const { fileToGrammar } = require('./../grammars');

console.log('Checking v1');

for (let g of grammars) {
    fileToGrammar(g);
}