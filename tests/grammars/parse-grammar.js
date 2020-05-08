
let { 
    parseGrammar,
    ruleToken,
} = require('../../grammars');

parseGrammar(`a${ruleToken}b

aa
ab
`);

parseGrammar(`a${ruleToken}b
b${ruleToken}c

a
b
c

aa
ab
bb
cb
cc
`);

parseGrammar(`a${ruleToken}b

aa
ba

b|c

a
b
c
`);