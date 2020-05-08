let {
    exitIfNot,
    summarize,
    isEqual,
} = require('../../utilities');

exitIfNot(isEqual)(summarize({}), "{}");
exitIfNot(isEqual)(summarize(false), "false");
exitIfNot(isEqual)(summarize([1,2,3]), "array 3 items [0]=1 [1]=2 [2]=3");
exitIfNot(isEqual)(summarize({a:undefined}), "{a: [undefined]}");
exitIfNot(isEqual)(summarize({b:{a:undefined}}), "{b: {a: [undefined]}}");
exitIfNot(isEqual)(summarize({b: {a: " "}}), "{b: {a: \" \"}}");