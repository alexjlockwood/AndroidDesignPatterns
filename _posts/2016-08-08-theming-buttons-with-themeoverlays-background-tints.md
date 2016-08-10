---
layout: post
title: 'Coloring Buttons w/ ThemeOverlays & Background Tints'
date: 2016-08-08
permalink: /2016/08/coloring-buttons-with-themeoverlays-background-tints.html
related: ['/2013/08/fragment-transaction-commit-state-loss.html',
    '/2013/04/retaining-objects-across-config-changes.html',
    '/2016/08/contextcompat-getcolor-getdrawable.html']
---

<!--morestart-->

Let's say you want to change the background color of a `Button`.
How should this be done?

This blog post covers two different approaches. In the first approach,
we'll use AppCompat's standard `Widget.AppCompat.Button` styles and a custom `ThemeOverlay`
to modify the button's background color directly, and in the second, we'll use
AppCompat's built-in background tinting features to achieve an identical effect.

<!--more-->

### Approach #1: Modifying the button's background color w/ a `ThemeOverlay`

Before we get too far ahead of ourselves, we should first understand how button
background colors are actually determined. The [material design spec][MaterialDesignSpecButtons]
has very specific requirements about what a button should look like in both light
and dark themes. How are these requirements met under-the-hood?

#### The `Widget.AppCompat.Button` button styles

Perhaps not surprisingly, answering this question requires a basic understanding of how
AppCompat's internally makes use of default styles and themes.
AppCompat exposes a number of different styles that developers can use to alter
the appearance of a standard button, each extending a base
[`Widget.AppCompat.Button`][@style/Widget.AppCompat.Button] style that is applied to all
AppCompat-themed buttons by
default.<sup><a href="#footnote??????????" id="ref??????????">??????????</a></sup>
Specifying default styles for all views of a certain type is a popular technique that you'll
find is used throughout the Android source code; it gives the framework an
opportunity to apply a set of default values for each widget, thus
encouraging a more consistent user experience across all applications. Specifically, the default
`Widget.AppCompat.Button` style helps ensure that:

* All buttons share the same default minimum width and minimum height
  (`88dp` and `48dp` respectively, as specified by the
  [material design spec][MaterialDesignSpecButtons]).
* All buttons share the same default `TextAppearance` (i.e. displaying text in all capital
  letters, the same default font family, font color, font size, etc.).
* All buttons share the same default button background (i.e. same background
  color, same rounded-rectangular shape, same insets and padding,
  etc.).<sup><a href="#footnote??????????" id="ref??????????">??????????</a></sup>

Great, so the `Widget.AppCompat.Button` style helps ensure that all buttons
look roughly the same in their default state. But how are characteristics such as the button's
background color chosen in light vs. dark themes, not only in its normal state, but
in its disabled, pressed, and focused states as well? To do this, AppCompat depends heavily on
three different theme attributes:

* [**`R.attr.colorButtonNormal`**][R.attr.colorButtonNormal]: The color used as a button's
  background color in
  its normal state. Resolves to and `#ffd6d7d7` for light themes and `#ff5a595b` for dark themes.
* [**`android.R.attr.disabledAlpha`**][android.R.attr.disabledAlpha]: A floating point number that
  determines the
  alpha values to use for disabled framework widgets. Resolves to `0.26f` for light themes
  and `0.30f` for dark themes.
* [**`R.attr.colorControlHighlight`**][R.attr.colorControlHighlight]: The translucent overlay color
  drawn on top of widgets
  when they are pressed and/or focused (used by things like ripples on post-Lollipop devices
  and foreground list selectors on pre-Lollipop devices). Resolves to 12% black for light themes
  and 20% white for dark themes (`#1f000000` and `#33ffffff` respectively).

