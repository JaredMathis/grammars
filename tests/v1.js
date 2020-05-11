let log = true;

let {
    directory,
    fileNames,
} = require('../v1/_all');

const { fileToGrammar } = require('../grammars');

const { 
    loop,
} = require('../utilities');

const path = require('path');

loop(fileNames, g => {
    let pathName = path.join(directory, g);
    fileToGrammar(pathName);
}, log);

