---
title: 'Learn Zcash'
date: 2018-10-21
permalink: /posts/2018/10/learn zcash/
tags:
  - bitcoins
  - zero-knowledge proof
  - privacy
---

In this article, I will make some notes about how [Zcash](https://github.com/zcash/zcash) works.

- [背景知识](#%E8%83%8C%E6%99%AF%E7%9F%A5%E8%AF%86)
- [Zero-Knowledge Succint Non-Interactive Arguments of Knowledge](#zero-knowledge-succint-non-interactive-arguments-of-knowledge)
  - [Zcash如何构造zk-SNARKs协议？](#zcash%E5%A6%82%E4%BD%95%E6%9E%84%E9%80%A0zk-snarks%E5%8D%8F%E8%AE%AE)
  - [同态隐藏](#%E5%90%8C%E6%80%81%E9%9A%90%E8%97%8F)
  - [盲评价多项式](#%E7%9B%B2%E8%AF%84%E4%BB%B7%E5%A4%9A%E9%A1%B9%E5%BC%8F)
    - [多项式和线性组合](#%E5%A4%9A%E9%A1%B9%E5%BC%8F%E5%92%8C%E7%BA%BF%E6%80%A7%E7%BB%84%E5%90%88)
    - [盲评价一个多项式](#%E7%9B%B2%E8%AF%84%E4%BB%B7%E4%B8%80%E4%B8%AA%E5%A4%9A%E9%A1%B9%E5%BC%8F)
  - [知识系数测试和假设](#%E7%9F%A5%E8%AF%86%E7%B3%BB%E6%95%B0%E6%B5%8B%E8%AF%95%E5%92%8C%E5%81%87%E8%AE%BE)
    - [KC测试](#kc%E6%B5%8B%E8%AF%95)
  - [如何为可验证多项式进行盲评价](#%E5%A6%82%E4%BD%95%E4%B8%BA%E5%8F%AF%E9%AA%8C%E8%AF%81%E5%A4%9A%E9%A1%B9%E5%BC%8F%E8%BF%9B%E8%A1%8C%E7%9B%B2%E8%AF%84%E4%BB%B7)
    - [扩展的KCA](#%E6%89%A9%E5%B1%95%E7%9A%84kca)
    - [可验证的盲评价多项式协议](#%E5%8F%AF%E9%AA%8C%E8%AF%81%E7%9A%84%E7%9B%B2%E8%AF%84%E4%BB%B7%E5%A4%9A%E9%A1%B9%E5%BC%8F%E5%8D%8F%E8%AE%AE)
  - [从表达式到多项式](#%E4%BB%8E%E8%A1%A8%E8%BE%BE%E5%BC%8F%E5%88%B0%E5%A4%9A%E9%A1%B9%E5%BC%8F)
    - [从表达式到R1CS](#%E4%BB%8E%E8%A1%A8%E8%BE%BE%E5%BC%8F%E5%88%B0r1cs)
    - [从R1CS到QAP](#%E4%BB%8Er1cs%E5%88%B0qap)
    - [检查QAP](#%E6%A3%80%E6%9F%A5qap)
  - [椭圆曲线配对](#%E6%A4%AD%E5%9C%86%E6%9B%B2%E7%BA%BF%E9%85%8D%E5%AF%B9)
    - [椭圆曲线](#%E6%A4%AD%E5%9C%86%E6%9B%B2%E7%BA%BF)
    - [椭圆曲线普通方程](#%E6%A4%AD%E5%9C%86%E6%9B%B2%E7%BA%BF%E6%99%AE%E9%80%9A%E6%96%B9%E7%A8%8B)
    - [椭圆曲线阿贝尔群](#%E6%A4%AD%E5%9C%86%E6%9B%B2%E7%BA%BF%E9%98%BF%E8%B4%9D%E5%B0%94%E7%BE%A4)
    - [有限域椭圆曲线](#%E6%9C%89%E9%99%90%E5%9F%9F%E6%A4%AD%E5%9C%86%E6%9B%B2%E7%BA%BF)
    - [有限域椭圆曲线点的阶](#%E6%9C%89%E9%99%90%E5%9F%9F%E6%A4%AD%E5%9C%86%E6%9B%B2%E7%BA%BF%E7%82%B9%E7%9A%84%E9%98%B6)
    - [椭圆曲线加密](#%E6%A4%AD%E5%9C%86%E6%9B%B2%E7%BA%BF%E5%8A%A0%E5%AF%86)
    - [zk-SNARKs协议中的椭圆曲线配对](#zk-snarks%E5%8D%8F%E8%AE%AE%E4%B8%AD%E7%9A%84%E6%A4%AD%E5%9C%86%E6%9B%B2%E7%BA%BF%E9%85%8D%E5%AF%B9)
  - [Pinocchio协议](#pinocchio%E5%8D%8F%E8%AE%AE)

# 背景知识

知乎上有一个[高赞回答](https://www.zhihu.com/question/37290469/answer/107612456)简单介绍了什么是区块链。实际上，区块链是一个去中心化的分布式账本数据库，本身是一串使用密码学相关联所产生的数据块，每一个数据块包含了多次虚拟币网络交易有效确认的信息。

目前的电子交易比如支付宝、微信是在第三方的参与下才能完成的。此时发生的交易过程是这样的：Alice在某宝上买了一样东西，给马云打了一笔钱，马云通知bob发货，Bob发货给Alice，Alice确认后马云把钱打给Bob。

而使用区块链技术的虚拟币交易最大的特点是去中心化，也就是在没有第三方的参与下，Alice和Bob在网络上执行一笔交易。在虚拟币交易中，根据网络的共识规则，首先必须确定交易的有效性，即让大家知道Alice和Bob发生了一笔交易，该笔交易是可以验证的。然而验证方并不能获取关于Alice和Bob交易的任何细节，这是为了防止Eve在暗中假冒Alice或者Bob。

实际上，交易的媒介是不是软妹币已经不重要了，因此虚拟币诸如比特币和本文要介绍的零币就开始流通了。一笔交易被称之为一个区块，每一个区块都拥有前一区块的哈希值，并且有发起人的数字签名。

# Zero-Knowledge Succint Non-Interactive Arguments of Knowledge

在[Zcash白皮书](https://github.com/zcash/zips/raw/master/protocol/protocol.pdf)中提到，Zcash使用一种基于零知识证明的协议zero-knowledge succint non-interactive arguments of knowledge (zk-SNARKs)以保证交易的安全性。关于zk-SNARKs详细的描述可参考<https://z.cash/technology/zksnarks>，本文仅对协议的一部分进行中文翻译。

## Zcash如何构造zk-SNARKs协议？

本节将详述zk-SNARKs协议的构造过程。实际上，该协议的工作流程可简化为

Computation $\Rightarrow$ Arithmetic Circuit $\Rightarrow$ R1CS $\Rightarrow$ QAP $\Rightarrow$ zk-SNARK

在交易过程中，交易确认功能被划分为最小逻辑操作单元，并转化为数学表达式，生成“arithmetic circuit[^translate]”。下一步被称为Rank 1 Constraint System (R1CS)，用于检查值是否“正确行进”，在此步骤中，验证者需要检查很多限定条件，2012年，文献[[1]](https://eprint.iacr.org/2012/215.pdf)的作者提出了名为Quadratic Arithmetic Program (QAP) 的方法条件检验方法，将需检验的单个限定条件由检验数字转化为检验多项式，验证者只需检测两个多项式在随机选定点上值是否一致即可（在Zcash博客中，这里指的是[盲评价多项式](#%E7%9B%B2%E8%AF%84%E4%BB%B7%E5%A4%9A%E9%A1%B9%E5%BC%8F)，虽然我他喵看不懂这一句说的是啥，但我还是要胡乱翻译一下。）

[^translate]: 有些专业名词就不翻译了，翻译过来反而四不像。

## 同态隐藏

Zcash使用同态隐藏函数达到零知识证明。同态隐藏函数$E(x)$具有以下性质：

- 对于几乎所有的元素$x$，在给定$E(x)$的情况下难以推出$x$的值。
- 若$x\neq y$, 则$E(x)\neq E(y)$.
- 若不同元素$x,y$满足某个算术表达式，比如$x+y$，那么根据$E(x)$和$E(y)$可以计算出$E(x+y)$。

假设Alice需要向Bob证明她拥有数字$x,y$并且$x+y=7$，那么她要做的事是

- Alice计算$E(x)$和$E(y)$，然后发送给Bob。
- Bob根据$E(x)$和$E(y)$的值计算$E(x+y)$并验证$E(x+y)=E(7)$。

Zcash协议引进一种名为**离散对数**的函数用以实现同态隐藏。离散对数问题可描述为：给定某个素数$p$和有限域$\mathbb{Z}_p^\*$上的一个本原元$g$，对于整数$h\in\mathbb{Z}_p^\*$，寻找唯一的整数$a\in \mathbb{Z}_p^\*$并使得$g^a=h\bmod p$是非常困难的。

## 盲评价多项式

令$\mathbb{F}_p$表示测度为$p$的有限域$\{0,1,\cdots,p-1\}$, 盲评价多项式的概念主要包含两个方面：

### 多项式和线性组合

在有限域$\mathbb{F}_p$上，给定$d$次多项式
\begin{equation}\label{eq:polynomial}
  P(X) = a_0 + a_1\cdot X + a_2\cdot X^2 + \cdots + a_d\cdot X^d,
\end{equation}
其中$a_0,\cdots,a_d\in \mathbb{F}_p$. 同时，同态隐藏函数$E(x)=g^x$支持求和运算，即$E(x+y)$的值可由$E(x),E(y)$计算得出，并且它支持加权线性组合。这意味着对于给定的$a,b,E(x),E(y)$，可以计算$E(ax+by)$，因为
$$
E(ax+by) = g^{ax+by} = g^{ax}\cdot g^{by} = (g^x)^a\cdot (g^y)^b = E(x)^a\cdot E(y)^b.
$$

### 盲评价一个多项式

假设Alice拥有$d$次多项式$P$，Bob随机选取一点$s\in \mathbb{F}_p$，并期望获得$E(P(s))$的值。其做法为

- Alice将$P$发送给Bob，然后Bob计算$E(P(s))$。
- Bob将$s$发送给Alice，Alice计算$E(P(s))$并发送给Bob。

然而，**盲评价**要求Bob在不知道$P$的情况下获得$E(P(s))$的值，并且要求Alice不能知道$s$的值。这可以通过同态隐藏来实现

1. Bob发送$E(1),E(s),\cdots,E(s^d)$给Alice。
2. Alice根据Bob发送过来的数据计算$E(P(s))$，并发送给Bob。

## 知识系数测试和假设

问题来了，在[盲评价多项式](#%E7%9B%B2%E8%AF%84%E4%BB%B7%E5%A4%9A%E9%A1%B9%E5%BC%8F)阶段，谁也不能保证Alice老老实实地计算$E(P(s))$的值并发送给Bob, 此时需要某个方法使得Alice遵从协议的规定，该方法名为 _Knowledge of Coefficient (KC) Test_。

### KC测试

令同态隐藏函数$g$的定义域为$G$，其测度为$p$。对于$\forall\alpha\in \mathbb{F}_p$, 取$G$中的一对元素$(a,b)$令其满足$a\neq b$和$b=\alpha\cdot a$，则称这对元素为$\alpha$-对.

KC测试的过程包括如下四步：

1. Bob随机选取$\alpha\in \mathbb{F}_p^\*$，$a\in G$，计算$b=\alpha\cdot a$。
2. Bob将$\alpha$-对$(a,b)$发送给Alice。
3. Alice必须返回另一对$\alpha$-对$(a',b')$给Bob。
4. 当且仅当$(a',b')$也为$alpha$-对时，Bob才会接受Alice的回应。

那么Alice如何做到在不知道$\alpha$的情况下生成另一对$\alpha$-对$(a',b')$的呢？很简单：Alice首先选择$\gamma\in \mathbb{F}_p^\*$, 然后计算$(a',b')=(\gamma\cdot a,\gamma\cdot b)$。

因为$b'=\gamma\cdot b=\gamma\alpha\cdot a=\alpha(\gamma\cdot a)=\alpha\cdot a'$，所以$(a',b')$是$\alpha$-对。

The Knowledge of Coefficient Assumption (KCA)[^kca]states that this is always the case, namely:

KCA: _If Alice returns a valid response $(a',b')$ to Bob’s challenge $(a,b)$ with non-negligible probability over Bob’s choices of $a,\alpha$, then she knows $\gamma$ such that $a'=\gamma\cdot a$_.

[^kca]: This is typically called the Knowledge of Exponent Assumption in the literature, as traditionally it was used for groups written multiplicatively.

## 如何为可验证多项式进行盲评价

假设Alice手中掌握着$d$次多项式$P$: $P(s)=a_0 + a_1\cdot s + \cdots + a_d\cdot s^d$，另一方Bob手中掌握着其随机选取的点$s\in \mathbb{F}_p$。现在，需要构造一个协议，使得Bob可以验证$E(P(s))$的值，并且满足两个条件：

1. __Blindness__: 一方面，Alice无法得知点$s$的值；另一方面，Bob也无法得知多项式$P$的形式。
2. __Verifiability__: 当Alice发送虚假数据，即不使用多项式$P$计算$E(P(s))$的值时，Bob接受该数据的概率可忽略不计。

这就是所谓的 verifiable blind evaluation of a polynomial. 按照[同态隐藏](#%E5%90%8C%E6%80%81%E9%9A%90%E8%97%8F)，则条件1可以达成。而为了达成条件2，需要对[盲评价多项式](#%E7%9B%B2%E8%AF%84%E4%BB%B7%E5%A4%9A%E9%A1%B9%E5%BC%8F)的 the Knowledge of Coefficient Assumption (KCA) 进行扩展。

### 扩展的KCA

在[KC测试](#kc%E6%B5%8B%E8%AF%95)一节中，对于单个值$\alpha$而言，Bob发送了一些$\alpha$-对$(a,b=\alpha\cdot a)$给Alice，并要求Alice生成并回发一些其他的$\alpha$-对$(a',b')$，此时Alice可以计算$\alpha$的值。

现在假设Bob发送了多个$\alpha$-对$(a_1,b_1),\cdots,(a_d,b_d)$，Alice可以选择$\{c_1,\cdots,c_d\}$，并定义$(a',b')=(\sum_{i=1}^d c_i a_i,\sum_{i=1}^d c_i b_i)$，则$(a',b')$即最终需要验证的$\alpha$-对。

假设由$g$生成测度为$p$的域$G$，那么d-power Knowledge of Coefficient Assumption (d-KCA)可表述为

d-KCA: 假设Bob从$\mathbb{F}\_p^\*$中随机选取$\alpha$，并且从$\mathbb{F}\_{p}$中随机选取$s$，然后给Alice发送了$\alpha$-对$(g,\alpha\cdot g),(s\cdot g,\alpha s\cdot g),\cdots,(s^d\cdot g,\alpha s^d\cdot g)$。假设Alice生成了另一对$\alpha$-对$(a',b')$。那么Alice有极大概率可以选择$\{c_0,\cdots,c_d\}$使得$\sum_{i=0}^d c_i\cdot s^i\cdot g=a'$。

在d-KCA的假设下，Bob发送给Alice的$\alpha$-对必须符合一定的“线性结构”。

### 可验证的盲评价多项式协议

假设同态隐藏映射为$E(x)=x\cdot g$，为简单起见，由特定同态隐藏映射$E$构造的协议为：

1. Bob随机选取$\alpha\in\mathbb{F}_p^\*$并将元素集合$\{1,s,\cdots, s^d\}$和$\{\alpha,\alpha s,\cdots, \alpha s^d\}$代入$E$计算所得同态隐藏值$g,s\cdot g,\cdots, s^d\cdot g$和$\alpha\cdot g,\alpha s\cdot g,\cdots, \alpha s^d\cdot g$发送给Alice。
2. Alice根据Bob发送过来的数据计算$a=P(s)\cdot g$和$b=\alpha P(s)\cdot g$然后将结果发送给Bob。
3. Bob检验$b=\alpha\cdot a$，当且仅当等式成立Bob才会接受协议成立。

此时我们称该协议是可验证的盲评价多项式的协议。

## 从表达式到多项式

这一节的内容可以参考V神的博客<https://medium.com/@VitalikButerin/quadratic-arithmetic-programs-from-zero-to-hero-f6d558cea649>。首先，zk-SNARKs协议不能直接应用于计算，需要将问题转化为正确的“形式”，即Quadratic Arithmetic Program (QAP)，可以参考论文<https://eprint.iacr.org/2012/215.pdf>，该论文内容相当复杂，本文仅给出一个简单的例子。

### 从表达式到R1CS

假设Alice想要向Bob证明她知道$c_1,c_2,c_3\in \mathbb{F}_p$并使得$(c_1\cdot c_2)\cdot (c_1+c_3)=7$。在这过程中，Bob始终对$c_1,c_2,c_3$“零知识”。首先，将表达式$(c_1\cdot c_2)\cdot (c_1+c_3)=7$转化为门电路的形式

![arthmetic-circuit](/img/blockchain/CircuitDrawing-1.png)

表达式$(c_1\cdot c_2)\cdot (c_1+c_3)$现在变成

> $s_1=c_1\cdot c_2$  
> $s_2=c_1+c_3$  
> $s_3=s_1\cdot s_2$

下一步，将其转化为Rand-1 Constraint System (R1CS)，它是一系列三元向量组$<a,b,c>$。R1CS的解$s$满足
\begin{equation}\label{eq:constraint}
s\*a\cdot s\*b - s\*c = 0,
\end{equation}
此处$\*$表示的是内积运算。对于上述例子而言，R1CS定义三元向量组中的向量形式为$(const,c_1,c_2,c_3,s_1,s_2,s_3)$，对于解向量$s$而言，`const`的值永远为`1`。

对于第一个门$s_1=c_1\cdot c_2$，可得满足约束条件$\eqref{eq:constraint}$的向量组

```text
a=[0,1,0,0,0,0,0]
b=[0,0,1,0,0,0,0]
c=[0,0,0,0,1,0,0]
```

同理，第二个门和第三个门对应的向量组分别为

```text
a=[1,0,0,0,0,0,0]
b=[0,1,0,1,0,0,0]
c=[0,0,0,0,0,1,0]
```

和

```text
a=[0,0,0,0,1,0,0]
b=[0,0,0,0,0,1,0]
c=[0,0,0,0,0,0,1]
```

现在我们得到了三个约束的R1CS

```text
A
[0,1,0,0,0,0,0]
[1,0,0,0,0,0,0]
[0,0,0,0,1,0,0]

B
[0,0,1,0,0,0,0]
[0,1,0,1,0,0,0]
[0,0,0,0,0,1,0]

C
[0,0,0,0,1,0,0]
[0,0,0,0,0,1,0]
[0,0,0,0,0,0,1]
```

假设Alice拥有$c_1=\frac{1}{2},c_2=4,c_3=3$，满足$(c_1\cdot c_2)\cdot (c_1+c_3)$，她想向Bob证明这件事，但$c_1,c_2,c_3$的值要对Bob保密。首先，计算每个门的值$s_1=c_1\cdot c_2=\frac{1}{2}\cdot4=2$, $s_2=c_1+c_3=\frac{1}{2}+3=\frac{7}{2}$, $s_3=s_1\cdot s_2=2\cdot \frac{7}{2}=7$. 得到解向量$s=[1,0.5,4,3,2,3.5,7]$. 利用$s$和约束条件$\eqref{eq:constraint}$可以对向量$a,b,c$进行验证，问题是，R1CS只能逐条验证，也就是每个门需要验证一次，对于实际应用中的计算往往非常复杂，可能有成千上万个门，有没有什么方法可以做到一次验证？答案是有，只需要引用多项式即可。

### 从R1CS到QAP

引入拉格朗日插值法：  
对某个多项式函数，给定$k+1$个取值点

$(x_0,y_0),\cdots,(x_k,y_k)$,

其拉格朗日多项式为

\begin{equation}\label{eq:lagelangri}
  L(x):=\sum_{j=0}^k y_j\cdot l_j (x),
\end{equation}

其中
\begin{align\*}
 l_j(x)&:=\prod_{i=0,i\neq j}^k \frac{x-x_i}{x_j-x_i} \\\\\\
       &=\frac{x-x_0}{xj-x_0} \cdots \frac{x-x_j-1}{xj-x_j-1} \frac{x-x_j+1}{x_j-x_j+1} \cdots \frac{x-x_k}{x_j-x_k}.
\end{align\*}

zk-SNARKs协议使用拉格朗日插值法将R1CS转化为QAP形式。该过程使用拉格朗日插值法将`A,B,C`由列数为6的三元向量组分别转化为行数为6的多项式系数矩阵。例如，向量组`A`的第一列为`[0,1,0]`，分别对应`1,2,3`行的`y`值，即求过点$(1,0),(2,1),(3,0)$的多项式。将这三个点代入拉格朗日多项式公式$\eqref{eq:lagelangri}$得
\begin{align\*}
L(x) &= \sum_{j=0}^3 y_j\cdot l_j (x) = l_2(x) \\\\\\
     &= 0.5 x^2 - 2x + 1.5
\end{align\*}

于是我们得到A系数矩阵的第一行为$[1.5,2,0.5]$. 安利一个网站<https://www.symbolab.com/>，只需输入`expand\:\frac{x-1}{2-1}\cdot \frac{x-3}{3-1}`，即可求得展开多项式

![polynomials](/img/blockchain/polynomials.png)

最终可得系数矩阵`Ap,Bp,Cp`（具体的数值不再计算）。

### 检查QAP

因为懒得计算了……这里我直接用V神博客上的例子。此时Alice拥有点$x=3$，她想要向Bob证明她知道$x^3 + x + 5 = 35$，但是Bob对此点$x$和表达式$x^3 + x + 5 = 35$一无所知-.-

首先是将表达式转化为门路形式，然后计算R1CS约束矩阵，得到

```text
A
[0, 1, 0, 0, 0, 0]
[0, 0, 0, 1, 0, 0]
[0, 1, 0, 0, 1, 0]
[5, 0, 0, 0, 0, 1]

B
[0, 1, 0, 0, 0, 0]
[0, 1, 0, 0, 0, 0]
[1, 0, 0, 0, 0, 0]
[1, 0, 0, 0, 0, 0]

C
[0, 0, 0, 1, 0, 0]
[0, 0, 0, 0, 1, 0]
[0, 0, 0, 0, 0, 1]
[0, 0, 1, 0, 0, 0]
```

系数矩阵为

```text
Ap
[-5.0, 9.166, -5.0, 0.833]
[8.0, -11.333, 5.0, -0.666]
[0.0, 0.0, 0.0, 0.0]
[-6.0, 9.5, -4.0, 0.5]
[4.0, -7.0, 3.5, -0.5]
[-1.0, 1.833, -1.0, 0.166]

Bp
[3.0, -5.166, 2.5, -0.333]
[-2.0, 5.166, -2.5, 0.333]
[0.0, 0.0, 0.0, 0.0]
[0.0, 0.0, 0.0, 0.0]
[0.0, 0.0, 0.0, 0.0]
[0.0, 0.0, 0.0, 0.0]

Cp
[0.0, 0.0, 0.0, 0.0]
[0.0, 0.0, 0.0, 0.0]
[-1.0, 1.833, -1.0, 0.166]
[4.0, -4.333, 1.5, -0.166]
[-6.0, 9.5, -4.0, 0.5]
[4.0, -7.0, 3.5, -0.5]
```

$s=[1,3,35,9,27,30]$. QAP检验实际上是一系列多项式的加法和减法合成的检验，如果约束条件$\eqref{eq:constraint}$仍然满足，即$Ap \* s\cdot Bp \* s - Cp \* s = 0$成立，那么所有门路的检查均通过，否则就是不可接受的数据。

<u>我们需要检查结果多项式$Ap \* s\cdot Bp \* s - Cp \* s = 0$在$x=1,2,3,4$处是否都为 0，若在这四个点处有一处不为0，那么验证失败，否则，验证成功。</u>（这个地方我真滴不懂是什么意思）根据代数学原理，正确性检查等价于结果多项式$Ap \* s\cdot Bp \* s - Cp \* s = 0$是否能够整除多项式$Z(x) = (x-1)\cdot (x-2)\cdot (x-3)\cdot (x-4)$. 不难看出多项式$Z(x)$是根据所有逻辑门约束条件所对应的点算出来的。通过这种等价形式的转化会大大减少我们的开销。

## 椭圆曲线配对

我把Zcash博客上的最后一节**Pairings of Elliptic Curves**挪到这里来。这里涉及到密码学的另一个同态加密算法：椭圆曲线加密算法。椭圆曲线加密算法涉及的数学知识比较复杂，具体可参考一些权威资料，下面对椭圆曲线的介绍转载自<https://www.cnblogs.com/Kalafinaian/p/7392505.html>。

### 椭圆曲线

一条椭圆曲线是在射影平面上满足威尔斯特拉斯方程（Weierstrass）所有点的集合（关于射影平面的讲解这里不详述）

$$ Y^2Z + a_1 X Y Z + a_3 Y Z^2 = X^3 + a_2 X^2 Z + a_4 X Z^2 + a_6 Z^3$$

1. 椭圆曲线方程是一个齐次方程。
2. 曲线上的每个点都必须是非奇异的（光滑的），偏导数$F_X(X,Y,Z)$、$F_Y(X,Y,Z)$、$F_Z(X,Y,Z)$不同为0。
3. 圆曲线的形状，并不是椭圆的。只是因为椭圆曲线的描述方程，类似于计算一个椭圆周长的方程故得名。

### 椭圆曲线普通方程

椭圆曲线普通方程：

$$ y^2 + a_1xy + a_3y = x^3 + a_2x^2 + a_4x + a_6 $$

无穷远点$(0, Y, 0)$

平常点$(x,y)$斜率$k$：

$$
 F_x(x,y) = a_1y - 3x^2 - 2a_2x - a_4  \\\\\\
 F_y(x,y) = 2y + a_1x + a_3 \\\\\\
 k = -\frac{F_x(x,y)}{F_y(x,y)} = \frac{3x^2 + 2a_2x + a_4 - a_1y}{2y + a_1x + a_3}
$$

### 椭圆曲线阿贝尔群

我们已经看到了椭圆曲线的图象，但点与点之间好象没有什么联系。我们能不能建立一个类似于在实数轴上加法的运算法则呢？这就要定义椭圆曲线的加法群，这里需要用到近世代数中阿贝尔群。

在数学中，群是一种代数结构，由一个集合以及一个二元运算所组成。已知集合和运算$(G,\*)$如果是群则必须满足如下要求

- 封闭性：$\forall a,b \in G$, $a\*b\in G$
- 结合性：$\forall a,b \in G$, 有$(a\*b)\*c=a\*(b\*c)$
- 单位元：$\exists e \in G$, $\forall a \in G$, 有$e\*a=a\*e=a$
- 逆元：$\forall a \in G$, $\exists b \in G$, s.t. $a\*b=b\*a=e$

同样在椭圆曲线也可以定义阿贝尔群。

任意取椭圆曲线上两点$P$、$Q$（若$P$、$Q$两点重合，则作$P$点的切线），作直线交于椭圆曲线的另一点$R'$，过$R'$做$y$轴的平行线交于$R$，定义$P+Q=R$。这样，加法的和也在椭圆曲线上，并同样具备加法的交换律、结合律。

同点加法  
若有$k$个相同的点$P$相加，记作$kP$  
$P+P+P=2P+P=3P$

### 有限域椭圆曲线

椭圆曲线是连续的，并不适合用于加密；所以，我们必须把椭圆曲线变成离散的点，我们要把椭圆曲线定义在有限域上。给定有限域$\mathbb{F}\_p$, 和本文前面提到过的一样，其中$p$为质数，并且对加法、乘法和除法是封闭的。$\mathbb{F}\_p$内运算满足交换律、结合律、分配律。则椭圆曲线$E\_p(a,b)$为

\begin{equation}\label{eq:elliptic-curves}
  y^2 = x^3 + ax + b \pmod p
\end{equation}

$\mathbb{F}\_p$上的椭圆曲线同样有加法

1. 无穷远点 $O\infty$是零元，有$O\infty + O\infty = O\infty$，$O\infty+P=P$
2. $P(x,y)$的负元是 $(x,-y mod p)= (x,p-y)$ ，有$P+(-P)= O\infty$
3. $P(x_1,y_1)$, $Q(x_2,y_2)$的和$R(x_3,y_3)$ 有如下关系：

$x_3\equiv k^2-x_1-x_2 \pmod p$  
$y_3\equiv k\cdot (x_1-x_3) - y_1 \pmod p$  
若$P=Q$, 则$k=(3x^2 + a)/2y_1 \pmod p$  
若$P\neq Q$, 则$k = (y_2 - y_1)/(x_2-x_1) \pmod p$

例题：已知椭圆曲线$E_{23}(1,1)$上两点$P(3,10)$，$Q(9,7)$，求

1. $-P$
2. $P+Q$
3. $2P$

\begin{array}{l}
 (1) - P = ( 3, - 10\bmod 23 ) = ( 3,13 ) \\\\\\
     \\\\\\
 (2) k = \frac{7 - 10}{9 - 3} =  - 2^{-1} \bmod 23 \\\\\\
     2 \cdot 2^{-1} = 1 \bmod 23 \Rightarrow 2^{-1} = 12 \\\\\\
     k =  - 12 \bmod 23 = 11 \\\\\\
     P + Q = ( 11^2 - 3 - 9 \bmod 23, 11 \cdot ( 3 - (- 6)) \bmod 23 ) = ( 17,20 ) \\\\\\
     \\\\\\
 (3) k = \frac{3 \cdot {3^2} + 1}{2 \cdot 10} \bmod 23 = 7 \cdot 5^{-1} \bmod 23 \\\\\\
     5 \cdot 5^{-1} = 1 \bmod 23 \Rightarrow 5^{-1} = 14 \\\\\\
     k = 7 \cdot 14 \bmod 23 = 6 \\\\\\
     2P = ( 6^2 - 3 - 3 \bmod 23, 6 \cdot (3 - 7) \bmod 23 ) = ( 7,12 ) \\\\\\
\end{array}

### 有限域椭圆曲线点的阶

如果椭圆曲线上一点$P$，存在最小的正整数$n$使得数乘$nP = O\infty$,则将$n$称为$P$的阶。  
若$n$不存在，则$P$是无限阶的。

计算可得$27P=-P=(3,13)$

所以$28P=O\infty P$的阶为28

这些点做成了一个循环阿贝尔群，其中生成元为$P$，阶数为29。显然点的分布与顺序都是杂乱无章。

### 椭圆曲线加密

考虑$K=kG$，其中$K$、$G$为椭圆曲线$E\_p(a,b)$上的点，$n$为$G$的阶（$nG=O\infty$），$k$为小于$n$的整数。则给定$k$和$G$，根据加法法则，计算$K$很容易；但反过来，给定$K$和$G$，求$k$就非常困难。因为实际使用中的ECC原则上把$p$取得相当大，$n$也相当大，要把$n$个解点逐一算出来列成表格是不可能的。这就是椭圆曲线加密算法的数学依据。

点$G$称为基点（base point）  
$k(k<n)$为私有密钥（privte key）  
$K$为公开密钥（public key)

### zk-SNARKs协议中的椭圆曲线配对

终于来到本节的重点，Zcash是如何运用椭圆曲线加密算法来构造zk-SNARKs协议的呢？

## Pinocchio协议