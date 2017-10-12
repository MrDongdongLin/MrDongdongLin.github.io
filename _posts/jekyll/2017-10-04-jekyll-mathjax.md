---
layout: post
title: "jekyll mathjax"
date: 2017-10-04 22:28:00 +0800
comments: false
category: others
tag: jekyll
---

# Math Support
Kramdown comes with optional support for LaTeX to PNG rendering via MathJax within math blocks. See the Kramdown documentation on math blocks and math support for more details. MathJax requires you to include JavaScript or CSS to render the LaTeX, e.g.
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.0/MathJax.js?config=TeX-AMS-MML_HTMLorMML" type="text/javascript"></script>
```

# Inline math
Wrap the math block, for example, \\(a+b=c\\), with `\\( a+b=c \\)`.

# Display math
Wrap the math block, for example, \\[a+b=c,\\] with `\\[ a+b=c \\]`.