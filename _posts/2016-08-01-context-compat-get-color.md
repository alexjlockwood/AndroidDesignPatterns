---
layout: post
title: 'Understanding ContextCompat, getDrawable(), & getColor()'
date: 2016-08-01
permalink: /2016/08/context-compat-get-color.html
related: ['/2012/08/implementing-loaders.html',
    '/2013/08/fragment-transaction-commit-state-loss.html',
    '/2012/06/app-force-close-honeycomb-ics.html']
---

<!--morestart-->

You've probably noticed at some point that when you write something like:

```java
resources.getColor(R.color.some_random_color_resource);
```

Android Studio will give you a lint message warning that the
`Resources#getColor(int)` method has been deprecated as of API 23. You also
probably know by now that the correct alternative to this method these days is
to call:

```java
ContextCompat.getColor(context, R.color.some_random_color_resource);
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

### `Resources#getColor(int)` & `Resources#getColorStateList(int)`

First, let's be clear on what these two methods actually do:

*   [`Resources#getColorStateList(int)`](http://developer.android.com/reference/android/content/res/Resources.html#getColor\(int\))
    returns the `ColorStateList` associated with the passed in resource ID.

*   [`Resources#getColor(int)`](http://developer.android.com/reference/android/content/res/Resources.html#getColorStateList\(int\))
    returns the color associated with the passed in resource ID. If the resource
    ID is a `ColorStateList`, the `ColorStateList`'s [default color]
    (http://developer.android.com/reference/android/content/res/ColorStateList.html#getDefaultColor\(\))
    is returned.

#### When & why will these methods break my code?

To understand why these two methods were deprecated, consider the
`ColorStateList` declared in `res/colors/text_color_state_list.xml` below:

```xml
<selector xmlns:android="http://schemas.android.com/apk/res/android">
    <item android:color="?attr/colorAccent" android:state_enabled="false"/>
    <item android:color="?attr/colorPrimary"/>
</selector>
```

When this `ColorStateList` is applied to a disabled and enabled button, its
disabled and enabled text colors should take on the colors pointed to by the
`R.attr.colorAccent` and `R.attr.colorPrimary` theme attributes respectively.

Now let's say you try to obtain an instance of this `ColorStateList`
programatically using the following code:

```java
ColorStateList textColorStateList =
    resources.getColorStateList(R.color.text_color_state_list);
```

The result of the above call will be undefined, and you'll get a stack trace
looking something like the one below in your logcat output:

```
W/Resources: ColorStateList color/text_color_state_list has unresolved theme attributes!
             Consider using Resources.getColorStateList(int, Theme)
             or Context.getColorStateList(int).
    java.lang.RuntimeException
        at android.content.res.Resources.getColorStateList(Resources.java:1011)
```

The problem is that the `Resources` object has no way of knowing which theme
it needs to use in order to resolve the values pointed to by the
`R.attr.colorAccent` and `R.attr.colorPrimary` theme attributes. In fact,
specifying theme attributes in any `ColorStateList` XML files **was not possible
until API 23**, which introduced two new methods for extracting
`ColorStateList`s from XML:

*   [`Resources#getColor(int, Theme)`](https://developer.android.com/reference/android/content/res/Resources.html#getColor\(int, android.content.res.Resources.Theme\))
    returns the color associated with the passed in resource ID. If the resource
    ID is a `ColorStateList`, the `ColorStateList`'s [default color]
    (http://developer.android.com/reference/android/content/res/ColorStateList.html#getDefaultColor\(\))
    is returned. Any theme attributes specified in the `ColorStateList` will be
    resolved using the passed in `Theme` argument.

*   [`Resources#getColorStateList(int, Theme)`](https://developer.android.com/reference/android/content/res/Resources.html#getColorStateList\(int, android.content.res.Resources.Theme\))
    returns the `ColorStateList` associated with the passed in resource ID. Any
    theme attributes specified in the `ColorStateList` will be resolved using
    the passed in `Theme` argument.

Additional convenience methods were also added to `Context` and to the support
libraries `ContextCompat` classes as well:

*   [`Context#getColor(int)`](http://developer.android.com/reference/android/content/Context.html#getColor\(int\))

*   [`Context#getColorStateList(int)`](http://developer.android.com/reference/android/content/Context.html#getColorStateList\(int\))

*   [`ContextCompat#getColor(Context, int)`](https://developer.android.com/reference/android/support/v4/content/ContextCompat.html#getColor\(android.content.Context, int\))

*   [`ContextCompat#getColorStateList(Context, int)`](https://developer.android.com/reference/android/support/v4/content/ContextCompat.html#getColor\(android.content.Context, int\))

#### So... which methods should I use instead?

Apps that support a `minSdkVersion` less than API 23 should prefer to use the
static `ContextCompat` helper methods in the support library, as Android lint
suggests. However, note that no matter which methods you use, attempting to
resolve theme attributes in a `ColorStateList` XML file **WILL NEVER WORK on
pre-Marshmallow devices**!

But that stinks! What if you really need to use a theme attribute in your
`ColorStateList`? Well, just because you can't do it in XML, doesn't mean you
can't do it in Java. :) Try resolving the theme attributes programatically, and
then use them to construct the `ColorStateList` using a few extra lines of code
instead. Check out the code in the section below for some examples!

#### Does this apply to `Resources#getDrawable(int)` as well?

Yup! `Resources#getDrawable(int)` has pretty much the exact same problem as
`Resources#getColor(int)`, which is why you've probably seen
`ContextCompat#getDrawable()` calls littered throughout the codebase as well.
Before API 21, theme attributes specified in drawable XML files would not
resolve properly, so either avoid them entirely or resolve the theme attributes
in Java code and construct the `Drawable` programatically instead.

##### Are there any exceptions?

Of course, aren't there always? :D

It turns out the `VectorDrawableCompat` support library was able to workaround
this undesirable behavior and is actually smart enough to resolve the theme
attributes it detects in XML *across all platform versions*. See my email thread
with Tenghui Zhu (who/ztenghui, aka the main guy behind `VectorDrawable`s) for
more info about the exact implementation details here:
https://paste.googleplex.com/5946743283777536.

It's also worth noting that go/icons will soon be taking advantage of this
hidden feature as well: all vector drawables will soon be tinted using the
`?attr/colorControlNormal` theme attribute, allowing clients to color the icons
however they want with custom themes. See the feature request at b/30282090 and
the pending CL at cl/129262001.

### Examples

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
attributes and to construct `ColorStateList`s programatically:

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

#### Pop quiz!

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

Here is a screenshot of what the buttons look like on an API 19 device (enabled
buttons on the left, disabled buttons on the right):

[![API 19]
(/java/com/google/android/apps/classroom/g3doc/resources/rants-by-alex/rants/rant7-contextcompat-examples-19-resized.png)]
(/java/com/google/android/apps/classroom/g3doc/resources/rants-by-alex/rants/rant7-contextcompat-examples-19.png)

And on an API 23 device:

[![API 23]
(/java/com/google/android/apps/classroom/g3doc/resources/rants-by-alex/rants/rant7-contextcompat-examples-23-resized.png)]
(/java/com/google/android/apps/classroom/g3doc/resources/rants-by-alex/rants/rant7-contextcompat-examples-19.png)

Note that there isn't anything special about the weird pink color in the two
screenshots. That's just the "undefined behavior" that results when you try to
resolve a theme attribute without a corresponding `Theme`. :)

