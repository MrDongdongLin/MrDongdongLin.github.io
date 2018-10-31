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
  - [从计算到多项式](#%E4%BB%8E%E8%AE%A1%E7%AE%97%E5%88%B0%E5%A4%9A%E9%A1%B9%E5%BC%8F)
  - [The Pinocchio Protocol](#the-pinocchio-protocol)
  - [Pairings of Elliptic Curves](#pairings-of-elliptic-curves)

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

The Knowledge of Coefficient Assumption [^kca](KCA) states that this is always the case, namely:

KCA: _If Alice returns a valid response $(a',b')$ to Bob’s challenge $(a,b)$ with non-negligible probability over Bob’s choices of $a,\alpha$, then she knows $\gamma$ such that $a'=\gamma\cdot a$_.

[^kca]: This is typically called the Knowledge of Exponent Assumption in the literature, as traditionally it was used for groups written multiplicatively.

## 如何为可验证多项式进行盲评价

假设Alice手中掌握着$d$次多项式$P$: $P(s)=a_0 + a_1\cdot s + \cdots + a_d\cdot s^d$，另一方Bob手中掌握着其随机选取的点$s\in \mathbb{F}_p$。现在，需要构造一个协议，使得Bob可以验证$E(P(s))$的值，并且满足两个条件：

1. __Blindness__: 一方面，Alice无法得知点$s$的值；另一方面，Bob也无法得知多项式$P$的形式。
2. __Verifiability__: 当Alice发送虚假数据，即不使用多项式$P$计算$E(P(s))$的值时，Bob接受该数据的概率可忽略不计。

这就是所谓的 _verifiable blind evaluation of a polynomial_. 按照[同态隐藏](#%E5%90%8C%E6%80%81%E9%9A%90%E8%97%8F)，则条件1可以达成。而为了达成条件2，需要对[盲评价多项式](#%E7%9B%B2%E8%AF%84%E4%BB%B7%E5%A4%9A%E9%A1%B9%E5%BC%8F)的 _the Knowledge of Coefficient Assumption (KCA)_ 进行扩展。

### 扩展的KCA

在[KC测试](#kc%E6%B5%8B%E8%AF%95)一节中，对于单个值$\alpha$而言，Bob发送了一些$\alpha$-对$(a,b=\alpha\cdot a)$给Alice，并要求Alice生成并回发一些其他的$\alpha$-对$(a',b')$，此时Alice可以计算$\alpha$的值。

现在假设Bob发送了多个$\alpha$-对$(a_1,b_1),\cdots,(a_d,b_d)$，Alice可以选择$\{c_i\}_{i=1}^d \in\mathbb{F}_p$，并定义$(a',b')=(\sum_{i=1}^d c_i a_i,\sum_{i=1}^d c_i b_i)$，则$(a',b')$即最终需要验证的$\alpha$-对。

假设由$g$生成测度为$p$的域$G$，那么d-power Knowledge of Coefficient Assumption (d-KCA)可表述为

d-KCA: 假设Bob随机选取$\alpha\in \mathbb{F}_p^\*$且$s\in \mathbb{F}_p$，并给Alice发送了$\alpha$-对$(g,\alpha\cdot g),(s\cdot g,\alpha s\cdot g),\cdots,(s^d\cdot g,\alpha s^d\cdot g)$。假设Alice生成了另一对$\alpha$-对$(a',b')$。那么Alice有极大概率可以选择$\{c_i\}_{i=0}^d \in\mathbb{F}_p$，使得$\sum_{i=0}^d c_i\cdot s^i\cdot g=a'$。

在d-KCA的假设下，Bob发送给Alice的$\alpha$-对必须符合一定的“线性结构”。

### 可验证的盲评价多项式协议

假设同态隐藏映射为$E(x)=x\cdot g$，为简单起见，由特定同态隐藏映射$E$构造的协议为：

1. Bob随机选取$\alpha\in\mathbb{F}_p^\*$并将元素集合$\{1,s,\cdots, s^d\}$和$\{\alpha,\alpha s,\cdots, \alpha s^d\}$代入$E$计算所得同态隐藏值$g,s\cdot g,\cdots, s^d\cdot g$和$\alpha\cdot g,\alpha s\cdot g,\cdots, \alpha s^d\cdot g$发送给Alice。
2. Alice根据Bob发送过来的数据计算$a=P(s)\cdot g$和$b=\alpha P(s)\cdot g$然后将结果发送给Bob。
3. Bob检验$b=\alpha\cdot a$，当且仅当等式成立Bob才会接受协议成立。

此时我们称该协议是可验证的盲评价多项式的协议。

## 从计算到多项式

## The Pinocchio Protocol

## Pairings of Elliptic Curves