That's a lot to take in for something as simple as changing the background
color of a button! Fortunately, AppCompat handles almost everything for us behind the scenes
by providing a second [`Widget.AppCompat.Button.Colored`][@style/Widget.AppCompat.Button.Colored]
style that makes altering the background color of a button relatively easy.
As its name suggests, the style extends `Widget.AppCompat.Button` and thus
inherits all of the same attributes with one notable exception: the
[`R.attr.colorAccent`][R.attr.colorAccent]
theme attribute determines the button's base background color instead.

#### Creating custom themes using `ThemeOverlay`s

So now we know that button backgrounds can be customized using the
`Widget.AppCompat.Button.Colored` style, but how should we go about customizing the
theme's accent color? One way we could
update the color pointed to by the `R.attr.colorAccent` theme attribute is by modifying the
application's theme directly. However, this is rarely desirable since most of the
time we only want to change the background color of a single button in our app.
Modifying the theme attribute at the application level will change the
background color of *all buttons in the entire application*.

Instead, a much better solution is to assign the button its own custom theme in
XML using `android:theme` and a `ThemeOverlay`. Let's say we want to change the button's background
color to Google Red 500. To achieve this, we simply define the following theme...

```xml
<!-- res/values/themes.xml -->
<style name="LightAccentRedButtonTheme" parent="ThemeOverlay.AppCompat.Light">
    <item name="colorAccent">@color/googred500</item>
</style>
```

...and set it on our button in the layout XML as follows...

```xml
<Button
    style="@style/Widget.AppCompat.Button.Colored"
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="Light themed custom accent button"
    android:theme="@style/LightAccentRedButtonTheme"/>
```

