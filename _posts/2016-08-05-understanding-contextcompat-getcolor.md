---
layout: post
title: 'Understanding ContextCompat#getColor()'
date: 2016-08-05
permalink: /2016/08/contextcompat-getcolor-getdrawable.html
related: ['/2012/08/implementing-loaders.html',
    '/2013/08/fragment-transaction-commit-state-loss.html',
    '/2012/06/app-force-close-honeycomb-ics.html']
---

<!--morestart-->

You've probably noticed that when you write something like:

```java
context.getResources().getColor(R.color.some_color_resource_id);
```

Android Studio will give you a lint message warning you that the
`Resources#getColor(int)` method was deprecated in Marshmallow in favor of the
new, `Theme`-aware `Resources#getColor(int, Theme)` method. You also
probably know by now that the easy alternative to avoiding this lint warning
these days is to call:

```java
ContextCompat.getColor(context, R.color.some_color_resource_id);
```

which under-the-hood is essentially just a shorthand way of writing:

```java
if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
  return context.getResources().getColor(id, context.getTheme());
} else {
  return context.getResources().getColor(id);
}
```

Easy enough. But what is actually going on here? Why were these methods
deprecated in the first place and what do the new `Theme`-aware methods have to
offer that didn't exist before?

<!--more-->

### The problem with `Resources#getColor(int)` & `Resources#getColorStateList(int)`

First, let's be clear on what these old, deprecated methods actually do:

