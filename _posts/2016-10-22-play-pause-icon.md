---
layout: post
title: 'Play Pause Icon'
date: 2016-10-22
permalink: /2016/10/play-pause-icon.html
related: ['/2013/08/fragment-transaction-commit-state-loss.html',
    '/2013/04/retaining-objects-across-config-changes.html',
    '/2016/08/contextcompat-getcolor-getdrawable.html']
---

<!--morestart-->

asdf

<!--more-->

The coordinates using a 18x18 artboard:

<img src="/assets/images/posts/2016/10/22/play.png" style="border-width: 1px; border-style: solid; display: inline; max-width:240px;"/>
<img src="/assets/images/posts/2016/10/22/pause.png" style="border-width: 1px; border-style: solid; display: inline; max-width:240px;"/>
<img src="/assets/images/posts/2016/10/22/stop.png" style="border-width: 1px; border-style: solid; display: inline; max-width:240px;"/>

Create a `res/values/paths.xml` file to store the paths to draw:

```xml
<resources>

  <string name="path_play_left">M9,5 L9,5 L9,13 L4,13 Z</string>
  <string name="path_play_right">M9,5 L9,5 L14,13 L9,13 Z</string>
  <string name="path_pause_left">M6,5 L8,5 L8,13 L6,13 Z</string>
  <string name="path_pause_right">M10,5 L12,5 L12,13 L10,13 Z</string>
  <string name="path_stop_left">M5,5 L9,5 L9,13 L5,13 Z</string>
  <string name="path_stop_right">M9,5 L13,5 L13,13 L9,13 Z</string>

</resources>
```

Create the `VectorDrawable`s in three separate XML files:

```xml
<!-- res/drawable/ic_{play,pause,stop}.xml -->
<vector
  xmlns:android="http://schemas.android.com/apk/res/android"
  android:width="18dp"
  android:height="18dp"
  android:viewportHeight="18"
  android:viewportWidth="18"
  android:tint="?attr/colorControlNormal">

  <group
    android:name="iconGroup"
    android:pivotX="9"
    android:pivotY="9"
    android:rotation="{play: 90, pause: 0, stop: 0}"
    android:translateX="{play: 0.75, pause: 0, stop: 0}">

    <path
      android:name="leftPath"
      android:fillColor="@android:color/white"
      android:pathData="@string/path_{play,pause,stop}_left"/>

    <path
      android:name="rightPath"
      android:fillColor="@android:color/white"
      android:pathData="@string/path_{play,pause,stop}_right"/>

  </group>
</vector>
```

Now we need to create the `AnimatedVectorDrawable`s that describe how to animate between the three separate `VectorDrawable`s. We need to create six `AnimatedVectorDrawable`s total. Here is the play-to-pause `AnimatedVectorDrawable` as an example. It initially starts as a play icon and when it is started it morphs into the pause icon:

```xml
<!-- res/drawable/avd_play_to_pause.xml-->
<animated-vector
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:aapt="http://schemas.android.com/aapt"
    android:drawable="@drawable/ic_play">

    <target android:name="iconGroup">
        <aapt:attr name="android:animation">
            <set>
                <objectAnimator
                    android:duration="@android:integer/config_shortAnimTime"
                    android:interpolator="@android:interpolator/decelerate_quad"
                    android:propertyName="rotation"
                    android:valueFrom="90"
                    android:valueTo="180"/>
                <objectAnimator
                    android:duration="@android:integer/config_shortAnimTime"
                    android:interpolator="@android:interpolator/decelerate_quad"
                    android:propertyName="translateX"
                    android:valueFrom="0.75"
                    android:valueTo="0"/>
            </set>
        </aapt:attr>
    </target>


    <target android:name="leftPath">
        <aapt:attr name="android:animation">
            <objectAnimator
                android:duration="@android:integer/config_shortAnimTime"
                android:interpolator="@android:interpolator/decelerate_quad"
                android:propertyName="pathData"
                android:valueFrom="@string/path_play_left"
                android:valueTo="@string/path_pause_left"
                android:valueType="pathType"/>
        </aapt:attr>
    </target>

    <target android:name="rightPath">
        <aapt:attr name="android:animation">
            <objectAnimator
                android:duration="@android:integer/config_shortAnimTime"
                android:interpolator="@android:interpolator/decelerate_quad"
                android:propertyName="pathData"
                android:valueFrom="@string/path_play_right"
                android:valueTo="@string/path_pause_right"
                android:valueType="pathType"/>
        </aapt:attr>
    </target>

</animated-vector>
```

