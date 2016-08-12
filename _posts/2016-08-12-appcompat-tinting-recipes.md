---
layout: post
title: 'AppCompat Tinting Recipes'
date: 2016-08-12
permalink: /2016/08/appcompat-tinting-recipes.html
related: ['/2013/08/fragment-transaction-commit-state-loss.html',
    '/2013/04/retaining-objects-across-config-changes.html',
    '/2016/08/contextcompat-getcolor-getdrawable.html']
---

<!--morestart-->

AppCompat tinting recipes and other yumminess!

<!--more-->

### Frequently used methods & constants

The methods below assume the existence of the following utility methods:

```java
private static final int[] DISABLED_STATE_SET = new int[]{-android.R.attr.state_enabled};
private static final int[] FOCUSED_STATE_SET = new int[]{android.R.attr.state_focused};
private static final int[] PRESSED_STATE_SET = new int[]{android.R.attr.state_pressed};
private static final int[] CHECKED_STATE_SET = new int[]{android.R.attr.state_checked};
private static final int[] NOT_PRESSED_OR_FOCUSED_STATE_SET = new int[]{
    -android.R.attr.state_pressed,
    -android.R.attr.state_focused
};
private static final int[] EMPTY_STATE_SET = new int[0];

/**
 * Returns the theme-dependent ARGB color associated with the provided theme attribute.
 */
@ColorInt
public static int getThemeAttrColor(Context context, @AttrRes int attr) {
  final TypedArray array = context.obtainStyledAttributes(null, new int[]{attr});
  try {
    return array.getColor(0, 0);
  } finally {
    array.recycle();
  }
}

/**
 * Returns the theme-dependent ARGB color to use for disabled AppCompat widgets.
 */
@ColorInt
public static int getDisabledTintColor(Context context, @AttrRes int baseColorAttr) {
  final TypedValue tv = new TypedValue();
  context.getTheme().resolveAttribute(android.R.attr.disabledAlpha, tv, true);
  final float disabledAlpha = tv.getFloat();
  final int baseColor = getThemeAttrColor(context, baseColorAttr);
  final int originalAlpha = Color.alpha(baseColor);
  return setAlphaComponent(baseColor, Math.round(originalAlpha * disabledAlpha));
}
```

#### Example usage

```java
int colorControlNormal = getThemeAttrColor(context, R.attr.colorControlNormal);

int disabledColorControlNormal = getDisabledTintColor(context, R.attr.colorControlNormal);
```

### `Button`s

```java
public static ColorStateList forButton(Context context, @ColorInt int tintColor) {
  // On pre-Lollipop devices, we need 4 states total (disabled, pressed, focused, and default).
  // On post-Lollipop devices, we need 2 states total (disabled and default). The button's
  // RippleDrawable will animate the pressed and focused state changes for us automatically.
  final int numStates = Build.VERSION.SDK_INT < Build.VERSION_CODES.LOLLIPOP ? 4 : 2;

  final int[][] states = new int[numStates][];
  final int[] colors = new int[numStates];

  int i = 0;

  states[i] = DISABLED_STATE_SET;
  colors[i] = getDisabledTintColor(context, R.attr.colorButtonNormal);
  i++;

  if (Build.VERSION.SDK_INT < Build.VERSION_CODES.LOLLIPOP) {
    // Calculate the theme-dependent ARGB color that results when colorControlHighlight 
    // is drawn on top of the provided tint color.
    final int highlightedBackgroundColor =
        ColorUtils.compositeColors(
            getThemeAttrColor(context, R.attr.colorControlHighlight), tintColor);

    states[i] = PRESSED_STATE_SET;
    colors[i] = highlightedBackgroundColor;
    i++;

    states[i] = FOCUSED_STATE_SET;
    colors[i] = highlightedBackgroundColor;
    i++;
  }

  states[i] = EMPTY_STATE_SET;
  colors[i] = tintColor;

  return new ColorStateList(states, colors);
}
```

#### Example usage

