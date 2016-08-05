---
layout: post
title: 'Theming Buttons with ThemeOverlays'
date: 2016-08-01
permalink: /2016/08/theming-buttons-with-themeoverlays.html
related: ['/2012/08/implementing-loaders.html',
    '/2013/08/fragment-transaction-commit-state-loss.html',
    '/2012/06/app-force-close-honeycomb-ics.html']
---

<!--morestart-->

Let's say you want to change the background color of a regular old button...

First, we should understand how the background color of a button is actually
determined. The [material design spec on "Buttons"](https://material.google.com/components/buttons.html)
has very specific requirements about what a button should look like in light
themes vs. dark themes. How are these set under-the-hood?

<!--more-->

### Understanding `R.attr.colorButtonNormal`

1.  The default style applied to `AppCompatButton`s is the style pointed to by
    the `R.attr.buttonStyle` theme attribute ([link](https://github.com/android/platform_frameworks_support/blob/marshmallow-mr2-release/v7/appcompat/src/android/support/v7/widget/AppCompatButton.java#L60)).

2.  ...which is declared [here](https://github.com/android/platform_frameworks_support/blob/marshmallow-mr2-release/v7/appcompat/res/values/themes_base.xml#L234).

3.  ...which points to `@style/Widget.AppCompat.Button` ([link](https://github.com/android/platform_frameworks_support/blob/marshmallow-mr2-release/v7/appcompat/res/values/styles.xml#L205)).

4.  ...which extends `@style/Base.Widget.AppCompat.Button` ([link](https://github.com/android/platform_frameworks_support/blob/marshmallow-mr2-release/v7/appcompat/res/values/styles_base.xml#L399)).

5.  ...which uses `@drawable/abc_btn_default_mtrl_shape` as the button's default
    background drawable ([link](https://github.com/android/platform_frameworks_support/blob/marshmallow-mr2-release/v7/appcompat/res/values/styles_base.xml#L400)).

6.  At runtime, `AppCompatButton` backgrounds are tinted using one of two
    predefined default `ColorStateList`s, which you can see by analyzing the
    source code [here](https://github.com/android/platform_frameworks_support/blob/62eb3105e51335cf9074a5506d8d2b220aeb95dc/v7/appcompat/src/android/support/v7/widget/AppCompatDrawableManager.java#L311):

    ```java
    ...
    } else if (resId == R.drawable.abc_btn_default_mtrl_shape) {
        tint = createDefaultButtonColorStateList(context);
    } else if (resId == R.drawable.abc_btn_colored_material) {
        tint = createColoredButtonColorStateList(context);
    }
    ...
    ```

    and [here](https://github.com/android/platform_frameworks_support/blob/62eb3105e51335cf9074a5506d8d2b220aeb95dc/v7/appcompat/src/android/support/v7/widget/AppCompatDrawableManager.java#L513-L548):

    ````java
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
    ````

I'll explain how all of this `ColorStateList` and tinting madness works in a
followup rant, but for now, the important thing to understand from the code
above can be summed up with the following:

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

Got all that? Good. Because there's basically no documentation about this other
than this rant and the source code... so don't forget! :D (No, but actually...
don't forget).

### Understanding `ThemeOverlay`s

So now we know that button backgrounds are themed using the color resource
pointed to by the `R.attr.colorButtonNormal` theme attribute. One way we could
update the value specified by this theme attribute is by modifying the
application's theme directly. This is rarely desired however, since most of the
time we want to only change the background color of a single button in the app.
Modifying the theme attribute at the application level will change the
background color of *all buttons in the entire application*.

Instead, a much better solution is to assign the button its own custom theme in
XML using `android:theme`. Let's say we want to change the button's background
color to Google Red 500 and its text color to white instead of 87% black. To
achieve this, we can define the following theme in `res/values/themes.xml`:

```xml
<style name="LightCustomRedButtonTheme" parent="ThemeOverlay.AppCompat.Light">
    <item name="colorButtonNormal">@color/quantum_googred500</item>
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

And that's it! You're probably still wondering what's going on with that
`ThemeOverlay` though. Unlike the themes we use in our `AndroidManifest.xml`
files (i.e. `Theme.AppCompat.Light`, `Theme.AppCompat.Dark`, etc.),
`ThemeOverlay`s define only a small set of material-styled theme attributes that
are most often used when theming each view's appearance (see the [source code
for a complete list of these attributes](https://github.com/android/platform_frameworks_support/blob/marshmallow-mr2-release/v7/appcompat/res/values/themes_base.xml#L551-L604)).
As a result, they are very useful in cases where you only want to modify one or
two properties of a particular view: just extend the `ThemeOverlay`, update the
attributes you want to modify with their new values, and you can be sure that
your view will still inherit all of the correct light/dark themed values that
would have otherwise been used by default.

### Examples

Hopefully things are a bit clearer now than they used to be (styles/themes are
hard... and it's a lot to take in). I'll give an extra example just in case:

Let's say you are writing a sample app that uses the following theme in the
`AndroidManifest.xml`:

```xml
<style name="AppTheme" parent="Theme.AppCompat.Light.DarkActionBar">
    <!-- Indigo 500 -->
    <item name="colorPrimary">#3F51B5</item>
    <!-- Indigo 700 -->
    <item name="colorPrimaryDark">#303F9F</item>
    <!-- Pink A200 -->
    <item name="colorAccent">#FF4081</item>
</style>
```

In addition to this, the following custom themes are declared in
`res/values/themes.xml` as well:

```xml
<style name="LightCustomRedButtonTheme" parent="ThemeOverlay.AppCompat.Light">
    <item name="colorButtonNormal">@color/quantum_googred500</item>
    <item name="android:textColor">?android:textColorPrimaryInverse</item>
</style>

<style name="DarkCustomRedButtonTheme" parent="ThemeOverlay.AppCompat.Dark">
    <item name="colorButtonNormal">@color/quantum_googred500</item>
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
        android:layout_marginBottom="16dp"
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
        android:layout_marginBottom="16dp"
        android:text="..."
        android:theme="@style/DarkCustomRedButtonTheme"/>
</LinearLayout>
```

#### Solutions

Here are the screenshots of what it looks like when the buttons are put in
enabled states:

[![Buttons enabled]
(/java/com/google/android/apps/classroom/g3doc/resources/rants-by-alex/rants/rant6-buttons-enabled-resized.png)]
(/java/com/google/android/apps/classroom/g3doc/resources/rants-by-alex/rants/rant6-buttons-enabled.png)

and in disabled states:

[![Buttons disabled]
(/java/com/google/android/apps/classroom/g3doc/resources/rants-by-alex/rants/rant6-buttons-disabled-resized.png)]
(/java/com/google/android/apps/classroom/g3doc/resources/rants-by-alex/rants/rant6-buttons-disabled.png)

