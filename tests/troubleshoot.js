let grammars = [
    'v1/troubleshoot.g',
];

const { fileToGrammar } = require('./../grammars');

console.log('troubleshoot');

for (let g of grammars) {
    fileToGrammar(g);
}