And that's it, we're done! You're probably still wondering what's up with that weird
`ThemeOverlay` though. Unlike the themes we use in our `AndroidManifest.xml`
files (i.e. `Theme.AppCompat.Light`, `Theme.AppCompat.Dark`, etc.),
`ThemeOverlay`s define only a small set of material-styled theme attributes that
are most often used when theming each view's appearance (see the
[source code for a complete list of these attributes][ThemeOverlayAttributes]).
As a result, they are very useful in cases where you only want to modify one or
two properties of a particular view: just extend the `ThemeOverlay`, update the
attributes you want to modify with their new values, and you can be sure that
your view will still inherit all of the correct light/dark themed values that
would have otherwise been used by
default.<sup><a href="#footnote??????????" id="ref??????????">??????????</a></sup>
If you want to read more about
`ThemeOverlay`s, check out [this Medium post][ThemeOverlayBlogPost] and this
[Google+ pro tip][ThemeOverlayProTip] by [Ian Lake](http://google.com/+IanLake)!

### Approach #2: Setting the `AppCompatButton`'s background tint

Hopefully you've made it this far in the post, because you'll be happy to know that
there is an *even more powerful*
way to color a button's background using a relatively new feature in AppCompat known as
background tinting. You probably know that AppCompat injects its own widgets in
place of many framework
widgets, giving AppCompat greater control over tinting widgets according to the material design
spec even on pre-Lollipop devices. At runtime, `Button`s become `AppCompatButton`s,
`ImageView`s become `AppCompatImageView`s, `CheckBox`s become `AppCompatCheckBox`s,
and so on and so forth. What you may not know is that any
AppCompat widget that implements the [`TintableBackgroundView`][TintableBackgroundView]
interface can have its background tint color changed by declaring a `ColorStateList`...

```xml
<!-- res/color/btn_colored_background_tint.xml -->
<selector xmlns:android="http://schemas.android.com/apk/res/android">

    <!-- Disabled state. -->
    <item android:state_enabled="false"
          android:color="?attr/colorButtonNormal"
          android:alpha="?android:attr/disabledAlpha"/>

    <!-- Enabled state. -->
    <item android:color="?attr/colorAccent"/>

</selector>
```

...and either setting it in the layout XML...

```xml
<android.support.v7.widget.AppCompatButton
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    app:backgroundTint="@color/btn_colored_background_tint"/>
```

...or programatically via the
[`ViewCompat#setBackgroundTintList(View, ColorStateList)`][ViewCompat#setBackgroundTintList()]
method...<sup><a href="#footnote??????????" id="ref??????????">??????????</a></sup>

```java
final ColorStateList backgroundTintList =
    AppCompatResources.getColorStateList(context, R.color.btn_colored_background_tint);
ViewCompat.setBackgroundTintList(button, backgroundTintList);
```

While this approach to coloring a button is much more powerful in the sense that it can be
done entirely programatically (`ThemeOverlay`s must be defined in XML and cannot be constructed at
runtime), it also requires a bit more work on our end if we want to ensure our button exactly meets
the material design spec. Let's create a simple `BackgroundTints` utility class that makes
it quick and easy to construct colored background tint lists:

```java
/**
 * Utility class for creating background tint {@link ColorStateList}s.
 */
public final class BackgroundTints {
  private static final int[] DISABLED_STATE_SET = new int[]{-android.R.attr.state_enabled};
  private static final int[] PRESSED_STATE_SET = new int[]{android.R.attr.state_pressed};
  private static final int[] FOCUSED_STATE_SET = new int[]{android.R.attr.state_focused};
  private static final int[] EMPTY_STATE_SET = new int[0];

  /**
   * Returns a {@link ColorStateList} that can be used as a colored button's background tint.
   * Note that this code makes use of the {@code android.support.v4.graphics.ColorUtils}
   * and {@code android.support.v7.content.res.AppCompatResources} utility classes.
   */
  public static ColorStateList forColoredButton(Context context, @ColorInt int accentColor) {
    // On pre-Lollipop devices, we need 4 states total (disabled, pressed, focused, and default).
    // On post-Lollipop devices, we only need 2 states total (disabled and default); the button's
    // RippleDrawable will animate the pressed and focused state changes for us automatically.
    final int numStates = Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP ? 2 : 4;

    final int[][] states = new int[numStates][];
    final int[] colors = new int[numStates];

    int i = 0;

    states[i] = DISABLED_STATE_SET;
    colors[i] = getDisabledButtonBackgroundColor(context);
    i++;

    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.LOLLIPOP) {
      final int highlightedAccentColor = getHighlightedAccentColor(context, accentColor);

      states[i] = PRESSED_STATE_SET;
      colors[i] = highlightedAccentColor;
      i++;

      states[i] = FOCUSED_STATE_SET;
      colors[i] = highlightedAccentColor;
      i++;
    }

    states[i] = EMPTY_STATE_SET;
    colors[i] = accentColor;

    return new ColorStateList(states, colors);
  }

  /** 
   * Returns the theme-dependent ARGB background color to use for disabled buttons.
   */
  @ColorInt
  private static int getDisabledButtonBackgroundColor(Context context) {
    // Extract the disabled alpha to apply to the button using the context's theme.
    // (0.26f for light themes and 0.30f for dark themes).
    final TypedValue tv = new TypedValue();
    context.getTheme().resolveAttribute(android.R.attr.disabledAlpha, tv, true);
    final float disabledAlpha = tv.getFloat();

    // Use the disabled alpha factor and the button's default normal color
    // to generate the button's disabled background color.
    final int colorButtonNormal = getThemeAttrColor(context, R.attr.colorButtonNormal);
    final int originalAlpha = Color.alpha(colorButtonNormal);
    return ColorUtils.setAlphaComponent(
        colorButtonNormal, Math.round(originalAlpha * disabledAlpha));
  }

  /**
   * Returns the theme-dependent ARGB color that results when colorControlHighlight is drawn
   * on top of the provided accent color.
   */
  @ColorInt
  private static int getHighlightedAccentColor(Context context, @ColorInt int accentColor) {
    final int colorControlHighlight = getThemeAttrColor(context, R.attr.colorControlHighlight);
    return ColorUtils.compositeColors(colorControlHighlight, accentColor);
  }

  /** Returns the theme-dependent ARGB color associated with the provided theme attribute. */
  @ColorInt
  private static int getThemeAttrColor(Context context, @AttrRes int attr) {
    final TypedArray array = context.obtainStyledAttributes(null, new int[]{attr});
    try {
      return array.getColor(0, 0);
    } finally {
      array.recycle();
    }
  }

  private BackgroundTints() {}
}
```

Using this class, we can then simply apply the background tint to the button programatically using:

```java
ViewCompat.setBackgroundTintList(
    button, BackgroundTints.forColoredButton(button.getContext(), customAccentColor);
```

**TODO(alockwood): finish off the blog post with a conclusion paragraph or something like that?**

### Pop quiz!

Let's test our knowledge of how this all works with a simple example.
Consider a sample app that sets the following theme in its `AndroidManifest.xml`:

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
<style name="LightAccentRedButtonTheme" parent="ThemeOverlay.AppCompat.Light">
    <item name="colorAccent">@color/googred500</item>
</style>

<style name="DarkAccentRedButtonTheme" parent="ThemeOverlay.AppCompat.Dark">
    <item name="colorAccent">@color/googred500</item>
</style>
```

What will the following XML look like in the on API 19 and API 23 devices
when the buttons are put in default, pressed, and disabled states?

```xml
<LinearLayout
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:orientation="vertical">

    <Button
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"/>

    <Button
        style="@style/Widget.AppCompat.Button.Colored"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"/>

    <Button
        style="@style/Widget.AppCompat.Button.Colored"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:theme="@style/LightAccentRedButtonTheme"/>

    <Button
        android:id="@+id/light_themed_bg_tint_button"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"/>

    <Button
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:theme="@style/ThemeOverlay.AppCompat.Dark"/>

    <Button
        style="@style/Widget.AppCompat.Button.Colored"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:theme="@style/ThemeOverlay.AppCompat.Dark"/>

    <Button
        style="@style/Widget.AppCompat.Button.Colored"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:theme="@style/DarkAccentRedButtonTheme"/>

    <Button
        android:id="@+id/dark_themed_bg_tint_button"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:theme="@style/ThemeOverlay.AppCompat.Dark"/>

</LinearLayout>
```

You should assume that background tints are set programatically
on the 4th and 8th buttons as follows:

```java
final int googRed500 = ContextCompat.getColor(activity, R.color.quantum_googred500);

final View lightBtn = activity.findViewById(R.id.light_themed_background_tint_button);
ViewCompat.setBackgroundTintList(
    lightBtn, BackgroundTints.forColoredButton(lightBtn.getContext(), googRed500));

final View darkBtn = activity.findViewById(R.id.dark_themed_background_tint_button);
ViewCompat.setBackgroundTintList(
    darkBtn, BackgroundTints.forColoredButton(darkBtn.getContext(), googRed500));
```

#### Solutions

See the below links to view screenshots of the solutions:

* [API 19, default state](/assets/images/posts/2016/08/08/themed-buttons-enabled-unpressed-19.png)
* [API 19, pressed state](/assets/images/posts/2016/08/08/themed-buttons-enabled-pressed-19.png)
* [API 19, disabled state](/assets/images/posts/2016/08/08/themed-buttons-disabled-19.png)
* [API 23, default state](/assets/images/posts/2016/08/08/themed-buttons-enabled-unpressed-23.png)
* [API 23, pressed state](/assets/images/posts/2016/08/08/themed-buttons-enabled-pressed-23.png)
* [API 23, disabled state](/assets/images/posts/2016/08/08/themed-buttons-disabled-23.png)

**TODO(alockwood): mention the colored disabled button bug [here][ColoredButtonDisabledTextBug]**<br>
**TODO(alockwood): add foot note to Dan Lew's blog post about view constructors**<br>
**TODO(alockwood): footnote about insets/padding for button background drawables?**<br>
**TODO(alockwood): footnote explaining why/when it is necessary to use `AppCompatResources`? link to previous blog post?**<br>
**TODO(alockwood): TALK ABOUT OTHER WAYS THIS APPROACH IS USEFUL! (example: using a ThemeOverlay to modify `android:colorEdgeEffect`)**<br>
**TODO(alockwood): footnote about difference between android.R.attr and R.attr?**<br>

As always, thanks for reading! Feel free to leave a comment if you have any questions,
and don't forget to +1 and/or share this blog post if you found it helpful! And check out the
[source code for these examples on GitHub][ThemedButtonsSourceCode] as well!

<hr class="footnote-divider"/>
<sup id="footnote??????????">??????????</sup> **TODO(alockwood): add foot note describing how the default
button styles are determined!** <a href="#ref??????????" title="Jump to footnote ??????????.">&#8617;</a>

<sup id="footnote??????????">??????????</sup> Note that AppCompat widgets do not expose a `setBackgroundTintList()`
methods as part of their public API. Clients *must* use the `ViewCompat#setBackgroundTintList()`
static helper methods to modify these properties programatically. <a href="#ref??????????" title="Jump to footnote ??????????.">&#8617;</a>

  [R.attr.colorButtonNormal]: https://developer.android.com/reference/android/support/v7/appcompat/R.attr.html#colorButtonNormal
  [android.R.attr.disabledAlpha]: https://developer.android.com/reference/android/R.attr.html#disabledAlpha
  [R.attr.colorControlHighlight]: https://developer.android.com/reference/android/support/v7/appcompat/R.attr.html#colorControlHighlight
  [R.attr.colorAccent]: https://developer.android.com/reference/android/support/v7/appcompat/R.attr.html#colorAccent

  [MaterialDesignSpecButtons]: http://material.google.com/components/buttons.html
  [ColoredButtonDisabledTextBug]: https://code.google.com/p/android/issues/detail?id=219276
  [ThemedButtonsSourceCode]: https://github.com/alexjlockwood/adp-theming-buttons-with-themeoverlays
  [DeepDiveAndroidViewConstructors]: http://blog.danlew.net/2016/07/19/a-deep-dive-into-android-view-constructors/

  [@style/Widget.Material.Button]: https://github.com/android/platform_frameworks_base/blob/fb61bb50281de909336c912c5a4b554b11de16cb/core/res/res/values/styles_material.xml#L459-L468
  [@style/Widget.Material.Button.Colored]: https://github.com/android/platform_frameworks_base/blob/fb61bb50281de909336c912c5a4b554b11de16cb/core/res/res/values/styles_material.xml#L471-L474
  [@style/Widget.Material.Button.Borderless]: https://github.com/android/platform_frameworks_base/blob/fb61bb50281de909336c912c5a4b554b11de16cb/core/res/res/values/styles_material.xml#L483-L486
  [@style/Widget.AppCompat.Button]: https://github.com/android/platform_frameworks_support/blob/3bc41c8f3870bca72a6c52f39a7e66fe967d5e9c/v7/appcompat/res/values/styles_base.xml#L409-L417
  [@style/Widget.AppCompat.Button.Colored]: https://github.com/android/platform_frameworks_support/blob/3bc41c8f3870bca72a6c52f39a7e66fe967d5e9c/v7/appcompat/res/values/styles_base.xml#L426-L429
  [@style/Widget.AppCompat.Button.Borderless]: https://github.com/android/platform_frameworks_support/blob/3bc41c8f3870bca72a6c52f39a7e66fe967d5e9c/v7/appcompat/res/values/styles_base.xml#L432-L434

  [@drawable/btn_default_mtrl_shape]: https://github.com/android/platform_frameworks_base/blob/fb61bb50281de909336c912c5a4b554b11de16cb/core/res/res/drawable/btn_default_mtrl_shape.xml
  [@drawable/btn_default_material]: https://github.com/android/platform_frameworks_base/blob/fb61bb50281de909336c912c5a4b554b11de16cb/core/res/res/drawable/btn_default_material.xml
  [@drawable/btn_colored_material]: https://github.com/android/platform_frameworks_base/blob/fb61bb50281de909336c912c5a4b554b11de16cb/core/res/res/drawable/btn_colored_material.xml
  [@drawable/btn_borderless_material]: https://github.com/android/platform_frameworks_base/blob/fb61bb50281de909336c912c5a4b554b11de16cb/core/res/res/drawable/btn_borderless_material.xml
  [@drawable/abc_btn_default_mtrl_shape]: https://github.com/android/platform_frameworks_support/blob/3bc41c8f3870bca72a6c52f39a7e66fe967d5e9c/v7/appcompat/res/drawable/abc_btn_default_mtrl_shape.xml
  [@drawable/abc_btn_colored_material]: https://github.com/android/platform_frameworks_support/blob/3bc41c8f3870bca72a6c52f39a7e66fe967d5e9c/v7/appcompat/res/drawable/abc_btn_colored_material.xml
  [@drawable/abc_btn_borderless_material]: https://github.com/android/platform_frameworks_support/blob/3bc41c8f3870bca72a6c52f39a7e66fe967d5e9c/v7/appcompat/res/drawable/abc_btn_borderless_material.xml

  [@color/btn_default_material_light]: https://github.com/android/platform_frameworks_base/blob/fb61bb50281de909336c912c5a4b554b11de16cb/core/res/res/color/btn_default_material_light.xml
  [@color/btn_default_material_dark]: https://github.com/android/platform_frameworks_base/blob/fb61bb50281de909336c912c5a4b554b11de16cb/core/res/res/color/btn_default_material_dark.xml
  [@color/btn_colored_material]: https://github.com/android/platform_frameworks_base/blob/fb61bb50281de909336c912c5a4b554b11de16cb/core/res/res/color/btn_colored_material.xml

  [Button]: https://developer.android.com/reference/android/widget/Button.html
  [AppCompatButton]: https://developer.android.com/reference/android/support/v7/widget/AppCompatButton.html
  [AppCompatDrawableManager]: https://github.com/android/platform_frameworks_support/blob/d57359e205b2c04a4f0f0ecf9dcb8d6086e75663/v7/appcompat/src/android/support/v7/widget/AppCompatDrawableManager.java
  [Base.Widget.AppCompat.Button.Colored]: https://github.com/android/platform_frameworks_support/blob/d57359e205b2c04a4f0f0ecf9dcb8d6086e75663/v7/appcompat/res/values/styles_base.xml#L417
  [Base.Widget.AppCompat.Button.Borderless]: https://github.com/android/platform_frameworks_support/blob/d57359e205b2c04a4f0f0ecf9dcb8d6086e75663/v7/appcompat/res/values/styles_base.xml#L423

  [ThemeOverlayBlogPost]: https://medium.com/google-developers/theming-with-appcompat-1a292b754b35#.ebo3ua3bu
  [ThemeOverlayProTip]: https://plus.google.com/+AndroidDevelopers/posts/JXHKyhsWHAH

  [ViewCompat#setBackgroundTintList()]: https://developer.android.com/reference/android/support/v4/view/ViewCompat.html#setBackgroundTintList(android.view.View, android.content.res.ColorStateList)
  [TextAppearance.AppCompat.Widget.Button.Inverse]: https://github.com/android/platform_frameworks_support/blob/d57359e205b2c04a4f0f0ecf9dcb8d6086e75663/v7/appcompat/res/values/styles_base_text.xml#L101-L103
  [TintableBackgroundView]: https://developer.android.com/reference/android/support/v4/view/TintableBackgroundView.html
  [ThemeOverlayAttributes]: https://github.com/android/platform_frameworks_support/blob/d57359e205b2c04a4f0f0ecf9dcb8d6086e75663/v7/appcompat/res/values/themes_base.xml#L551-L604)

  [R.attr.buttonStyle]: https://github.com/android/platform_frameworks_support/blob/d57359e205b2c04a4f0f0ecf9dcb8d6086e75663/v7/appcompat/src/android/support/v7/widget/AppCompatButton.java#L58
  [Base.V7.Theme.AppCompat]: https://github.com/android/platform_frameworks_support/blob/d57359e205b2c04a4f0f0ecf9dcb8d6086e75663/v7/appcompat/res/values/themes_base.xml#L237
  [Widget.AppCompat.Button]: https://github.com/android/platform_frameworks_support/blob/d57359e205b2c04a4f0f0ecf9dcb8d6086e75663/v7/appcompat/res/values/styles.xml#L204
  [Base.Widget.AppCompat.Button]: https://github.com/android/platform_frameworks_support/blob/d57359e205b2c04a4f0f0ecf9dcb8d6086e75663/v7/appcompat/res/values/styles_base.xml#L409
  [@drawable/abc_btn_default_mtrl_shape]: https://github.com/android/platform_frameworks_support/blob/d57359e205b2c04a4f0f0ecf9dcb8d6086e75663/v7/appcompat/res/values/styles_base.xml#L410

  [AppCompatDrawableManagerSource1]: https://github.com/android/platform_frameworks_support/blob/d57359e205b2c04a4f0f0ecf9dcb8d6086e75663/v7/appcompat/src/android/support/v7/widget/AppCompatDrawableManager.java#L309-L314
  [AppCompatDrawableManagerSource2]: https://github.com/android/platform_frameworks_support/blob/d57359e205b2c04a4f0f0ecf9dcb8d6086e75663/v7/appcompat/src/android/support/v7/widget/AppCompatDrawableManager.java#L513-L548

  [R.attr.buttonStyle_21]: https://github.com/android/platform_frameworks_base/blob/a294dacefff98a6328cda4200e64583a72ab8b36/core/res/res/values/themes_material.xml#L98
  [Widget.Material.Button_21]: https://github.com/android/platform_frameworks_base/blob/a294dacefff98a6328cda4200e64583a72ab8b36/core/res/res/values/styles_material.xml#L459
  [R.drawable.btn_default_material_21]: https://github.com/android/platform_frameworks_base/blob/a294dacefff98a6328cda4200e64583a72ab8b36/core/res/res/drawable/btn_default_material.xml
  [R.drawable.btn_default_mtrl_shape_21]: https://github.com/android/platform_frameworks_base/blob/a294dacefff98a6328cda4200e64583a72ab8b36/core/res/res/drawable/btn_default_mtrl_shape.xml
  [R.attr.colorButtonNormal_dark_21]: https://github.com/android/platform_frameworks_base/blob/4535e11fb7010f2b104d3f8b3954407b9f330e0f/core/res/res/values/themes_material.xml#L393
  [R.color.btn_default_material_dark_21]: https://github.com/android/platform_frameworks_base/blob/a294dacefff98a6328cda4200e64583a72ab8b36/core/res/res/color/btn_default_material_dark.xml
  [R.color.btn_material_dark_21]: https://github.com/android/platform_frameworks_base/blob/a294dacefff98a6328cda4200e64583a72ab8b36/core/res/res/values/colors_material.xml#L36
  [R.attr.colorButtonNormal_light_21]: https://github.com/android/platform_frameworks_base/blob/4535e11fb7010f2b104d3f8b3954407b9f330e0f/core/res/res/values/themes_material.xml#L749
  [R.color.btn_default_material_light_21]: https://github.com/android/platform_frameworks_base/blob/a294dacefff98a6328cda4200e64583a72ab8b36/core/res/res/color/btn_default_material_light.xml
  [R.color.btn_material_light_21]: https://github.com/android/platform_frameworks_base/blob/a294dacefff98a6328cda4200e64583a72ab8b36/core/res/res/values/colors_material.xml#L37
  [Widget.Material.Button.Colored_21]: https://github.com/android/platform_frameworks_base/blob/a294dacefff98a6328cda4200e64583a72ab8b36/core/res/res/values/styles_material.xml#L471
  [R.color.btn_colored_material]: https://github.com/android/platform_frameworks_base/blob/a294dacefff98a6328cda4200e64583a72ab8b36/core/res/res/color/btn_colored_material.xml
