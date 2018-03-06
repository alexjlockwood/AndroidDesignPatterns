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

Today I am open sourcing the first alpha release of an animation library I've been writing named [Kyrie][kyrie-github]. Think of it as a superset of Android's `VectorDrawable` and `AnimatedVectorDrawable` classes: it can do everything they can do and more.

<!--more-->

### Motivation

Let me start by explaining why I began writing this library in the first place.

If you read [my blog post on icon animations][introduction-to-icon-animations], you know that `VectorDrawable`s are great because they provide density independence&mdash;they can be scaled arbitrarily on any device without loss of quality. `AnimatedVectorDrawable`s make them even more awesome, allowing us to animate specific properties of a `VectorDrawable` in a variety of ways.

However, these two classes also have several limitations:

* They can't be dynamically created at runtime (they must be inflated from a drawable resource).
* They can't be paused, resumed, or seeked.
* They only support a small subset of features that SVGs provide on the web.

I started writing [Kyrie][kyrie-github] in an attempt to address these problems.

### Examples

Let's walk through a few examples from [the sample app][kyrie-sample-app-github] that accompanies the library.

The first snippet of code below shows how we can use Kyrie to transform an existing `AnimatedVectorDrawable` resource into a [`KyrieDrawable`][kyrie-kyriedrawable] that can be scrubbed with a `SeekBar`:

```java
KyrieDrawable drawable = KyrieDrawable.create(context, R.drawable.avd_heartbreak);
seekBar.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener() {
  @Override
  public void onProgressChanged(SeekBar seekBar, int progress, boolean fromUser) {
    long totalDuration = drawable.getTotalDuration();
    drawable.setCurrentPlayTime((long) (progress / 100f * totalDuration));
  }

  /* ... */
});
```

**Figure 1** shows the resulting animation. We can pause/resume the animation by calling [`pause()`][kyrie-kyriedrawable#pause] and [`resume()`][kyrie-kyriedrawable#resume] respectively, and can also listen to animation events using a [`KyrieDrawable.Listener`][kyrie-kyriedrawable-listener]. In the future, I plan to add a couple more features as well, such as the ability to customize the playback speed and/or play the animation in reverse.

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

We can also create `KyrieDrawable`s dynamically at runtime using the builder pattern. `KyrieDrawable`s are similar to SVGs and `VectorDrawable`s in that they are tree-like structures built of [`Node`][kyrie-node]s. As we build the tree, we can optionally assign [`Animation`][kyrie-animation]s to the properties of each `Node` to create a more elaborate animation. The code below shows how we can create a path morphing animation this way:

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

**Figure 2** shows the resulting animation. Note that `Animation`s can also be constructed using [`Keyframe`][kyrie-keyframe]s, just as we would do so with a [`PropertyValuesHolder`][propertyvaluesholder#ofkeyframe].

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

Kyrie also supports animating along a path using the [`Animation#ofPathMotion`][kyrie-animation#ofpathmotion] method. Say, for example, we wanted to recreate the polygon animations from Nick Butcher's [Playing with Paths][playing-with-paths-blog-post] blog post (the [full source code][polygon-fragment-github] is available in the sample app):

```java
KyrieDrawable.Builder builder = KyrieDrawable.builder().viewport(1080, 1080);

// Draw each polygon using a PathNode with a custom stroke color.
for (Polygon polygon : polygons) {
  builder.child(
      PathNode.builder()
          .pathData(PathData.parse(polygon.pathData))
          .strokeWidth(4f)
          .strokeColor(polygon.color));
}

// Animate a black dot along each polygon's perimeter.
for (Polygon polygon : polygons) {
  PathData pathData =
      PathData.parse(TextUtils.join(" ", Collections.nCopies(polygon.laps, polygon.pathData)));
  Animation<PointF, PointF> pathMotion =
      Animation.ofPathMotion(PathData.toPath(pathData)).duration(7500);
  builder.child(
      CircleNode.builder()
          .fillColor(Color.BLACK)
          .radius(8)
          .centerX(pathMotion.transform(p -> p.x))
          .centerY(pathMotion.transform(p -> p.y)));
}
```

The left half of **Figure 3** shows the resulting animation. Note that `Animation#ofPathMotion` returns an `Animation` that computes `PointF` objects, where each point represents a location along the specified path as the animation progresses. In order to animate each black circle's location along this path, we use the [`Animation#transform`][kyrie-animation#transform] method to transform the points into streams of x/y coordinates that can be consumed by the `CircleNode`'s `centerX` and `centerY` properties.

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

### Future work

I have a lot of ideas on how to further improve this library, but right now I am interested in what you think. Make sure you file any [feature requests][kyrie-github-issues] you might have on GitHub! And like I said, the library is still in alpha, so make sure you report bugs too. :)

### Links

* [GitHub][kyrie-github]
* [Documentation][kyrie-documentation]

[kyrie-github]: https://github.com/alexjlockwood/kyrie
[kyrie-github-issues]: https://github.com/alexjlockwood/kyrie/issues
[kyrie-documentation]: https://alexjlockwood.github.io/kyrie
[playing-with-paths-blog-post]: https://medium.com/google-developers/playing-with-paths-3fbc679a6f77
[introduction-to-icon-animations]: /2016/11/introduction-to-icon-animation-techniques.html
[kyrie-sample-app-github]: https://github.com/alexjlockwood/kyrie/tree/master/sample/src/main/java/com/example/kyrie
[polygon-fragment-github]: https://github.com/alexjlockwood/kyrie/blob/master/sample/src/main/java/com/example/kyrie/PolygonsFragment.java
[kyrie-kyriedrawable]: https://alexjlockwood.github.io/kyrie/com/github/alexjlockwood/kyrie/KyrieDrawable.html
[kyrie-kyriedrawable#pause]: https://alexjlockwood.github.io/kyrie/com/github/alexjlockwood/kyrie/KyrieDrawable.html#pause--
[kyrie-kyriedrawable#resume]: https://alexjlockwood.github.io/kyrie/com/github/alexjlockwood/kyrie/KyrieDrawable.html#resume--
[kyrie-kyriedrawable-listener]: https://alexjlockwood.github.io/kyrie/com/github/alexjlockwood/kyrie/KyrieDrawable.Listener.html
[kyrie-node]: https://alexjlockwood.github.io/kyrie/com/github/alexjlockwood/kyrie/Node.html
[kyrie-animation]: https://alexjlockwood.github.io/kyrie/com/github/alexjlockwood/kyrie/Animation.html
[kyrie-animation#ofpathmotion]: https://alexjlockwood.github.io/kyrie/com/github/alexjlockwood/kyrie/Animation.html#ofPathMotion-android.graphics.Path-
[kyrie-animation#transform]: https://alexjlockwood.github.io/kyrie/com/github/alexjlockwood/kyrie/Animation.html#transform-com.github.alexjlockwood.kyrie.Animation.ValueTransformer-
[kyrie-keyframe]: https://alexjlockwood.github.io/kyrie/com/github/alexjlockwood/kyrie/Keyframe.html
[propertyvaluesholder#ofkeyframe]: https://developer.android.com/reference/android/animation/PropertyValuesHolder.html#ofKeyframe(java.lang.String,%20android.animation.Keyframe...)
