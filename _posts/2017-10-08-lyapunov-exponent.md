---
layout: post
title: "Largest Lyapunov exponent"
date: 2017-10-08 22:54:00 +0800
comments: false
category: others
tag:
    - math
---

In mathematics the Lyapunov exponent or Lyapunov characteristic exponent of a dynamical system is a quantity that characterizes the rate of separation of infinitesimally close trajectories[^Lyapunov].

[^Lyapunov]: Boeing, G. Visual Analysis of Nonlinear Dynamical Systems: Chaos, Fractals, Self-Similarity and the Limits of Prediction. Systems. vol. 4. pp. 37. 2016.

It is common to refer to the largest one as the Maximal Lyapunov exponent (MLE), because it determines a notion of predictability for a dynamical system. A positive MLE is usually taken as an indication that the system is chaotic (provided some other conditions are met, e.g., phase space compactness).

In the following, the procedure of calculating the largest Lyapunov exponent by Wolf's algorithm[^Wolf] will be introduced.

[^Wolf]: Wolf A, Swift J B, Swinney H L, et al., Determining Lyapunov exponents from a time series. Physica D: Nonlinear Phenomena, vol. 3. pp. 285-317. 1985.

# Delay reconstruction
Given a time series, delay reconstruction builds an \\(n\\)-dimensional "orbit" out of a time series once the user selects two parameters: the embedding dimension \\(n\\), and the time delay \\(\tau\\).
- Example: If \\(n\\) is chosen as 3, \\(\tau\\) is chosen as 5, and the time series consists of the values: \\(x_1, x_2, x_3,\cdots\\), then the delay reconstructed orbit would consist of the following sequence of points in 3-space:
\\[
    (x_1, x_6, x_{11}), (x_2, x_7, x_{12}), (x_3, x_8, x_{13}), \cdots.
\\]

That is, delay reconstruction produces the \\(n\\)-tuples:
\\[
    (x(t), x(t+\tau), x(t+2\tau),..., x(t+(n-1)\tau)).
\\]

# Largest Lyapunov exponent
The procedure of calculating the largest Lyapunov exponent \\(\lambda\\) can be described step-by-step as below:
- Compute the separation \\(L(t_0)\\) of nearby two points in the orbit of reconstructed phase space.
- Connect both points as they move a short distance along the orbit. Calculate the new separation \\(L(t_1)\\).
- If \\(L(t_1)\\) becomes too large, keep one of the points and choose an appropriate replacement for other point.
- Repeat Steps 1–3 after s propagations, the largest Lyapunov exponent \\(\lambda\\) should be calculated via

\\[
    \lambda=\frac{1}{t_q-t_0}\sum_{k=1}^{q}\left(\frac{L'(t_k)}{L(t_{k-1})}\right).
\\]

The following figure shows the above procedure.

![wolf_lyapunov](https://mrdongdonglin.github.io/images/wolf_lyapunov.png)
---
[1]: http://www.mdpi.com/2079-8954/4/4/37
[2]: http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.152.3162&rep=rep1&type=pdf