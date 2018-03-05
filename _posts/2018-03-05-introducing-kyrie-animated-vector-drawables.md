---
layout: post
title: 'Introducing Kyrie - An Alternative to Animated Vector Drawables'
date: 2018-03-05
permalink: /2018/03/introducing-kyrie-animated-vector-drawables.html
related: ['/2013/08/fragment-transaction-commit-state-loss.html',
    '/2016/11/introduction-to-icon-animation-techniques.html',
    '/2016/08/contextcompat-getcolor-getdrawable.html']
style: |
    .figure-video {
      border-radius: 4px;
    }
    .figure-image {
      width: 100%;
      border-radius: 4px;
      text-align: center;
    }
    .figure-container {
      padding: 0% 10%;
    }
    .figure-parent {
      position: relative;
      width: 100%;
      padding-top: 46.875%;
    }
    .figure-element {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
    }
    .caption-container {
      font-size: 10pt;
      margin-left: 20px;
      margin-bottom: 30px
    }
    .caption-element {
      margin-top: 3px;
      margin-bottom:10px;
      text-align: center;
    }
script: |
    function resumeVideo(videoElement) {
      videoElement.load();
      videoElement.play();
    }
---

<!--morestart-->

Today I am open sourcing the first alpha release of an animation library I've been working on named [Kyrie][kyrie-github]. Think of it as a superset of the functionality provided by Android's `VectorDrawable` and `AnimatedVectorDrawable` classes: it can do everything they can do and more.

<!--more-->

### Motivation

Let me start by explaining why I wrote this library in the first place.

As I discussed in [my previous blog post on icon animations][introduction-to-icon-animations], `VectorDrawable`s are great because they provide density independence&mdash;they can be scaled arbitrarily on any device without loss of quality. `AnimatedVectorDrawable`s make them even more awesome, allowing us to animate specific properties of a `VectorDrawable` in a variety of ways.

However, these two classes also have several limitations:

* They can't be dynamically created at runtime (they must be inflated from a drawable resource).
* They can't be paused, resumed, or seeked.
* They only support a small subset of features that SVGs provide on the web.

[Kyrie][kyrie-github] is an attempt to try and solve some of these problems without having to wait on the Android framework to provide new features.

### Examples

Here are a few examples from [the sample app][kyrie-sample-app-github] that accompanies the library. The code below shows how we can use Kyrie to transform an existing `AnimatedVectorDrawable` resource into something that can be scrubbed with a `SeekBar`:

```java
KyrieDrawable drawable = KyrieDrawable.create(context, R.drawable.my_existing_avd);
seekBar.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener() {
  @Override
  public void onProgressChanged(SeekBar seekBar, int progress, boolean fromUser) {
    long totalDuration = drawable.getTotalDuration();
    drawable.setCurrentPlayTime((long) (progress / 100f * totalDuration));
  }
});
```

And the resulting animation:

<div class="figure-container">
    <div class="figure-parent">
        <video class="figure-video figure-element"
            poster="/assets/videos/posts/2018/03/05/poster-introducing-kyrie-heartbreak.jpg"
            preload="auto"
            onclick="resumeVideo(this)">
            <source src="/assets/videos/posts/2018/03/05/introducing-kyrie-heartbreak.mp4" type="video/mp4">
            <source src="/assets/videos/posts/2018/03/05/introducing-kyrie-heartbreak.webm" type="video/webm">
        </video>
    </div>
</div>
<div class="caption-container">
    <p class="caption-element">
    <strong>Figure 1</strong> - Creating a seekable animation from an existing <code>AnimatedVectorDrawable</code> resource (<a href="https://github.com/alexjlockwood/kyrie/blob/master/sample/src/main/java/com/example/kyrie/HeartbreakFragment.java">source code</a>).</p>
</div>

We can also create `KyrieDrawable`s dynamically at runtime using the builder pattern. `KyrieDrawable`s are similar to SVGs and `VectorDrawable`s in that they are tree-like structures built of `Node`s. As we build the tree, we can optionally assign `Animation`s to the properties of each `Node` to create a more elaborate animation. The code below shows how we can create a path morphing animation this way:

```java
// Fill colors.
int hippoFillColor = ContextCompat.getColor(context, R.color.hippo);
int elephantFillColor = ContextCompat.getColor(context, R.color.elephant);
int buffaloFillColor = ContextCompat.getColor(context, R.color.buffalo);

// SVG path data objects.
PathData hippoPathData = PathData.parse(getString(R.string.hippo));
PathData elephantPathData = PathData.parse(getString(R.string.elephant));
PathData buffaloPathData = PathData.parse(getString(R.string.buffalo));

KyrieDrawable drawable =
    KyrieDrawable.builder()
        .viewport(409, 280)
        .child(
            PathNode.builder()
                .strokeColor(Color.BLACK)
                .strokeWidth(1f)
                .fillColor(
                    Animation.ofArgb(hippoFillColor, elephantFillColor).duration(300),
                    Animation.ofArgb(buffaloFillColor).startDelay(600).duration(300),
                    Animation.ofArgb(hippoFillColor).startDelay(1200).duration(300))
                .pathData(
                    Animation.ofPathMorph(
                            Keyframe.of(0, hippoPathData),
                            Keyframe.of(0.2f, elephantPathData),
                            Keyframe.of(0.4f, elephantPathData),
                            Keyframe.of(0.6f, buffaloPathData),
                            Keyframe.of(0.8f, buffaloPathData),
                            Keyframe.of(1, hippoPathData))
                       .duration(1500)))
            .build();
```

And the resulting animation:

<div class="figure-container">
    <div class="figure-parent">
        <video class="figure-video figure-element"
            poster="/assets/videos/posts/2018/03/05/poster-introducing-kyrie-animals.jpg"
            preload="auto"
            onclick="resumeVideo(this)">
            <source src="/assets/videos/posts/2018/03/05/introducing-kyrie-animals.mp4" type="video/mp4">
            <source src="/assets/videos/posts/2018/03/05/introducing-kyrie-animals.webm" type="video/webm">
        </video>
    </div>
</div>
<div class="caption-container">
    <p class="caption-element">
    <strong>Figure 2</strong> - Creating a path morphing animation using keyframes (<a href="https://github.com/alexjlockwood/kyrie/blob/master/sample/src/main/java/com/example/kyrie/PathMorphFragment.java">source code</a>).</p>
</div>

Kyrie also supports animating along a path using the `Animation#ofPathMotion` and `Animation#transform` methods. Check out the [sample app source code][polygon-fragment-github] to see how we can recreate the polygon animations from Nick Butcher's [Playing with Paths][playing-with-paths-blog-post] blog post:

<div class="figure-container">
    <div class="figure-parent">
        <video class="figure-video figure-element"
            poster="/assets/videos/posts/2018/03/05/poster-introducing-kyrie-polygons.jpg"
            preload="auto"
            onclick="resumeVideo(this)">
            <source src="/assets/videos/posts/2018/03/05/introducing-kyrie-polygons.mp4" type="video/mp4">
            <source src="/assets/videos/posts/2018/03/05/introducing-kyrie-polygons.webm" type="video/webm">
        </video>
    </div>
</div>
<div class="caption-container">
    <p class="caption-element">
    <strong>Figure 3</strong> - Recreating the polygon animations from Nick Butcher's <a href="https://medium.com/google-developers/playing-with-paths-3fbc679a6f77">Playing with Paths</a> blog post (<a href="https://github.com/alexjlockwood/kyrie/blob/master/sample/src/main/java/com/example/kyrie/PolygonsFragment.java">source code</a>).</p>
</div>

### Conclusion

asdf

<!-- <sup><a href="#footnote1" id="ref1">1</a></sup>

<hr class="footnote-divider"/>
<sup id="footnote1">1</sup> Before I go further, I want to emphasize that I wrote 100% of the code for this library in my free time and most of it before <a href="https://twitter.com/alexjlockwood/status/960565687486828545">I began working at Lyft</a>. That being said, since I joined 4 weeks ago I've stumbled across several designs/animations where I think a library like this would be really useful, which is why I am open sourcing it today for initial feedback. <a href="#ref1" title="Jump to footnote 1.">&#8617;</a> -->

[kyrie-github]: https://github.com/alexjlockwood/kyrie
[playing-with-paths-blog-post]: https://medium.com/google-developers/playing-with-paths-3fbc679a6f77
[introduction-to-icon-animations]: /2016/11/introduction-to-icon-animation-techniques.html
[kyrie-sample-app-github]: https://github.com/alexjlockwood/kyrie/tree/master/sample
[polygon-fragment-github]: https://github.com/alexjlockwood/kyrie/blob/master/sample/src/main/java/com/example/kyrie/PolygonsFragment.java