The animated icon w/o rotation or translation:

<svg xmlns:xlink="http://www.w3.org/1999/xlink" width="50%" height="50%" viewBox="0 0 18 18">

  <path id="icon_without_rotation" fill="#000" fill-opacity=".54"/>

  <animate
    xlink:href="#icon_without_rotation"
    attributeName="d"
    dur="3600ms"
    repeatCount="indefinite"
    fill="freeze"
    keyTimes="0; .08333; .3333; .4163; .6666; .7493; 1"
    calcMode="spline"
    keySplines="0 0 1 1; .4 0 .2 1; 0 0 1 1; .4 0 .2 1; 0 0 1 1; .4 0 .2 1"
    values="
      M9,5 L9,5 L9,13 L4,13 L9,5 M9,5 L9,5 L14,13 L9,13 L9,5;
      M9,5 L9,5 L9,13 L4,13 L9,5 M9,5 L9,5 L14,13 L9,13 L9,5;
      M6,5 L8,5 L8,13 L6,13 L6,5 M10,5 L12,5 L12,13 L10,13 L10,5;
      M6,5 L8,5 L8,13 L6,13 L6,5 M10,5 L12,5 L12,13 L10,13 L10,5;
      M5,5 L9,5 L9,13 L5,13 L5,5 M9,5 L13,5 L13,13 L9,13 L9,5;
      M5,5 L9,5 L9,13 L5,13 L5,5 M9,5 L13,5 L13,13 L9,13 L9,5;
      M9,5 L9,5 L9,13 L4,13 L9,5 M9,5 L9,5 L14,13 L9,13 L9,5"/>

</svg>

The final result:

<svg xmlns:xlink="http://www.w3.org/1999/xlink" width="50%" height="50%" viewBox="0 0 18 18">

  <path id="icon_with_rotation" fill="#000" fill-opacity=".54"/>

  <animate
    xlink:href="#icon_with_rotation"
    attributeName="d"
    dur="3600ms"
    repeatCount="indefinite"
    fill="freeze"
    keyTimes="0; .08333; .3333; .4163; .6666; .7493; .7493; 1"
    calcMode="spline"
    keySplines="0 0 1 1; .4 0 .2 1; 0 0 1 1; .4 0 .2 1; 0 0 1 1; 0 0 1 1; .4 0 .2 1"
    values="
      M9,5 L9,5 L9,13 L4,13 L9,5 M9,5 L9,5 L14,13 L9,13 L9,5;
      M9,5 L9,5 L9,13 L4,13 L9,5 M9,5 L9,5 L14,13 L9,13 L9,5;
      M6,5 L8,5 L8,13 L6,13 L6,5 M10,5 L12,5 L12,13 L10,13 L10,5;
      M6,5 L8,5 L8,13 L6,13 L6,5 M10,5 L12,5 L12,13 L10,13 L10,5;
      M5,5 L9,5 L9,13 L5,13 L5,5 M9,5 L13,5 L13,13 L9,13 L9,5;
      M5,5 L9,5 L9,13 L5,13 L5,5 M9,5 L13,5 L13,13 L9,13 L9,5;
      M5,5 L9,5 L9,13 L5,13 L5,5 M9,5 L13,5 L13,13 L9,13 L9,5;
      M9,5 L9,5 L9,13 L4,13 L9,5 M9,5 L9,5 L14,13 L9,13 L9,5"/>

      <animateTransform
        xlink:href="#icon_with_rotation"
        attributeName="transform"
        dur="3600ms"
        attributeType="XML"
        type="translate"
        repeatCount="indefinite"
        fill="freeze"
        keyTimes="0; .08333; .3333; .4163; .6666; .7493; .7493; 1"
        calcMode="spline"
        keySplines="0 0 1 1; .4 0 .2 1; 0 0 1 1; .4 0 .2 1; 0 0 1 1; 0 1 0 1; .4 0 .2 1"
        values="1; 1; 0; 0; 0; 0; 0; 1;"
        additive="sum"/>

      <animateTransform
        xlink:href="#icon_with_rotation"
        attributeName="transform"
        attributeType="XML"
        type="rotate"
        dur="3600ms"
        repeatCount="indefinite"
        fill="freeze"
        keyTimes="0; .08333; .3333; .4163; .6666; .7493; .7493; 1"
        calcMode="spline"
        keySplines="0 0 1 1; .4 0 .2 1; 0 0 1 1; .4 0 .2 1; 0 1 0 1; 0 1 0 1; .4 0 .2 1"
        values="90 9 9; 90 9 9; 180 9 9; 180 9 9; 270 9 9; 270 9 9; 0 9 9; 90 9 9"
        additive="sum"/>

