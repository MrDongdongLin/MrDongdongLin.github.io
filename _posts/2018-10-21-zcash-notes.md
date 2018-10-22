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

Introduction
============

Imagine that you must prove you are at least 18 years old. Instead of whipping out your ID, the math underlying zero-knowledge proofs can allow you to make someone 100 percent certain that you are older than 18 without revealing a shred of other information about yourself. Not your name, address, a photo---nothing.

__Proofs__ In mathematics and in life, we often want to convince or prove things to others. Typically, if I know that $X$ is true, and I want convince you of that, I try to present all the facts I know and the inferences from that fact imply that $X$ is true.

__Zero-knowledge proofs__ In a _zero knowledge proof_ Alice will prove to Bob that a statement $X$ is true, Bob will completely convinced that $X$ is true but will not learn anything as a result of this process. That is, Bob will gain zero knowledge [^1].

[^1]: https://www.cs.princeton.edu/courses/archive/fall07/cos433/lec15.pdf

In [Zcash Protocol Specification](https://github.com/zcash/zips/raw/master/protocol/protocol.pdf), 