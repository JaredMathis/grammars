let grammars = [
    'v1/addition.g',
    'v1/boolean.g',
    'v1/comparison.g',
    'v1/multiplication.g',
    'v1/multiply.g',
    'v1/parenthesis.g',
    'v1/primes.g',
    'v1/subtract.g',
];

const { checkFile } = require('./grammars');

for (let g of grammars) {
    checkFile(g);
}