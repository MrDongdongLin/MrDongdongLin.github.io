---
title: 'Matplotlib'
date: 2017-11-15
permalink: /posts/2017/11/Matplotlib/
tags:
  - math
---

The codes of this case can be cownloaded [here](/codes/matplotlib_case.py)

[Matplotlib](http://matplotlib.org/) is a Python plot library which produces publication quality figures. This blog will introduce that how to plot and improve a figure.

# Installation
`Matplotlib` is easy to install with Python tool `pip`
```python
python -mpip install -U pip
python -mpip install -U matplotlib
```
I suggest that you install [Anaconda](https://www.anaconda.com/download/), `Anaconda` is a welcome Python data science platform, it includes many Python packages like `Numpy`, `SciPy` and `Matplotlib`.

The following parts of this blog will show you how to plot and improve a figure with `Matplotlib` step by step.

# A simple case
Here is a simple case from the [gallery](http://matplotlib.org/gallery/index.html) of `Matplotlib`
```python
import numpy as np
import matplotlib.pyplot as plt

# evenly sampled time at 200ms intervals
t = np.arange(0., 50., 1)

# red dashes, blue squares and green triangles
plt.plot(t, t, 'r--', t, 2*t, 'bs')
plt.show()
```
In my github repository [Learn Python](https://github.com/MrDongdongLin/Learn-Python), the procedure is described that `how to remove the axes and the white margin of an image object that ploted by pyplot?`. Just use `fig = plt.figure()` to produce a figure, then save it with
```python
fig.savefig("pyplot.png", bbox_inches='tight', pad_inches = 0)
```
The following shows the produced figure.

![matplotlib_1](/img/pyplot/matplotlib_1.png)

This figure is well enough to put into a paper or other normal publications, because it has `different markers`, `clear ticks` and `a wrap border`. But it can be improved to make it perfect.

# Improvement
## Axis ticks
Notice that the arrange of `t` is $[0,50]$, and the spacing between values is `1`, but the tick on the figure is `10`. A more appropriate axis ticks can be set with
```python
ax.xaxis.set_major_locator(ticker.MultipleLocator(5.00))
ax.xaxis.set_minor_locator(ticker.MultipleLocator(1.00))
```
Oh, you must create a subplot firstly
```python
ax = plt.subplot(111)
```
Now we have the following figure.

![matplotlib_2](/img/pyplot/matplotlib_2.png)

## $\rm \TeX$ used format
Default font of the figure is not fit with $\rm \TeX$ font, if the text needs $\rm \TeX$ font, the following command should be included.
```python
from matplotlib import rc
rc('font',**{'family':'sans-serif','sans-serif':['Helvetica']})
rc('text', usetex=True)
```
For clarity, you'd better add `label` and `legend` and set the `font size` of `label` and `ticks` with
```python
# Add label
font = {'family': 'serif',
        'color':  'black',
        'size': 22}
plt.xlabel(r'$x$', fontdict=font)
plt.ylabel(r'$y$', fontdict=font)
ax.tick_params(labelsize=18, colors='black',left='on')

# Add legend
plt.legend(loc = 'upper left',
        labels = [r'$y=x$',r'$y=2\cdotx'],
        fancybox = True,
        fontsize = 16)
```
Now we have a new figure.

![matplotlib_3](/img/pyplot/matplotlib_3.png)

## Add grid
Last but not least, a `grid` should be added to make the figure more accuracy, 
```python
ax.set_axisbelow(True) # Set grid below the figure border when the grid's color is not black.
plt.grid(which='both', linewidth=1, color='gray')
```
The purpose that setting 'kwargs' `linewidth` and `color` is to make a soft vision when you put it into a `pdf` file. If you use the default color `black`, when you zoom in the `pdf`, it will be like this

![zoom-in](/img/pyplot/matplotlib_clear.png)

When you zoom out, guess what happend?

![zoom-out](/img/pyplot/matplotlib_mohu.png)

It looks sharply! A soft vision is quite important, too.

The final version of our figure is

![matplotlib_4](/img/pyplot/matplotlib_4.png)
