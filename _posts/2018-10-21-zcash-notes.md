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

- [Introduction](#introduction)
- [Zero-Knowledge Succint Non-Interactive Arguments of Knowledge](#zero-knowledge-succint-non-interactive-arguments-of-knowledge)
  - [How zk-SNARKs are constructed in Zcash](#how-zk-snarks-are-constructed-in-zcash)
  - [Homomorphic Hiding](#homomorphic-hiding)
  - [Blind Evaluation of Polynomials](#blind-evaluation-of-polynomials)
    - [Polynomials and linear combinations](#polynomials-and-linear-combinations)
    - [Blind evaluation of a polynomial](#blind-evaluation-of-a-polynomial)
  - [The Knowledge of Coefficient Test and Assumption](#the-knowledge-of-coefficient-test-and-assumption)
    - [The KC Test](#the-kc-test)
  - [How to make Blind Evaluation of Polynomials Verifiable](#how-to-make-blind-evaluation-of-polynomials-verifiable)
    - [An Extended KCA](#an-extended-kca)
    - [可验证的盲评价多项式协议](#%E5%8F%AF%E9%AA%8C%E8%AF%81%E7%9A%84%E7%9B%B2%E8%AF%84%E4%BB%B7%E5%A4%9A%E9%A1%B9%E5%BC%8F%E5%8D%8F%E8%AE%AE)
  - [From Computations to Polynomials](#from-computations-to-polynomials)
  - [The Pinocchio Protocol](#the-pinocchio-protocol)
  - [Pairings of Elliptic Curves](#pairings-of-elliptic-curves)

# Introduction

Imagine that you must prove you are at least 18 years old. Instead of whipping out your ID, the math underlying zero-knowledge proofs can allow you to make someone 100 percent certain that you are older than 18 without revealing a shred of other information about yourself. Not your name, address, a photo---nothing.

__Proofs__ In mathematics and in life, we often want to convince or prove things to others. Typically, if I know that $X$ is true, and I want convince you of that, I try to present all the facts I know and the inferences from that fact imply that $X$ is true.

__Zero-knowledge proofs__ In a _zero knowledge proof_ Alice will prove to Bob that a statement $X$ is true, Bob will completely convinced that $X$ is true but will not learn anything as a result of this process. That is, Bob will gain zero knowledge. [^zk]

[^zk]: https://www.cs.princeton.edu/courses/archive/fall07/cos433/lec15.pdf

# Zero-Knowledge Succint Non-Interactive Arguments of Knowledge

In [Zcash Protocol Specification](https://github.com/zcash/zips/raw/master/protocol/protocol.pdf), zero-knowledge succint non-interactive arguments of knowledge (zk-SNARKs) is a kind of zero-knowledge cryptography which provides secure transparent payment scheme. zk-SNARKs is described in detail on the website: <https://z.cash/technology/zksnarks>. The followings are some notes about its key technologies.

## How zk-SNARKs are constructed in Zcash

In the following section, we give a brief overview of how the rules for determining a valid transaction get transformed into equations that can then be evaluated on a candidate solution without revealing any sensitive information to the parties verifying the equations.

__Computation $\Rightarrow$ Arithmetic Circuit $\Rightarrow$ R1CS $\Rightarrow$ QAP $\Rightarrow$ zk-SNARK__

The first step in turning our transaction validity function into a mathematical representation is to break down the logical steps into the smallest possible operations, creating an “arithmetic circuit”.

Our next step is to build what is called a Rank 1 Constraint System, or R1CS, to check that the values are “traveling correctly”. In this example, the R1CS will confirm, for instance, that the value coming out of the multiplication gate where $b$ and $c$ went in is $b\cdot c$. In this R1CS representation, the verifier has to check many constraints — one for almost every wire of the circuit. (For technical reasons, it turns out we only have a constraint for wires coming out of multiplication gates.) In a 2012 paper on the topic, Gennaro, Gentry, Parno and Raykova presented a nice way to “bundle all these constraints into one”. This method uses a representation of the circuit called a Quadratic Arithmetic Program (QAP). The single constraint that needs to be checked is now between polynomials rather than between numbers. [^R1CS]

[^R1CS]: https://eprint.iacr.org/2012/215.pdf

## Homomorphic Hiding

An Homomorphic Hiding (HH) of a number $x$ is a function satisfying the following properties:

- For most $x'$s, given $E(x)$ it is hard to find $x$.
- Different inputs lead to different outputs---so if $x\neq y$, then $E(x)\neq E(y)$.
- if someone knows $E(x)$ and $E(y)$, they can generate the HH of arithmetic expression in $x$ and $y$. For example, they can compute $E(x+y)$ from $E(x)$ and $E(y)$.

For example, Alice owns numbers of $x$ and $y$, where $x+y=7$. Now she wants to prove to Bob that $x+y=7$ without telling him the value of $x$ and $y$. The verifying procedure is as follows.

- Alice calculates $E(x)$ and $E(y)$ and sends it to Bob.
- Because function $E$ satisfied the properties of HH, Bob can calculate $E(x+y)$ according to $E(x)$ and $E(y)$.
- Then Bob can calculate $E(7)$ and verify if $E(x+y)=E(7)$.

More specifically, zk-SNARKs uses the _discrete logarithm problem_ to construct an HH. The _discrete logarithm problem_ is believed to be hard in $\mathbb{Z}_p^\*$. This means that when $p$ is large, given an lelment $h$ in $\mathbb{Z}_p^\*$, it is difficult to find the integer $a$ in $\{0,1,\cdots,p-2\}$ such that $g^a=h\bmod p$.

## Blind Evaluation of Polynomials

We denote by $\mathbb{F}_p$ the field of size $p$; that is, the elements of $\mathbb{F}_p$ are $\{0,1,\cdots,p-1\}$ and addition and multiplication are done $\bmod p$ as explained in  [Part 1](#homomorphic-hiding).

### Polynomials and linear combinations

Recall that a polynomial $P$ of degree $d$ over $\mathbb{F}_p$ is an expression of the form

\begin{equation}\label{eq:polynomial}
  P(X) = a_0 + a_1\cdot X + a_2\cdot X^2 + \cdots + a_d\cdot X^d,
\end{equation}

for some $a_0,\cdots,a_d\in \mathbb{F}_p$. One can calculate $P$ for a point $s\in \mathbb{F}_p$ with Eq. \eqref{eq:polynomial}.

Suppose a polynomial $P=ax+by$, given $a,b,E(x),E(y)$, one can calculate $E(ax+by)$ from
$$
E(ax+by) = g^{ax+by} = g^{ax}\cdot g^{by} = (g^x)^a\cdot (g^y)^b = E(x)^a\cdot E(y)^b.
$$

### Blind evaluation of a polynomial

Suppose Alice has a polynomial $P$ of degree $d$, and Bob has a point $s\in \mathbb{F}_p$ that he chose randomly. Bob wishes to learn $E(P(s))$, i.e., the HH of the evaluation of $P$ at $s$. Two simple ways to do this are:

- Alice sends $P$ to Bob, and he computes $E(P(s))$ by himself.
- Bob sends $s$ to Alice; she computes $E(P(s))$ and sends it to Bob.

However, in the _blind evaluation problem_ we want Bob to learn $E(P(s))$ without learning $P$ --- which precludes the first option; and, most importantly, we don’t want Alice to learn $s$, which rules out the second [^1].

Using HH, we can perform blind evaluation as follows.

1. Bob sends to Alice the hidings $E(1),E(s),\cdots,E(s^d)$.
2. Alice computes $E(P(s))$ from the elements sent in the first step, and sends $E(P(s))$ to Bob. (Alice can do this since $E$ supports linear combinations, and $P(s)$ is linear combination of $1,s,\cdots,s^d$.)

Note that, as only hidings were sent, neither Alice learned $s$ [^2], nor Bob learned $P$.

[^1]: The main reason we don’t want to send $P$ to Bob, is simply that it is large – (d+1) elements, where, for example, d~2000000 in the current Zcash protocol; this ultimately has to do with the “Succinct” part of SNARKs. It is true that the sequence of hidings Bob is sending to Alice above is just as long, but it will turn out this sequence can be “hard-coded” in the parameters of the system, whereas Alice’s message will be different for each SNARK proof.

[^2]: Actually, the hiding property only guarantees $s$ not being recoverable from $E(s)$, but here we want to claim it is also not recoverable from the sequence $E(s),\cdots,E(s^d)$ that potentially contains more information about $s$. This follows from the d-power Diffie-Hellman assumption, which is needed in several SNARK security proofs.

## The Knowledge of Coefficient Test and Assumption

In [Part 2](#blind-evaluation-of-polynomials), Alice is able to compute $E(P(s))$. However, no one can guarantee that Alice will indeed send it to Bob. So we need a way to "force" Alice to follow the protocol correctly --- the _Knowledge of Coefficient (KC) Test_.

### The KC Test

For $\alpha\in \mathbb{F}_p$, let us call a pair of elements $(a,b)$ in $G$ an $\alpha$-pair if $a\neq b$ and $b=\alpha\cdot a$.

The KC Test proceeds as follows.

1. Bob chooses random $\alpha\in \mathbb{F}_p^*$ and $a\in G$. He computes $b=\alpha\cdot a$.
2. He sends to Alice the "chanllenge" pair $(a,b)$. Note that $(a,b)$ is an $\alpha$-pair.
3. Alice must now respond with a different pair $(a',b')$ that is also an $\alpha$-pair.
4. Bob accepts Alice's response only if $(a',b')$ is indeed an $\alpha$-pair. (As he knows $\alpha$ he can check if $b'=\alpha\cdot a$.)

So how can Alice successfully respond to the challenge without knowing $\alpha$? Here's the natural way to do it: Alice simply chooses some $\gamma\in \mathbb{F}_p^*$, and responds with $(a',b')=(\gamma\cdot a,\gamma\cdot b)$.

Since $b'=\gamma\cdot b=\gamma\alpha\cdot a=\alpha(\gamma\cdot a)=\alpha\cdot a'$, indeed $(a',b')$ is an $\alpha$-pair as required.

The Knowledge of Coefficient Assumption [^kca](KCA) states that this is always the case, namely:

KCA: _If Alice returns a valid response $(a',b')$ to Bob’s challenge $(a,b)$ with non-negligible probability over Bob’s choices of $a,\alpha$, then she knows $\gamma$ such that $a'=\gamma\cdot a$_.

[^kca]: This is typically called the Knowledge of Exponent Assumption in the literature, as traditionally it was used for groups written multiplicatively.

## How to make Blind Evaluation of Polynomials Verifiable

Let us briefly describe the conducted protocol:

假设Alice手中掌握着$d$次多项式$P$: $P(s)=a_0 + a_1\cdot s + \cdots + a_d\cdot s^d$，另一方Bob手中掌握着其随机选取的点$s\in \mathbb{F}_p$。现在，需要构造一个协议，使得Bob可以验证$E(P(s))$的值，并且满足两个条件：

1. __Blindness__: 一方面，Alice无法得知点$s$的值；另一方面，Bob也无法得知多项式$P$的形式。
2. __Verifiability__: 当Alice发送虚假数据，即不使用多项式$P$计算$E(P(s))$的值时，Bob接受该数据的概率可忽略不计。

这就是所谓的 _verifiable blind evaluation of a polynomial_. 按照[Part 1](#homomorphic-hiding)，则条件1可以达成。而为了达成条件2，需要对[Part 2](#blind-evaluation-of-polynomials)的 _the Knowledge of Coefficient Assumption (KCA)_ 进行扩展。

### An Extended KCA

在[The KC Test](#the-kc-test)一节中，对于单个值$\alpha$而言，Bob发送了一些$\alpha$-键值对$(a,b=\alpha\cdot a)$给Alice，并要求Alice生成并回发一些其他的$\alpha$-键值对$(a',b')$，此时Alice可以计算$\alpha$的值。

现在假设Bob发送了多个$\alpha$-键值对$(a_1,b_1),\cdots,(a_d,b_d)$，Alice可以选择$c_1,\cdots,c_d\in \mathbb{F}_p$，

假设由$g$生成测度为$p$的群$G$，那么 _d-power Knowledge of Coefficient Assumption (d-KCA)_ 可表述为

d-KCA: *假设Bob随机选取$\alpha\in \mathbb{F}_p^*$且$s\in \mathbb{F}_p$，并给Alice发送了$\alpha$-键值对$(g,\alpha\cdot g),(s\cdot g,\alpha s\cdot g),\cdots,(s^d\cdot g,\alpha s^d\cdot g)$。假设Alice生成了另一对$\alpha$-键值对$(a',b')$。那么Alice有极大概率可以选择$c_0,\cdots,c_d\in \mathbb{F}_p$使得$\sum_{i=0}^d c_is^i\cdot g=a'$。*

在d-KCA的假设下，Bob发送给Alice的$\alpha$-键值对必须符合一定的“线性结构”。

### 可验证的盲评价多项式协议

假设同态隐藏映射HH为$E(x)=x\cdot g$，根据上述规则由$g$生成群$G$：

为简单起见，由特定同态隐藏映射$E$构造的协议为：

1. Bob随机选取$\alpha\in\mathbb{F}_p^*$并将元素集合$(1,s,\cdots, s^d)$和$(\alpha,\alpha s,\cdots, \alpha s^d)$代入HH计算所得同态隐藏值$g,s\cdot g,\cdots, s^d\cdot g$和$\alpha\cdot g,\alpha s\cdot g,\cdots, \alpha s^d\cdot g$发送给Alice。
2. Alice根据Bob发送过来的数据计算$a=P(s)\cdot g$和$b=\alpha P(s)\cdot g$然后将结果发送给Bob。
3. Bob检验$b=\alpha\cdot a$，当且仅当等式成立Bob才会接受协议成立。

此时我们称该协议是可验证的盲评价多项式的协议。

## From Computations to Polynomials

## The Pinocchio Protocol

## Pairings of Elliptic Curves