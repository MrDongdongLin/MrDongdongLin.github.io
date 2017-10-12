---
layout: post
title: "Seeing Powers of Five in Powers of Two and Vice Versa"
date: 2017-10-12 21:10:00 +0800
comments: false
category: math
tag:
    - python
    - Algebra
    - Decimals
    - Exponents
    - Fractions
---

本文前两节非原创，由[此](http://www.exploringbinary.com/seeing-powers-of-five-in-powers-of-two-and-vice-versa/)部分翻译而来。

当2的幂和5的幂的指数符号位互为相反数的时候，他们的十进制表示看起来似有共同之处，例如：\\(2^{-3}=0.125\\)和\\(5^3=125\\)；\\(5^{-5}=0.00032\\)和\\(2^5=32\\)。

![PO2s PO5](https://mrdongdonglin.github.io/images/PO2s PO5.jpg)

这种相似绝非偶然，它是分数表示为十进制数字的过程中的产物。接下来我们将简单地给出证明过程。

# 5的正次幂与2的负次幂
这里给一些例子（前八次幂）：

| n   | \\(5^n\\) |\\(2^{-n}\\)|
| ---:| -----:    |    ----:   |
| 1   | 5         |        0.5 |
| 2   | 25        |       0.25 |
| 3   | 125       |      0.125 |
| 4   | 625       |     0.0625 |
| 5   | 3125      |    0.03125 |
| 6   | 15625     |   0.015625 |
| 7   | 78125     |  0.0078125 |
| 8   | 390625    | 0.00390625 |

可以看到，除了小数位和前面的0之外，\\(5^n\\)与\\(2^{-n}\\)的重要数字位是相同的，这是因为
\\[
    \begin{align}
    2^{-n} &= \frac{1}{2^n} = \left(\frac{1}{2}\right)^n \\\
           &= \left(\frac{5}{10}\right)^n = \frac{5^n}{10^n}.
    \end{align}
\\]

# 5的负次幂与2的正次幂
同样的，我们有

| n   | \\(2^n\\) |\\(5^{-n}\\)|
| ---:| -----:    |    ----:   |
| 1   | 2         |        0.2 |
| 2   | 4         |       0.04 |
| 3   | 8         |      0.008 |
| 4   | 16        |     0.0016 |
| 5   | 32        |    0.00032 |
| 6   | 64        |   0.000064 |
| 7   | 128       |  0.0000128 |
| 8   | 256       | 0.00000256 |

# 浮点数右移问题
我尝试了几门语言，`python`，`Go`，`C`，`C++`，`Matlab`，都无法完成浮点数右移操作，执行的指令分别是
- Python:

```python
print 1.0>>3 # 该指令无法执行
print 1>>3   # 输出0
```

- Go:

```go
package main
import "fmt"

func main() {
	a := 1.0>>3
    fmt.Println(a) 
}
// 输出0
```

- C/C++:

```cpp
float a = 1>>3;
cout << a << endl;
// 输出0
```

- Matlab:

```matlab
bishift(1,-3);   % 输出0
bishift(1.0,-3); % 输出0
```

# PARI的python包 - cypari
[PARI/GP](http://pari.math.u-bordeaux.fr/)是一种针对数论中的快速计算(大数分解，代数数论，椭圆曲线...) 而设计的广泛应用的计算机代数系统，同样具备大量实用的函数来对于数学实体的计算， 诸如矩阵，多项式，幂级数，代数数，以及相当多的超越方程等等。 PARI也可以作为快速计算的C语言库[^PARI]。

[^PARI]: http://pari.math.u-bordeaux.fr/

- 安装Python Pari Library

```python
pip install cypari
```

- 在Python中使用

```python
from cypari import *

f = pari('1.0')
print float(f>>4) # 输出0.0625
```

太棒了！