# Balances parenthesis
# Consumes input
# [b]() ()[b]

#include v2/addition.g

[b] | [b(0)b]
b]( | +(1)b]
+(1)b]) | b]
[b(0)b]end | [b-balanced]
+(1)b]end | +(1)b][b-too-many]end
[b(0)b]) | [b][b-too-few]

# [b]end [b-balanced]
[b]end
[b(0)b]end
[b-balanced]

[b](
[b(0)b](
[b(0)+(1)b]

[b](
[b(0)+(1)b]
[b(1)b]


[b(1)b]end
[b(0)+(1)b]end
[b(0)+(1)b][b-too-many]end
[b(1)b][b-too-many]end

# [b](end [b(1)b][b-too-many]end
[b](end
[b(0)b](end
[b(0)+(1)b]end
[b(1)b]end
[b(1)b][b-too-many]end



[b])
[b(0)b])
[b][b-too-few]


[b])end
[b(0)b])end
[b][b-too-few]end


[b]()end
[b(0)b]()end
[b(0)+(1)b])end
[b(1)b])end


[b]()end
[+(1)b])end
[b]end
[b-balanced]
