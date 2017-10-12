---
layout: post
title: "jekyll-clean"
date: 2017-10-04 5:41:00 +0800
comments: false
category: others
tag: jekyll
---

# jekyll-clean
See more infomation at [here](https://github.com/scotte/jekyll-clean).

- fork the repo.
- change the repo's name as `username.github.io`, where `username` is your github name.
- modified `_config.yml` at the tag of TODO as the following codes.
- now you can see your blog at `username.github.io`, enjoy.

```yml
name: My blog # TODO
description: A jekyll theme # TODO

# url is currently only used only for the RSS feed in feed.xml
url: https://scotte.github.io/jekyll-clean  # TODO

# baseurl will often be '', but for a project page on gh-pages, it needs to
# be the project name.
# *** IMPORTANT: If your local "jekyll serve" throws errors change this to '' or
#     run it like so: jekyll serve --baseurl=''
baseurl: /jekyll-clean # TODO delete /jekyll-clean

# This can be '' to hide the Github nav button
github: 'scotte/jekyll-clean' # TODO

# Set this to your UA-# value, or '' to disable the block completely
gaaccount: ''

# The 'comments' setting enables comments. You'll need to select either
# disqus or isso below to choose a comment system. Individual posts can
# override 'comments' to disable on a post-by-post basis.
comments: true

# Set this to your public isso URL to enable comments via isso. Set to '' to disable isso.
isso: ''

# Set this to your disqus shortname to enable comments via disqus. Set to '' to disable disqus.
disqus: ''

permalink: /:year/:month/:title # TODO
paginate: 3

highlighter: rouge
markdown: kramdown
gems: ['jekyll-paginate']

exclude: ['README.md', 'LICENSE']
```

# 支持中文
本地调试jekyll时会遇到中文无法解析，但上传至github上却没有问题的情况，请参考[这篇文章](http://blog.csdn.net/yinaoxiong/article/details/54025482)解决。

修改安装目录\Ruby22-x64\lib\ruby\2.2.0\webrick\httpservlet下的filehandler.rb文件，建议先备份。

找到下列两处，添加一句（+的一行为添加部分）

```rb
path = req.path_info.dup.force_encoding(Encoding.find("filesystem"))
+ path.force_encoding("UTF-8") # 加入编码
if trailing_pathsep?(req.path_info)
```

```rb
break if base == "/"
+ base.force_encoding("UTF-8") #加入編碼
break unless File.directory?(File.expand_path(res.filename + base))
```
修改完重新jekyll serve即可支持中文文件名。 