</svg>

The `CheckableImageButton`:

```java
/** An extension of {@link ImageButton} that implements the {@link Checkable} interface. */
public class CheckableImageButton extends ImageButton implements Checkable {
  private static final int[] CHECKED_STATE_SET = {android.R.attr.state_checked};

  private boolean isChecked;

  public CheckableImageButton(Context context, AttributeSet attrs) {
    super(context, attrs);
  }

  @Override
  public boolean isChecked() {
    return isChecked;
  }

  @Override
  public void setChecked(boolean isChecked) {
    if (this.isChecked != isChecked) {
      this.isChecked = isChecked;
      refreshDrawableState();
    }
  }

  @Override
  public void toggle() {
    setChecked(!isChecked);
  }

  @Override
  public boolean performClick() {
    // Code copied from CompoundButton#performClick().
    toggle();

    final boolean handled = super.performClick();
    if (!handled) {
      // View only makes a sound effect if the onClickListener was
      // called, so we'll need to make one here instead.
      playSoundEffect(SoundEffectConstants.CLICK);
    }

    return handled;
  }

  @Override
  public int[] onCreateDrawableState(int extraSpace) {
    final int[] drawableState = super.onCreateDrawableState(extraSpace + 1);
    if (isChecked()) {
      mergeDrawableStates(drawableState, CHECKED_STATE_SET);
    }
    return drawableState;
  }
}
```

And the `AnimatedStateListDrawable`:

```xml
<!-- res/drawable/asl_play_pause.xml-->
<animated-selector
    xmlns:android="http://schemas.android.com/apk/res/android">

    <item
        android:id="@+id/pause"
        android:drawable="@drawable/ic_pause"
        android:state_checked="true"/>

    <item
        android:id="@+id/play"
        android:drawable="@drawable/ic_play"/>

    <transition
        android:drawable="@drawable/avd_pause_to_play"
        android:fromId="@id/pause"
        android:toId="@id/play"/>

    <transition
        android:drawable="@drawable/avd_play_to_pause"
        android:fromId="@id/play"
        android:toId="@id/pause"/>

</animated-selector>
```

On API 21+, you can set the drawable in XML by referencing `@drawable/asl_play_pause`.

On API 19 and below, you'll need to manually set and start the animated vector drawables
in your activity yourself:

```java
final CheckableImageButton icon = (CheckableImageButton) findViewById(R.id.icon);
final AnimatedVectorDrawableCompat pauseToPlay =
    AnimatedVectorDrawableCompat.create(this, R.drawable.avd_pause_to_play);
final AnimatedVectorDrawableCompat playToPause =
    AnimatedVectorDrawableCompat.create(this, R.drawable.avd_play_to_pause);
icon.setImageDrawable(playToPause);
icon.setOnClickListener(view -> {
    final AnimatedVectorDrawableCompat avd = icon.isChecked() ? pauseToPlay : playToPause;
    icon.setImageDrawable(avd);
    avd.start();
});
```
