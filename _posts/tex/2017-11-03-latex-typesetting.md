---
layout: post
title: "Latex Typesetting - formula"
date: 2017-11-03 20:09 +0800
comments: false
category: others
tag:
    - tex
    - formula
---

# How to typeset formula with multi-lines?
How to typeset a formula like
\\[
    \begin{align}
    a &= 
      \left(
      \sum_{i_1=1}^{N} \sum_{i_2=1}^{i_1} \cdots \sum_{i_t=1}^{i_t-1} \sum_{i=1}^{N-i_t+1} D_i + e + f + g 
      \right. \\\
      &+ \left. 
      \sum_{i_1=1}^{N} \sum_{i_2=1}^{i_1} \cdots \sum_{i_t=1}^{i_t-1} \sum_{i=1}^{N-i_t+1} H_i \right) + m + n \\\
      &= D' + \sum_{i_1=1}^{N} \sum_{i_2=1}^{i_1} \cdots \sum_{i_t=1}^{i_t-1} \sum_{i=1}^{N-i_t+1} H_i
    \end{align}
\\]
in a two columns paper?

There are two methods, one is to use `align`
```tex
\begin{align}
    a &= 
      \left(
      \sum_{i_1=1}^{N} \sum_{i_2=1}^{i_1} \cdots \sum_{i_t=1}^{i_t-1} \sum_{i=1}^{N-i_t+1} D_i + e + f + g 
      \right. \\\
      &+ \left. 
      \sum_{i_1=1}^{N} \sum_{i_2=1}^{i_1} \cdots \sum_{i_t=1}^{i_t-1} \sum_{i=1}^{N-i_t+1} H_i \right) + + m + n \\\
      &= D' + \sum_{i_1=1}^{N} \sum_{i_2=1}^{i_1} \cdots \sum_{i_t=1}^{i_t-1} \sum_{i=1}^{N-i_t+1} H_i
\end{align}
```
another is to use `dmath`
```tex
\usepackage{breqn}

\begin{dmath}
    a =
      \left(
      \sum_{i_1=1}^{N} \sum_{i_2=1}^{i_1} \cdots \sum_{i_t=1}^{i_t-1} \sum_{i=1}^{N-i_t+1} D_i + e + f + g \\\
      + \sum_{i_1=1}^{N} \sum_{i_2=1}^{i_1} \cdots \sum_{i_t=1}^{i_t-1} \sum_{i=1}^{N-i_t+1} H_i \right) + m + n \\\
      = D' + \sum_{i_1=1}^{N} \sum_{i_2=1}^{i_1} \cdots \sum_{i_t=1}^{i_t-1} \sum_{i=1}^{N-i_t+1} H_i
\end{dmath}
```