import numpy as np
import matplotlib.pyplot as plt
import matplotlib.ticker as ticker
from matplotlib import rc
rc('font',**{'family':'sans-serif','sans-serif':['Helvetica']})
rc('text', usetex=True)

# evenly sampled time at 200ms intervals
t = np.arange(0., 50., 1)

# red dashes, blue squares and green triangles
fig = plt.figure()
ax = plt.subplot(111)

plt.plot(t, t, 'r--', t, 2*t, 'bs')

ax.xaxis.set_major_locator(ticker.MultipleLocator(5.00))
ax.xaxis.set_minor_locator(ticker.MultipleLocator(1.00))

font = {'family': 'serif',
        'color':  'black',
        'size': 22}
plt.xlabel(r'$x$', fontdict=font)
plt.ylabel(r'$y$', fontdict=font)
ax.tick_params(labelsize=18, colors='black',left='on')

plt.legend(loc = 'upper left',
        labels = [r'$y=x$',r'$y=2\cdotx'],
        fancybox = True,
        shadow = True,
        fontsize = 16)

ax.set_axisbelow(True)
plt.grid(which='both', linewidth=1, color='gray')

plt.show()
fig.savefig("images/pyplot/matplotlib_4.png", bbox_inches='tight', pad_inches = 0)