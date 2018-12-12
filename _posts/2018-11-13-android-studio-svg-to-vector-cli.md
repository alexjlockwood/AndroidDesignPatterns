---
layout: post
title: "How to use Android Studio's SVG-to-VectorDrawable converter from the command line"
date: 2018-11-13
permalink: /2018/11/android-studio-svg-to-vector-cli.html
related: ['/2013/08/fragment-transaction-commit-state-loss.html',
    '/2016/11/introduction-to-icon-animation-techniques.html',
    '/2016/08/contextcompat-getcolor-getdrawable.html']
---

<!--morestart-->

Since the very beginning, one of the most annoying aspects of using `VectorDrawable`s on Android has been the lack of a reliable SVG converter. Google has recently made huge strides towards improving Android Studio's SVG-to-`VectorDrawable` tool in order to improve this experience. 

However, there has always been one major issue for me: the tool doesn't support batch conversion of SVGs and can't be invoked from the command line. Working at Lyft, it's not uncommon for me to need to convert hundreds of SVGs into `VectorDrawable`s at a time. Having to go through Android Studio's GUI in order to convert each SVG one-by-one is simply not realistic.

<!--more-->

Well, this weekend my good buddy [Nick Butcher](https://twitter.com/crafty) taught me how to build the tool as a binary that can be executed from the command line, and I'm so excited about it that I had to share it with the world! :)

## Where can I download it?

I anticipate many won't want to go through the trouble of building these binaries from scratch, so I built them myself and hosted them on [Google Drive here](https://j.mp/svg-to-vector-google-drive).

## How do I run it?

The following command will convert all SVGs in a directory called `svgs/`, convert them all into `VectorDrawable`s, and write them to a directory called `vectors/`. Note that both directories must exist beforehand.

```
./vd-tool -c -in svgs/ -out vectors/
```

## How do I build it?

In case you want to build these yourself, here's how I did it.

First, follow the [Downloading the Source](https://source.android.com/source/downloading.html) guide to install and set up the `repo` tool, but instead of running the listed `repo` commands to initialize the repository, run the folowing:

```
repo init -u https://android.googlesource.com/platform/manifest -b <most-recent-android-studio-branch>
```

At the time of this writing, the most recent Android Studio branch was `studio-3.2.1`. This will obviously change over time as newer versions of Android Studio are released.

Now that your repository is set to pull only what you need for building and running the tool, download the code using the following command (you might want to grab a coffee or something too, as this command might take a while to complete):

```
repo sync -j8 -c
```

Finally, execute the following to build the binaries:

```
cd ./tools/base
../gradlew publishLocal
```

Once it completes, you should find the binaries in a `<root>/out/build/base/vector-drawable-tool/build/distributions/vd-tool.zip` file. Unzip it and it will extract a `/bin` directory that contains binaries compatible with Mac OS X, Linux, and Windows.

## How do I report bugs?

Now for the most important part of this blog post...

Please, please, **please** file bugs if you discover SVGs that don't convert properly! File the bugs in the [Android Studio public issue tracker](https://issuetracker.google.com/issues?q=componentid:192708%20status:open). Here's [an example bug](https://issuetracker.google.com/issues/119372339) I recently reported if you need a template to go by.

My goal is to make the Android Studio converter the most reliable SVG-to-`VectorDrawable` converter out there. So if and when you file a bug, feel free to [hit me up on Twitter](https://twitter.com/alexjlockwood) with a link to the report and I'll do my best to ensure the bug is fixed as quickly as possible!

Happy converting!
