---
title: 'Power of Ten Simplify'
date: 2017-11-15
permalink: /posts/2017/11/Power of Ten Simplify/
tags:
    - math
---

上一篇文章[Power of ten]({{< ref "/post/math/power-of-ten.md" >}})中提到，计算$10^n$可以转化为计算二项式系数再进行移位得到，这里提出一种更为简化的求$10^n$二进制表示的数字中“1”的数量的方法。

# 简化方法
首先还是将$10^n$分解为$2^n\cdot 5^n$，而$2^n$在计算机中相当于左移$n$位，右边补0，对结果中1的数量没有影响，因此，这里仅考虑$5^n$。下面的表格列举$n=\{1,2,3,4\}$时，$5^n$与其二进制数的表示形式。

| n   | decimal |  binary    |
| --- | -----   |    ----    |
| 1   | 5       |        101 |
| 2   | 25      |      11001 |
| 3   | 125     |    1111101 |
| 4   | 625     | 1001110001 |

实际上，

$$5^n=5^{n-1}\cdot4+5^{n-1}.$$

例如，`25=0b11001=0b101<<2+0b101`，即`0b11001=0b10100+0b101`。于是计算$10^n$中“1”的数量的程序可以这么写（以下程序计算出小于`n`范围内所有正整数的的$10^n$中“1”的数量并保存在数组`oneBit`中）：

```python
def OneBitInPowerOfTen(n):
    oneBit = []
    oneBit.append(1)
    num = 1

    for x in xrange(1, n):
        num += num << 2
        oneBit.append(sum(map(int, bin(num)[2:])))
    return oneBit
```
