let grammars = [
    'v2/addition.g',
    'v2/reverse.g',
];

const { checkFile } = require('./grammars');

for (let g of grammars) {
    checkFile(g);
}