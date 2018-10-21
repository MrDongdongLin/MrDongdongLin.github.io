---
title: 'latexdiff'
date: 2018-01-17
permalink: /posts/2018/01/latexdiff/
tags:
  - others
---

使用`latexdiff`用于获得两个不同版本的`tex`文件的区别。

## 用途

提供本文所需的脚本和批处理文件，还有清理`tex`多余文件的脚本工具`TexClear.bat`（其实就是几个删除命令而已啦）也一并附上。

如果你拥有两个版本以上的`tex`源文件，例如：`xxx_v1.0`和`xxx_v2.0`，你可以通过[latexdiff](https://3142.nl/latex-diff/)这个工具来比较这两个版本的差异。就像这样：

![example_latexdiff](/img/其他/latexdiff.png)

## 使用教程

1. 安装依赖环境`Perl`：http://downloads.activestate.com/ActivePerl/releases/
2. 下载脚本`latexdiff.pl`：http://mirror.hmc.edu/ctan/support/latexdiff/latexdiff
3. 将你需要比较的两个`tex`源文件以及源文件依赖的`figures`、`bib`源文件放入同一文件夹内。
4. 新建一个`bat`批处理文件，写入内容

```
latexdiff.pl -t UNDERLINE xxx_v1.0.tex xxx_v2.0.tex > xxx_diff.tex  
pdflatex xxx_diff
bibtex xxx_diff
bibtex xxx_diff
pdflatex xxx_diff
pdflatex xxx_diff
```

5. 执行批处理文件，生成`xxx_diff.pdf`，打开该文件，恭喜你，get到了一个技能。

## 动图教程

![latexdiff_demo](/img/其他/latexdiff_demo.gif)