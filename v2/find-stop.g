
# m marker
# a accept
# 1 target find symbol
# 0 other symbol
# s target stop symbol

# [mf] marker for find
# [ms] marker stop symbol
# [as] accept symbol for stop

#import v2/find.g
# m [ms]
# a [sa]
# 1 s 
# 0 0 1
#

#import v2/find.g 
# m [mf] 
# a e 
# 1 1 
# 0 0 
#

m | [mf][ms]

m1
a1