```java
ViewCompat.setBackgroundTintList(
    button, TintUtils.forButton(button.getContext(), tintColor));
```

### `EditText`s

```java
public static ColorStateList forEditText(Context context, @ColorInt int tintColor) {
  final int[][] states = new int[3][];
  final int[] colors = new int[3];

  states[0] = DISABLED_STATE_SET;
  colors[0] = getDisabledTintColor(context, R.attr.colorControlNormal);

  states[1] = NOT_PRESSED_OR_FOCUSED_STATE_SET;
  colors[1] = getThemeAttrColor(context, R.attr.colorControlNormal);

  states[2] = EMPTY_STATE_SET;
  colors[2] = tintColor;

  return new ColorStateList(states, colors);
}
```

#### Example usage

```java
ViewCompat.setBackgroundTintList(
    editText, TintUtils.forEditText(editText.getContext(), tintColor));
```

### `CheckBox`s & `RadioButton`s

```java
public static ColorStateList forRadioButton(Context context, @ColorInt int tintColor) {
  return forCheckableView(context, tintColor);
}

public static ColorStateList forCheckBox(Context context, @ColorInt int tintColor) {
  return forCheckableView(context, tintColor);
}

private static ColorStateList forCheckableView(Context context, @ColorInt int tintColor) {
  final int[][] states = new int[3][];
  final int[] colors = new int[3];

  states[0] = DISABLED_STATE_SET;
  colors[0] = getDisabledTintColor(context, R.attr.colorControlNormal);

  states[1] = CHECKED_STATE_SET;
  colors[1] = tintColor;

  states[2] = EMPTY_STATE_SET;
  colors[2] = getThemeAttrColor(context, R.attr.colorControlNormal);

  return new ColorStateList(states, colors);
}
```

#### Example usage

```java
CompoundButtonCompat.setButtonTintList(
    checkBox, TintUtils.forCheckBox(checkBox.getContext(), tintColor));

CompoundButtonCompat.setButtonTintList(
    radioButton, TintUtils.forRadioButton(radioButton.getContext(), tintColor));
```

### `Switch`s

```java
private static final int SWITCH_TRACK_DISABLED_ALPHA = Math.round(0.1f * 0xff);
private static final int SWITCH_TRACK_DEFAULT_ALPHA = Math.round(0.3f * 0xff);

public static ColorStateList forSwitchThumb(Context context, @ColorInt int tintColor) {
  final int[][] states = new int[3][];
  final int[] colors = new int[3];

  states[0] = DISABLED_STATE_SET;
  colors[0] = getDisabledTintColor(context, R.attr.colorSwitchThumbNormal);

  states[1] = CHECKED_STATE_SET;
  colors[1] = tintColor;

  states[2] = EMPTY_STATE_SET;
  colors[2] = getThemeAttrColor(context, R.attr.colorSwitchThumbNormal);

  return new ColorStateList(states, colors);
}

public static ColorStateList forSwitchTrack(Context context, @ColorInt int tintColor) {
  final int[][] states = new int[3][];
  final int[] colors = new int[3];

  states[0] = DISABLED_STATE_SET;
  colors[0] = setAlphaComponent(
      getDisabledTintColor(context, android.R.attr.colorForeground), SWITCH_TRACK_DISABLED_ALPHA);

  states[1] = CHECKED_STATE_SET;
  colors[1] = setAlphaComponent(tintColor, SWITCH_TRACK_DEFAULT_ALPHA);

  states[2] = EMPTY_STATE_SET;
  colors[2] = setAlphaComponent(
      getThemeAttrColor(context, android.R.attr.colorForeground), SWITCH_TRACK_DEFAULT_ALPHA);

  return new ColorStateList(states, colors);
}
```

#### Example usage

```java
switchCompat.setTrackTintList(
    TintUtils.forSwitchTrack(switchCompat.getContext(), tintColor));
switchCompat.setThumbTintList(
    TintUtils.forSwitchThumb(switchCompat.getContext(), tintColor));
```

