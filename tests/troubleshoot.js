let grammars = [
    'v1/troubleshoot.g',
];

const { fileToGrammar } = require('./../grammars');

console.log('Checking v1');

for (let g of grammars) {
    fileToGrammar(g);
}