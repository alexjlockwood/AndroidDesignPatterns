---
layout: post
title: 'Theming Buttons with ThemeOverlays'
date: 2016-08-06
permalink: /2016/08/theming-buttons-with-themeoverlays.html
related: ['/2012/08/implementing-loaders.html',
    '/2013/08/fragment-transaction-commit-state-loss.html',
    '/2012/06/app-force-close-honeycomb-ics.html']
---

<!--morestart-->

Let's say you want to change the background color of a regular old `Button`.
How should this be done?

First, we must understand how the background color of a button is actually
determined. The [material design spec on "Buttons"](https://material.google.com/components/buttons.html)
has very specific requirements about what a button should look like in light
themes vs. dark themes. How are these requirements met under-the-hood?

<!--more-->

### Understanding `R.attr.colorButtonNormal`

So you probably know that AppCompat injects its own widgets in place of many framework
widgets, giving AppCompat greater control over tinting widgets according to the material design
spec even on pre-Lollipop devices. At runtime, `Button`s will become [`AppCompatButton`][AppCompatButton]s,
so with that in mind let's do a bit of source code digging to determine how the button's background color
is actually chosen:

1.  The default style applied to `AppCompatButton`s is the style pointed to by
    the [`R.attr.buttonStyle` theme attribute](https://github.com/android/platform_frameworks_support/blob/marshmallow-mr2-release/v7/appcompat/src/android/support/v7/widget/AppCompatButton.java#L60).

2.  ...which is declared in [`Base.V7.Theme.AppCompat`](https://github.com/android/platform_frameworks_support/blob/marshmallow-mr2-release/v7/appcompat/res/values/themes_base.xml#L234).

3.  ...which points to [`@style/Widget.AppCompat.Button`](https://github.com/android/platform_frameworks_support/blob/marshmallow-mr2-release/v7/appcompat/res/values/styles.xml#L205).

4.  ...which extends [`@style/Base.Widget.AppCompat.Button`](https://github.com/android/platform_frameworks_support/blob/marshmallow-mr2-release/v7/appcompat/res/values/styles_base.xml#L399).

5.  ...which uses
    [`@drawable/abc_btn_default_mtrl_shape`]((https://github.com/android/platform_frameworks_support/blob/marshmallow-mr2-release/v7/appcompat/res/values/styles_base.xml#L400))
    as the view's default background drawable.

6.  Now, let's take a look at AppCompat's internal [`TintManager`][TintManager] class,
    which contains most of the logic that determines how most of these widgets are tinted at runtime.
    According to the source code, `AppCompatButton` backgrounds are tinted using one of two
    predefined default `ColorStateList`s, which you can see by analyzing the
    source code [here](https://github.com/android/platform_frameworks_support/blob/marshmallow-mr2-release/v7/appcompat/src/android/support/v7/internal/widget/TintManager.java#L296-L299)<a href="#ref1" title="Jump to footnote 1.">&#8617;</a>:

    ```java
    ...
    } else if (resId == R.drawable.abc_btn_default_mtrl_shape
            || resId == R.drawable.abc_btn_borderless_material) {
        tint = createDefaultButtonColorStateList(context);
    } else if (resId == R.drawable.abc_btn_colored_material) {
        tint = createColoredButtonColorStateList(context);
    }
    ...
    ```

    and [here](https://github.com/android/platform_frameworks_support/blob/marshmallow-mr2-release/v7/appcompat/src/android/support/v7/internal/widget/TintManager.java#L486-L521):

    ```java
     private ColorStateList createDefaultButtonColorStateList(Context context) {
         return createButtonColorStateList(context, R.attr.colorButtonNormal);
     }

     private ColorStateList createColoredButtonColorStateList(Context context) {
         return createButtonColorStateList(context, R.attr.colorAccent);
     }

     private ColorStateList createButtonColorStateList(Context context, int baseColorAttr) {
         final int[][] states = new int[4][];
         final int[] colors = new int[4];
         int i = 0;

         final int baseColor = getThemeAttrColor(context, baseColorAttr);
         final int colorControlHighlight = getThemeAttrColor(context, R.attr.colorControlHighlight);

         // Disabled state
         states[i] = ThemeUtils.DISABLED_STATE_SET;
         colors[i] = getDisabledThemeAttrColor(context, R.attr.colorButtonNormal);
         i++;

         states[i] = ThemeUtils.PRESSED_STATE_SET;
         colors[i] = ColorUtils.compositeColors(colorControlHighlight, baseColor);
         i++;

         states[i] = ThemeUtils.FOCUSED_STATE_SET;
         colors[i] = ColorUtils.compositeColors(colorControlHighlight, baseColor);
         i++;

         // Default enabled state
         states[i] = ThemeUtils.EMPTY_STATE_SET;
         colors[i] = baseColor;
         i++;

         return new ColorStateList(states, colors);
     }
     ```

That's a lot of information to take in! To summarize, the important thing to 
understand from the code above can be summed up with the following:

> Let `S` be the style resource that is assigned to button `B`. Note that if no
> style is provided in the client's XML code, AppCompat uses the style resource
> pointed to by theme attribute `R.attr.buttonStyle` (which by default is
> `@style/Widget.AppCompat.Button` for AppCompat-based themes).
>
> If `S` is the default `@style/Widget.AppCompat.Button` style, then the
> background is tinted using the color resource pointed to by theme attribute
> `R.attr.colorButtonNormal`.
>
> If `S` is the `@style/Widget.AppCompat.Button.Colored` style (i.e. the style
> that sets `R.drawable.abc_btn_colored_material` as the button's background
> drawable), then the background is tinted using the color resource pointed to
> by theme attribute `R.attr.colorAccent`.

Got all that? Good! Because unfortunately there isn't a great deal of documentation
on this at the moment<a href="#ref2" title="Jump to footnote 2.">&#8617;</a>...
so don't forget! (No, but seriously... don't forget).

### Understanding `ThemeOverlay`s

So now we know that button backgrounds are themed using the color resource
pointed to by the `R.attr.colorButtonNormal` theme attribute. One way we could
update the value specified by this theme attribute is by modifying the
application's theme directly. This is rarely desired however, since most of the
time we only want to change the background color of a single button in our app.
Modifying the theme attribute at the application level will change the
background color of *all buttons in the entire application*.

Instead, a much better solution is to assign the button its own custom theme in
XML using `android:theme`. Let's say we want to change the button's background
color to Google Red 500 and its text color to white instead of 87% black. To
achieve this, we can define the following theme:

```xml
<!-- res/values/themes.xml -->
<style name="LightCustomRedButtonTheme" parent="ThemeOverlay.AppCompat.Light">
    <item name="colorButtonNormal">@color/googred500</item>
    <item name="android:textColor">?android:textColorPrimaryInverse</item>
</style>
```

and set it on the button in the layout XML:

```xml
<Button
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="Light themed custom red button"
    android:theme="@style/LightCustomRedButtonTheme"/>
```

And that's it, you're done!

You're probably still wondering what's up with that weird
`ThemeOverlay` though. Unlike the themes we use in our `AndroidManifest.xml`
files (i.e. `Theme.AppCompat.Light`, `Theme.AppCompat.Dark`, etc.),
`ThemeOverlay`s define only a small set of material-styled theme attributes that
are most often used when theming each view's appearance (see the
[source code for a complete list of these attributes](https://github.com/android/platform_frameworks_support/blob/marshmallow-mr2-release/v7/appcompat/res/values/themes_base.xml#L551-L604)).
As a result, they are very useful in cases where you only want to modify one or
two properties of a particular view: just extend the `ThemeOverlay`, update the
attributes you want to modify with their new values, and you can be sure that
your view will still inherit all of the correct light/dark themed values that
would have otherwise been used by default.

### Pop quiz!

Hopefully things are a bit clearer now than they used to be (styles/themes are
hard... and it's a lot to take in). I'll give an extra example just in case.

Let's say you are writing a sample app that uses the following theme in the
`AndroidManifest.xml`:

```xml
<!-- res/values/themes.xml -->
<style name="AppTheme" parent="Theme.AppCompat.Light.DarkActionBar">
    <item name="colorPrimary">@color/indigo500</item>
    <item name="colorPrimaryDark">@color/indigo700</item>
    <item name="colorAccent">@color/pinkA200</item>
</style>
```

In addition to this, the following custom themes are declared as well:

```xml
<!-- res/values/themes.xml -->
<style name="LightCustomRedButtonTheme" parent="ThemeOverlay.AppCompat.Light">
    <item name="colorButtonNormal">@color/googred500</item>
    <item name="android:textColor">?android:textColorPrimaryInverse</item>
</style>

<style name="DarkCustomRedButtonTheme" parent="ThemeOverlay.AppCompat.Dark">
    <item name="colorButtonNormal">@color/googred500</item>
    <item name="android:textColor">?android:textColorPrimaryInverse</item>
</style>
```

What will the following XML look like in the application?

```xml
<LinearLayout
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:orientation="vertical">

    <Button
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="..."/>

    <Button
        style="@style/Widget.AppCompat.Button.Colored"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="..."/>

    <Button
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="..."
        android:theme="@style/LightCustomRedButtonTheme"/>

    <Button
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="..."
        android:theme="@style/ThemeOverlay.AppCompat.Dark"/>

    <Button
        style="@style/Widget.AppCompat.Button.Colored"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="..."
        android:theme="@style/ThemeOverlay.AppCompat.Dark"/>

    <Button
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="..."
        android:theme="@style/DarkCustomRedButtonTheme"/>
</LinearLayout>
```

#### Solutions

Here are the screenshots of what it looks like when the buttons are put in
enabled and disabled states:

<div style="display: block;">
  <div style="float:left; margin-right:16px;">
    <a href="/assets/images/posts/2016/08/06/rant6-buttons-enabled.png">
      <img alt="Example code solutions, buttons enabled" src="/assets/images/posts/2016/08/06/rant6-buttons-enabled-resized.png"/>
    </a>
  </div>
  <div style="float:left;">
    <a href="/assets/images/posts/2016/08/06/rant6-buttons-disabled.png">
      <img alt="Example code solutions, buttons disabled" src="/assets/images/posts/2016/08/06/rant6-buttons-disabled-resized.png"/>
    </a>
  </div>
</div>

<div style="display: inline-block;">
As always, thanks for reading! Feel free to leave a comment if you have any questions, and don't forget to +1 and/or share this blog post if you found it helpful! And check out the 
<a href="">source code for these examples on GitHub</a> as well!
</div>

<hr class="footnote-divider"/>
<sup id="footnote1">1</sup> Note that `R.drawable.abc_btn_borderless_material` and `R.drawable.abc_btn_colored_material`
are the background drawable resources that are used when you apply the 
[`@style/Widget.AppCompat.Button.Colored`][Base.Widget.AppCompat.Button.Colored] and [`@style/Widget.AppCompat.Button.Borderless`][Base.Widget.AppCompat.Button.Borderless]
styles to your `AppCompatButton` respectively. <a href="#ref1" title="Jump to footnote 1.">&#8617;</a>

<sup id="footnote2">2</sup> If you have any links/blogs/documentation on AppCompat in mind that you've found useful in the past,
please feel free to leave a link in the comments below! I'd love to check it out. <a href="#ref2" title="Jump to footnote 2.">&#8617;</a>

  [AppCompatButton]: https://developer.android.com/reference/android/support/v7/widget/AppCompatButton.html
  [TintManager]: (https://github.com/android/platform_frameworks_support/blob/marshmallow-mr2-release/v7/appcompat/src/android/support/v7/internal/widget/TintManager.java)
  [Base.Widget.AppCompat.Button.Colored]: https://github.com/android/platform_frameworks_support/blob/marshmallow-mr2-release/v7/appcompat/res/values/styles_base.xml#L417
  [Base.Widget.AppCompat.Button.Borderless]: https://github.com/android/platform_frameworks_support/blob/marshmallow-mr2-release/v7/appcompat/res/values/styles_base.xml#L423

