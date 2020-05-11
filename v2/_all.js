let directory = 'v2';

let fileNames = [
    'addition.g',
    'balance.g',
    'binary.g',
    'eat.g',
    'find.g',
    'find-stop.g',
    'reverse.g',
    'reverse2.g',
    'reverse3.g',
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