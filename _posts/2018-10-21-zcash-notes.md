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
  - [The Knowledge of Coefficient Test and Assumption](#the-knowledge-of-coefficient-test-and-assumption)
  - [How to make Blind Evaluation of Polynomials Verifiable](#how-to-make-blind-evaluation-of-polynomials-verifiable)
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

We denote by $\mathbb{F}_p$ the field of size $p$; that is, the elements of $\mathbb{F}_p$ are $\{0,1,cdots,p-1\}$ and addition and multiplication are done $\bmod p$ as explained in  [Part 1](#homomorphic-hiding).

### Polynomials and linear combinations

Recall that a polynomial $P$ of degree $d$ over $\mathbb{F}_p$ is an expression of the form

\begin{equation}\label{eq:polynomial}
  P(X) = a_0 + a_1\cdot X + a_2\cdot X^2 + \cdots + a_d\cdot X^d,
\end{equation}

for some $a_0,\cdots,a_d\in \mathbb{F}_p$. One can calculate $P$ for a point $s\in \mathbb{F}_p$ with Eq.~\eqref{eq:polynomial}.

## The Knowledge of Coefficient Test and Assumption

## How to make Blind Evaluation of Polynomials Verifiable

## From Computations to Polynomials

## The Pinocchio Protocol

## Pairings of Elliptic Curves