*   [`Resources#getColor(int)`](http://developer.android.com/reference/android/content/res/Resources.html#getColorStateList\(int\))
    returns the color associated with the passed in color resource ID. If the resource
    ID points to a `ColorStateList`, the method will return the `ColorStateList`'s
    [default color](http://developer.android.com/reference/android/content/res/ColorStateList.html#getDefaultColor\(\)).

*   [`Resources#getColorStateList(int)`](http://developer.android.com/reference/android/content/res/Resources.html#getColor\(int\))
    returns the `ColorStateList` associated with the passed in resource ID.

#### "When will these two methods break my code?"

To understand why these methods were deprecated in the first place, consider the 
`ColorStateList` declared in XML below:

```xml
<!-- res/colors/button_text_csl.xml -->
<selector xmlns:android="http://schemas.android.com/apk/res/android">
    <item android:color="?attr/colorAccent" android:state_enabled="false"/>
    <item android:color="?attr/colorPrimary"/>
</selector>
```

When this `ColorStateList` is applied to a `TextView`, its
disabled and enabled text colors should take on the colors pointed to by the
`R.attr.colorAccent` and `R.attr.colorPrimary` theme attributes respectively.

Now let's say you want to obtain an instance of this `ColorStateList` programatically:

```java
ColorStateList csl = resources.getColorStateList(R.color.button_text_csl);
```

Perhaps surprisingly, **the result of the above call is undefined!**
You'll see a stack trace in your logcat output similar to the one below:

```
W/Resources: ColorStateList color/button_text_csl has unresolved theme attributes!
             Consider using Resources.getColorStateList(int, Theme)
             or Context.getColorStateList(int)
        at android.content.res.Resources.getColorStateList(Resources.java:1011)
        ...
```

#### "What went wrong?"

The problem is that `Resources` objects are not intrinsically linked to a specific
`Theme` in your app, and as a result, they will be unable to resolve the values pointed to by
theme attributes such as `R.attr.colorAccent` and `R.attr.colorPrimary` on their own. In fact,
specifying theme attributes in any `ColorStateList` XML files **was not possible until API 23*,
which introduced two new methods for extracting `ColorStateList`s from XML:

*   [`Resources#getColor(int, Theme)`](https://developer.android.com/reference/android/content/res/Resources.html#getColor\(int, android.content.res.Resources.Theme\))
    returns the color associated with the passed in resource ID. If the resource
    ID points to a `ColorStateList`, the method will return the `ColorStateList`'s
    [default color](http://developer.android.com/reference/android/content/res/ColorStateList.html#getDefaultColor\(\)).
    Any theme attributes specified in the `ColorStateList` will be
    resolved using the passed in `Theme` argument.

*   [`Resources#getColorStateList(int, Theme)`](https://developer.android.com/reference/android/content/res/Resources.html#getColorStateList\(int, android.content.res.Resources.Theme\))
    returns the `ColorStateList` associated with the passed in resource ID. Any
    theme attributes specified in the `ColorStateList` will be resolved using
    the passed in `Theme` argument.

Additional convenience methods were also added to `Context` and to the support
libraries `ContextCompat` classes as well, each operating on the `Theme` associated
with the calling `Context` instead:

*   [`Context#getColor(int)`](http://developer.android.com/reference/android/content/Context.html#getColor\(int\))

*   [`Context#getColorStateList(int)`](http://developer.android.com/reference/android/content/Context.html#getColorStateList\(int\))

*   [`ContextCompat#getColor(Context, int)`](https://developer.android.com/reference/android/support/v4/content/ContextCompat.html#getColor\(android.content.Context, int\))

*   [`ContextCompat#getColorStateList(Context, int)`](https://developer.android.com/reference/android/support/v4/content/ContextCompat.html#getColor\(android.content.Context, int\))

#### "How can I workaround these problems?"

Apps that support a `minSdkVersion` less than API 23 should prefer to use the
static `ContextCompat` helper methods in the support library, as Android lint
suggests. However, note that no matter which methods you use, attempting to
resolve theme attributes in a `ColorStateList` XML file **WILL NEVER WORK on
pre-Marshmallow devices**!

But that stinks! What if you really want to use a theme attribute in your `ColorStateList`?
Well, just because you can't do it in XML, doesn't mean you
can't do it in Java. :) Try resolving the theme attributes programatically, and
then use them to construct the `ColorStateList` using a few extra lines of code
instead. Check out the sample code below for some examples!

### The problem with `Resources#getDrawable(int)`

You guessed it! The recently deprecated `Resources#getDrawable(int)` method shares
pretty much the exact same problem as the `Resources#getColor(int)` and
`Resources#getColorStateList(int)` methods discussed above.
As a result, theme attributes in
drawable XML files will not resolve properly prior to API 21, so if you
your app supports pre-Lollipop devices, either avoid theme attributes entirely
or resolve them in your Java code and construct the `Drawable`
programatically instead.

#### "I don't believe you! Are there really no exceptions?"

Of course, aren't there always? :)

It turns out the `VectorDrawableCompat` support library was able to workaround
these issues and is actually smart enough to resolve the theme
attributes it detects in XML *across all platform versions*. For example,
if you want to color your `VectorDrawableCompat` the standard shade of grey,
you can reliably tint the drawable with `?attr/colorControlNormal`
while still maintaining backwards compatibility with older platform versions:

```xml
<vector 
    xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp"
    android:height="24dp"
    android:viewportWidth="24.0"
    android:viewportHeight="24.0"
    ndroid:tint="?attr/colorControlNormal">

    <path
        android:pathData="..."
        android:fillColor="@android:color/white"/>
</vector>
```

(If you're curious how this is implemented under-the-hood, the short answer is that
the `VectorDrawableCompat` support library does their own custom XML parsing and uses the
[`Theme#obtainStyledAttributes(AttributeSet, int[], int, int)`](https://developer.android.com/reference/android/content/res/Resources.Theme.html#obtainStyledAttributes\(android.util.AttributeSet, int[], int, int\))
method to resolve the theme attributes it encounters. Pretty cool!)

### Pop quiz!

Consider the `ColorStateList` declared in `res/color/button_text_csl.xml`:

```xml
<selector xmlns:android="http://schemas.android.com/apk/res/android">
    <item android:color="?attr/colorAccent" android:state_enabled="false"/>
    <item android:color="?attr/colorPrimary"/>
</selector>
```

And assume you're writing an app that declares the following themes:

```xml
<style name="AppTheme" parent="Theme.AppCompat.Light.DarkActionBar">
    <item name="colorPrimary">@color/quantum_vanillared500</item>
    <item name="colorPrimaryDark">@color/quantum_vanillared700</item>
    <item name="colorAccent">@color/quantum_googgreen500</item>
</style>

<style name="CustomButtonTheme" parent="ThemeOverlay.AppCompat.Light">
    <item name="colorPrimary">@color/quantum_brown500</item>
    <item name="colorAccent">@color/quantum_yellow900</item>
</style>
```

And finally, assume that you have the following helper methods to resolve theme
attributes and construct `ColorStateList`s programatically:

```java
@ColorInt
private static int getThemeAttrColor(Context context, @AttrRes int colorAttr) {
  TypedArray array = context.obtainStyledAttributes(null, new int[]{colorAttr});
  try {
    return array.getColor(0, 0);
  } finally {
    array.recycle();
  }
}

private static ColorStateList createColorStateList(Context context) {
  return new ColorStateList(
      new int[][]{
          new int[]{-android.R.attr.state_enabled}, // Disabled state.
          StateSet.WILD_CARD,                       // Enabled state.
      },
      new int[]{
          getThemeAttrColor(context, R.attr.colorAccent),  // Disabled state.
          getThemeAttrColor(context, R.attr.colorPrimary), // Enabled state.
      });
}
```

Try to see if you can predict the enabled and disabled appearance of a button on
both an API 19 and API 23 device in each of the following scenarios (for
scenarios #5 and #8, assume that the button has been given a custom theme in XML
using `android:theme="@style/CustomButtonTheme"`):

```java
Resources res = ctx.getResources();

// (1)
int deprecatedTextColor = res.getColor(R.color.button_text_csl);
button1.setTextColor(deprecatedTextColor);

// (2)
ColorStateList deprecatedTextCsl = res.getColorStateList(R.color.button_text_csl);
button2.setTextColor(deprecatedTextCsl);

// (3)
int textColorXml = ContextCompat.getColor(ctx, R.color.button_text_csl);
button3.setTextColor(textColorXml);

// (4)
ColorStateList textCslXml = ContextCompat.getColorStateList(ctx, R.color.button_text_csl);
button4.setTextColor(textCslXml);

// (5)
Context themedCtx = button5.getContext();
ColorStateList textCslXmlWithCustomTheme =
    ContextCompat.getColorStateList(themedCtx, R.color.button_text_csl);
button5.setTextColor(textCslXmlWithCustomTheme);

// (6)
int textColorJava = getThemeAttrColor(ctx, R.attr.colorPrimary);
button6.setTextColor(textColorJava);

// (7)
ColorStateList textCslJava = createColorStateList(ctx);
button7.setTextColor(textCslJava);

// (8)
Context themedCtx = button8.getContext();
ColorStateList textCslJavaWithCustomTheme = createColorStateList(themedCtx);
button8.setTextColor(textCslJavaWithCustomTheme);
```

#### Solutions

Here is a screenshot of what the buttons look like on API 19 vs. API 23 devices:

<div>
  <div style="float:left; margin-right:16px;">
    <a href="/assets/images/posts/2016/08/05/rant7-contextcompat-examples-19.png">
      <img alt="Example code solutions, API 19" src="/assets/images/posts/2016/08/05/rant7-contextcompat-examples-19-resized.png"/>
    </a>
  </div>
  <div style="float:left;">
    <a href="/assets/images/posts/2016/08/05/rant7-contextcompat-examples-23.png">
      <img alt="Example code solutions, API 23" src="/assets/images/posts/2016/08/05/rant7-contextcompat-examples-23-resized.png"/>
    </a>
  </div>
</div>

Note that there isn't anything special about the weird pink color in the two
screenshots. That's just the "undefined behavior" that results when you try to
resolve a theme attribute without a corresponding `Theme`. :)

As always, thanks for reading! Feel free to check out 
[source code for these examples on GitHub](https://github.com/alexjlockwood/adp-contextcompat-getcolor)
as well!
