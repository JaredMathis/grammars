let directory = 'v1';

let fileNames = [
    'addition.g',
    'boolean.g',
    'comparison.g',
    'multiplication.g',
    'multiply.g',
    'parenthesis.g',
    'primes.g',
    'subtract.g',
    'test.g',
];

module.exports = {
    directory,
    fileNames,
};

const { 
    allFiles,
} = require('../utilities');

const path = require('path');
allFiles(directory, fileNames.concat(path.basename(__filename)));