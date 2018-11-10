---
layout: post
title: 'Using Android Studio's SVG-to-VectorDrawable converter from the command line'
date: 2018-11-12
permalink: /2018/11/android-studio-svg-to-vector-cli.html
related: ['/2013/08/fragment-transaction-commit-state-loss.html',
    '/2016/11/introduction-to-icon-animation-techniques.html',
    '/2016/08/contextcompat-getcolor-getdrawable.html']
---

<!--morestart-->

This is how you build the SVG to `VectorDrawable` command line tool.

<!--more-->

Follow the [Downloading the Source](https://source.android.com/source/downloading.html) guide to install and set up `repo` tool, but instead of running the listed `repo` commands to initialize the repository, run the folowing:

```
repo init -u https://android.googlesource.com/platform/manifest -b studio-3.2.1
```

Now your repository is set to pull only what you need for building and running Android Studio's tools. Download the code (and grab a coffee while we pull down 3GB):

```
repo sync -j8 -c
```

Then execute the following:

```
cd ./tools/base
../gradlew publishLocal
```

Now look for the `<root>/out/build/base/vector-drawable-tool/build/distributions/vd-tool.zip` file. Unzip it and it will extract a `/bin` directory that has binaries for Mac OS X/Linux and Windows.

Here are prebuilt binaries that you can use: https://drive.google.com/open?id=1ZQguBBKTL8eMA1GnKLb-xYGP2MpjhW7A