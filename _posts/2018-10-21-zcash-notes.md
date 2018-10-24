---
title: 'Learn Zcash'
date: 2018-10-21
permalink: /posts/2018/10/learn zcash/
tags:
  - bitcoins
  - zero-knowledge proof
  - privacy
---

In this article, I will make some noetes about how [Zcash](https://github.com/zcash/zcash) works.

# Introduction

Imagine that you must prove you are at least 18 years old. Instead of whipping out your ID, the math underlying zero-knowledge proofs can allow you to make someone 100 percent certain that you are older than 18 without revealing a shred of other information about yourself. Not your name, address, a photo---nothing.

__Proofs__ In mathematics and in life, we often want to convince or prove things to others. Typically, if I know that $X$ is true, and I want convince you of that, I try to present all the facts I know and the inferences from that fact imply that $X$ is true.

__Zero-knowledge proofs__ In a _zero knowledge proof_ Alice will prove to Bob that a statement $X$ is true, Bob will completely convinced that $X$ is true but will not learn anything as a result of this process. That is, Bob will gain zero knowledge [^1].

[^1]: https://www.cs.princeton.edu/courses/archive/fall07/cos433/lec15.pdf

# Zero-knowledge Succint Non-interactive Arguments of Knowledge

In [Zcash Protocol Specification](https://github.com/zcash/zips/raw/master/protocol/protocol.pdf), zero-knowledge succint non-interactive arguments of knowledge (zk-SNARKs) is a kind of zero-knowledge cryptography which provides secure transparent payment scheme. zk-SNARKs is described in detail on thw website: <https://z.cash/technology/zksnarks>. Here, I just make some notes about its key technologies.

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

## The Knowledge of Coefficient Test and Assumption

## How to make Blind Evaluation of Polynomials Verifiable

## From Computations to Polynomials

## The Pinocchio Protocol

## Pairings of Elliptic Curves