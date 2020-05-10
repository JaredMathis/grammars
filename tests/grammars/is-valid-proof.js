let {
    consoleLog,
    isEqualJson,
    isEqual,
    exitIfNot,
} = require('../../utilities');

let { isValidProof } = require('../../grammars');

consoleLog('testing isValidProof');
exitIfNot(isEqualJson)(isValidProof({ rules: [{ left: { text: 'a' }, right: { text: 'b' } }]}, [{ text: 'a' }, { text: 'b' }]), { valid: true });

(function test() {
    let fileName = "is-valid-proof.js";
    let grammar = {
    "rules": [
        {
        "left": {
            "text": "(T)",
            "lineNumber": 0
        },
        "right": {
            "text": "(T)and(T)",
            "lineNumber": 0
        },
        "fileName": fileName,
        },
        {
        "left": {
            "text": "(T)",
            "lineNumber": 0
        },
        "right": {
            "text": "((101)=(10)+(11)*(1))",
            "lineNumber": 0
        },
        "fileName": fileName,
        },
    ]
    };
    let proof = [
    {
        "text": "(T)",
        "lineNumber": 2
    },
    {
        "text": "(T)and(T)",
        "lineNumber": 3
    },
    {
        "text": "((101)=(10)+(11)*(1))and(T)",
        "lineNumber": 4
    }
    ];

    let actual = isValidProof(grammar, proof, fileName);

    exitIfNot(isEqualJson)(actual, {"valid":true});
})();

consoleLog('testing isValidProof complete');
