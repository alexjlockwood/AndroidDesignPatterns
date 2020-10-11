---
layout: post
title: "Contact List Compose"
date: 2020-10-09
permalink: /2020/10/contact-list-compose.html
related: ['/2013/08/fragment-transaction-commit-state-loss.html',
    '/2016/11/introduction-to-icon-animation-techniques.html',
    '/2016/08/contextcompat-getcolor-getdrawable.html']
---

## TODO

* Update title, permalink, date, and related links
* Add disclaimer that this uses `1.0.0-alpha04` and ask to report issues if things get out of date
* Link to the `Contact` data class somewhere?
* Any clarification needed with `CoilImage` + `Modifier.aspectRatio` + `Modifier.clip`?
* Add links to `Scaffold`, `TopAppBar`, etc.? Link to documentation or source code?
* Watch YouTube talks about compose to see if there is any useful info about state hoisting
* Link to icon animation post and Oredev talk

<!--morestart-->

Recently, I set out to create a simple 'Contact List' app w/ some cool animations using only Jetpack Compose.

TODO: show gif of the finished application w/ animations

I found this to be a really great learning experience for me. In this blog post, I will walk through the steps I took to implement this simple app. I'll also go into depth about some of Jetpack Compose's most important core concepts that I discovered along the way. The [source code][ContactListProject_SourceCode] of the final result is available on GitHub.

<!--more-->

The app we'll be building is simple. It contains one screen with a scrollable list of one or more contacts. Each contact is displayed in a card with a header image and 3 list items containing their name, job title, phone number, and email address. Clicking on the card will toggle its expanded state, in which it should seamlessly animate the contact's details in and out of view.

When starting a new Compose project, I find it incredibly useful to start building the smallest bits first and putting them all together at the very end. In this blog post, I'll follow this same strategy, with each step building off the previous one:

1. Create the `ContactListItem` composable
2. Using the result of step 1, create the expandable `ContactCard` composable
3. Using the result of step 2, create the `ContactList` composable
4. Using the result of step 3, create the `ContactListScreen` composable
5. Extra credit: create an animatable, path morphing `ExpandableChevron` composable

## Part 1: Creating a `ContactListItem`

The first thing we'll do is create a simple list item for us to use in our contact cards.<sup><a href="#footnote1" id="ref1">1</a></sup> The implementation is relatively straightforward, but there is a lot to disect. I'll present the code first and go over everything in depth below:

```kotlin
/**
 * A simple ListItem that displays text, detail text, a start icon,
 * and an optional end icon.
 */
@Composable
fun ContactListItem(
    text: @Composable () -> Unit,
    modifier: Modifier = Modifier,
    detailText: @Composable (() -> Unit)? = null,
    startIcon: @Composable (() -> Unit)? = null,
    endIcon: @Composable (() -> Unit)? = null,
) {
    // Render a horizontal row of items with a min height of 64dp.
    Row(modifier = modifier.preferredHeightIn(min = 64.dp)) {
        Spacer(modifier = Modifier.width(16.dp))

        // If specified, center the start icon vertically at the start of the list item.
        if (startIcon != null) {
            Box(modifier = Modifier.align(Alignment.CenterVertically)) {
                startIcon()
            }
            Spacer(modifier = Modifier.width(16.dp))
        }

        // Render the text and potential detail text vertically within the list item.
        Column(modifier = Modifier.align(Alignment.CenterVertically)) {
            ProvideEmphasis(EmphasisAmbient.current.high) {
                ProvideTextStyle(MaterialTheme.typography.subtitle1) {
                    // If not explicitly set by the caller, apply a high-emphasis,
                    // subtitle1 text style to the text.
                    text()
                }
            }

            if (detailText != null) {
                ProvideEmphasis(EmphasisAmbient.current.medium) {
                    ProvideTextStyle(MaterialTheme.typography.body2) {
                        // If not explicitly set by the caller, apply a medium-emphasis,
                        // body2 text style to the text.
                        detailText()
                    }
                }
            }
        }

        // If specified, render the end icon at the end of the list item.
        if (endIcon == null) {
            Spacer(modifier = Modifier.width(16.dp))
        } else {
            Spacer(modifier = Modifier.weight(1f))
            endIcon()
        }
    }
}
```

### Understanding the basics

The list item consists of several commonly used layouts:

* `Row` - similar to a horizontal `LinearLayout`
* `Column` - similar to a vertical `LinearLayout`
* `Box` - similar to a `FrameLayout`
* `Spacer` - similar to `Space` and commonly used to define layout margins between items

### `Row`s & `Column`s vs. `ConstraintLayout`

If you have worked with traditional `View`s before, you might be wondering if this list item could be optimized by replacing the nested `Row`s and `Column`s with a `ConstraintLayout` or by removing the `Spacer`s in favor of `Modifier.padding()`. However, from a performance standpoint, neither of these are a concern in Compose, which is able to efficiently render deep layout hierarchies with many composable children. The reason for this stems from the fact that Compose does not permit multi-pass measurements like traditional `View`s, meaning that an element may not measure any of its children more than once during layout. This not only allows Compose to efficiently render deep UI trees, but makes it easier to solve notoriously difficult problems such as animating layout positions and size changes, as we'll see later on in this blog post.

### Understanding Slot APIs

You've probably noticed that our `ContactListItem` function takes `@Composable () -> Unit`s as its arguments. This is what is known as a Slot API, a pattern Compose introduces to bring in a layer of customization on top of composables. Slots leave an empty space in the UI for the developer to fill as they wish, and are a useful tool when developing libraries of reusable composable components. You'll find that slot APIs are used heavily in the Material Design Compose library.<sup><a href="#footnote2" id="ref2">2</a></sup>

In the case of our example, consider what the alternative might look like without a Slot-based API. We would need to take on the responsibility of providing an argument for every possible way a client may want to style the list item text and icons, which can quickly get out of hand:

```kotlin
@Composable
fun ContactListItem(
    text: String,
    textFontSize: TextUnit = TextUnit.Inherit,
    textFontStyle: FontStyle? = null,
    textFontWeight: FontWeight? = null,
    textFontFamily: FontFamily? = null,
    /* ...and on, and on, and on... */
    /* ...and the same for the detail text... */
    /* ...and the same for the start and end icons... */
) {
    // ...

    // Create the list item text.
    Text(text = text, fontSize = ...)

    // Create the list item detail text.
    Text(text = detailText, fontSize = detailTextFontSize, ...)

    // ...
}
```

Of course, using Slot APIs in your own code is not a requirement. Depending on the usecase, it may make sene for you to avoid them all together, such as when you intentionally want to enforce a strict API with limited flexibility.

### Providing default values w/ `Ambient`s

You are also probably wondering what are these mysterious `ProvideEmphasis` and `ProvideTextStyle` function calls. In Compose, [`Ambient`][Ambient_Docs]s are useful when you want to create a dependency in a higher node of the layout tree and use it on lower nodes without having to pass it down the tree through every child Composable.<sup><a href="#footnote3" id="ref3">3</a></sup>

We can make use of `Ambient`s in a similar way using `ProvideEmphasis` and `ProvideTextStyle` in order to apply default text styling to our contact list item text. Because our list item uses a Slot-based API (effectively allowing the caller to pass in any composable they want), we won't be able to modify these properties directly. However, what we can do is take advantage of the fact that `Text` uses `AmbientContentColor.current` and `AmbientTextStyle.current` as its default [text color][Text_AmbientContentColor_Source] and [text style][Text_AmbientTextStyle_Source] respectively, enabling us to tweak the default values used by the [Material Design spec][MaterialDesignSpec_Lists], while enabling the caller to override these defaults if needed.

## Part 2: Creating the `ContactCard`

We begin by creating the smallest building blocks that make up the card. A `ContactCard` consists of the following:

* A large header image w/ `16:9` aspect ratio:<sup><a href="#footnote4" id="ref4">4</a></sup>

    ```kotlin
    @Composable
    private fun HeaderImage(imageUrl: String, modifier: Modifier = Modifier) {
        CoilImage(
            data = imageUrl,
            modifier = modifier.aspectRatio(16f / 9f),
            fadeIn = true,
            contentScale = ContentScale.Crop,
        )
    }
    ```

* A circular avatar image (used as the list item's start icon):

    ```kotlin
    @Composable
    private fun StartImage(imageUrl: String, modifier: Modifier = Modifier) {
        CoilImage(
            data = imageUrl,
            modifier = modifier.preferredSize(48.dp).clip(CircleShape),
            fadeIn = true,
            contentScale = ContentScale.Crop,
        )
    }
    ```

* A simple vector icon (also used as the list item's start icon):

    ```kotlin
    @Composable
    private fun StartIcon(asset: VectorAsset, modifier: Modifier = Modifier) {
        Icon(asset = asset, modifier = modifier.preferredSize(48.dp))
    }
    ```

* A single-line, ellipsized text element (used as the list item's text and detail text)

    ```kotlin
    @Composable
    private fun SingleLineText(text: String, modifier: Modifier = Modifier) {
        Text(
            text = text,
            modifier = modifier,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis,
        )
    }
    ```

Once we've created each of these composable helper functions, we can pass instances of them into the slots of our `ContactListItem` function. Then, we wrap them all in a vertical `Column` and place it in a `Card` from the Material compose library!

```kotlin
@Composable
fun ContactCard(
    contact: Contact,
    modifier: Modifier = Modifier,
    isExpanded: Boolean = false,
) {
    Card(modifier = modifier) {
        Column {
            HeaderImage(imageUrl = contact.imageUrl)
            ContactListItem(
                text = { SingleLineText(text = contact.name) },
                detailText = { SingleLineText(text = contact.description) },
                startIcon = { StartImage(imageUrl = contact.imageUrl) },
            )
            AnimatedVisibility(visible = isExpanded)  {
                Column {
                    ContactListItem(
                        text = { SingleLineText(text = contact.phoneNumber) },
                        detailText = { SingleLineText(text = contact.phoneNumberType) },
                        startIcon = { StartIcon(asset = Icons.Filled.Phone) },
                    )
                    ContactListItem(
                        text = { SingleLineText(text = contact.email) },
                        detailText = { SingleLineText(text = contact.emailType) },
                        startIcon = { StartIcon(asset = Icons.Filled.Email) },
                    )
                }
            }
        }
    }
}
```

### Passing `Modifier`s to composable functions

Most composables accept an optional modifier parameter to make them more flexible, enabling the caller to modify them. If you're creating your own composable, consider having a modifier as a parameter, default it to `Modifier` (i.e. an empty modifier that doesn't do anything) and apply it to the root composable of your function.

By convention, the modifier is specified as the first optional parameter of a function. This enables you to specify a modifier on a composable without having to name all parameters.

Note that providing a `Modifier` as an argument to your composable is not necessarily required, such as when you are creating a composable that you don't want others to be able to modify externally.

### `Modifier.preferredSize()` vs. `Modifier.size()`

* `Modifier.preferredSize()` is a great way to set a default size on a composable that can be easily overridden by a caller. Especially useful for library developers, where you want to set a good default, but want to provide a way for callers to customize the size if necessary.
* Compare the difference between:
  * `Modifier.size(64.dp).preferredSize(48.dp) == 64.dp`
  * `Modifier.size(64.dp).size(48.dp) == 48.dp`

### Understanding `AnimatedVisibility`

* A composable function that animates the appearance and disappearance of its content
* Kind of similar to `AutoTransition`, `Fade`, `ChangeBounds`, etc.
* Internally it reacts to visibility changes by re-layouting the composable content on each animation frame, something that would otherwise be frowned upon when dealing with traditional `View`s. But as we alluded to in Part 1, this is generally not an issue in Compose due to its single-pass measurement requirement.

## Part 3: Creating the `ContactList`

```kotlin
@Composable
fun ContactList(
    contacts: List<Contact>,
    modifier: Modifier = Modifier,
    contentPadding: PaddingValues = PaddingValues(0.dp)
) {
    // Remember a mutable state map of contact IDs to a boolean tracking
    // their card's current expanded state.
    val expandedContactsMap = remember { mutableStateMapOf<String, Boolean>() }
    LazyColumnForIndexed(
        items = contacts,
        modifier = modifier,
        contentPadding = contentPadding,
    ) { index, contact ->
        // Obtain this contact's current expanded state.
        val isContactCardExpanded = expandedContactsMap[contact.id] ?: false
        ContactCard(
            contact = contact,
            modifier = Modifier
                .fillMaxWidth()
                .clickable(onClick = {
                    // Toggle the card's expanded state each time it is clicked.
                    expandedContactsMap[contact.id] = !isContactCardExpanded
                }),
            isExpanded = isContactCardExpanded,
        )
        if (index < contacts.size - 1) {
            // Add a bottom margin beneath every card except the last.
            Spacer(modifier = Modifier.height(16.dp))
        }
    }
}
```

### Understanding `LazyColumnForIndexed`

* `LazyColumnForIndexed` is the equivalent of a vertical `RecyclerView` (except with a fraction of the required boilerplate code).

### Properly tracking expanded state

* We use `remember` to ensure that the state isn't completely lost when recomposition occurs.
* We keep track of a map of the state in the `ContactList` composable. Tracking each contact's state within the `ContactCard` will result in bugs due to the fact that `LazyColumnForIndexed` will remove them from the UI tree when they are scrolled offscreen.
* We follow a common pattern in Compose called state hoisting.

## Part 4: Creating the `ContactListScreen`

Finally, we finish off the app's core UI by creating a `ContactListScreen` composable. To do this, we use the `Scaffold` composable, which provides a Slot-based API for implementing a standard Android screen. In our case we provide a `TopAppBar` and the `ContactList` as the screen's main content:

```kotlin
@Composable
fun ContactListScreen(contacts: List<Contact>) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(stringResource(R.string.app_name)) },
                backgroundColor = MaterialTheme.colors.background,
            )
        },
    ) {
        ContactList(
            contacts = contacts,
            contentPadding = PaddingValues(16.dp),
        )
    }
}
```

## Part 5: Creating the animatable `ExpandableChevron`

```kotlin
/**
 * An expandable chevron icon that animates between an expanded and collapsed state.
 */
@Composable
fun ExpandableChevron(
    modifier: Modifier = Modifier,
    isExpanded: Boolean = false,
    color: Color = contentColor(),
) {
    // Create an AnimatedFloat with an initial value of 0f.
    val animatedProgress = animatedFloat(0f)

    onCommit(isExpanded) {
        // Animate the state change each time isExpanded has changed.
        animatedProgress.animateTo(targetValue = if (isExpanded) 1f else 0f)
    }

    // The SVG path data strings for the collapsed and expanded chevron icon respectively.
    val collapsedPathData = "M 12 13.17 L 7.41 8.59 L 6 10 L 12 16 L 18 10 L 16.59 8.59 L 12 13.17"
    val expandedPathData = "M 12 8 L 6 14 L 7.41 15.41 L 12 10.83 L 16.59 15.41 L 18 14 L 12 8"

    // Convert each path data string into a List<PathNode>. We remember this state to avoid
    // the unnecessary cost of having to parse SVG path data strings on each animation frame.
    val collapsedPathNodes = remember { addPathNodes(collapsedPathData) }
    val expandedPathNodes = remember { addPathNodes(expandedPathData) }

    // Create the morphed list of path nodes based on the current animated
    // progress t in the interval [0,1].
    val t = animatedProgress.value
    val morphedPathNodes = lerp(collapsedPathNodes, expandedPathNodes, t)

    // Draw the chevron icon using the morphed path nodes.
    Icon(
        painter = VectorPainter(
            defaultWidth = 24.dp,
            defaultHeight = 24.dp,
            viewportWidth = 24f,
            viewportHeight = 24f,
        ) { _, _ ->
            Path(
                pathData = morphedPathNodes,
                fill = SolidColor(color),
            )
        },
        modifier = modifier.preferredSize(48.dp),
    )
}

/**
 * Linearly interpolates two lists of path nodes to simulate path morphing.
 */
private fun lerp(
    fromPathNodes: List<PathNode>,
    toPathNodes: List<PathNode>,
    t: Float,
): List<PathNode> {
    return fromPathNodes.mapIndexed { i, from ->
        val to = toPathNodes[i]
        if (from is PathNode.MoveTo && to is PathNode.MoveTo) {
            PathNode.MoveTo(
                lerp(from.x, to.x, t),
                lerp(from.y, to.y, t),
            )
        } else if (from is PathNode.LineTo && to is PathNode.LineTo) {
            PathNode.LineTo(
                lerp(from.x, to.x, t),
                lerp(from.y, to.y, t),
            )
        } else {
            // We only support MoveTo and LineTo commands in this demo for brevity.
            throw IllegalStateException("Unsupported SVG PathNode command")
        }
    }
}
```

### Understanding the code

* Explain `onCommit`
* Explain `contentFor()`
* Explain `VectorPainter` being similar to a `VectorDrawable`
* Explain how the setup is similar to how `AnimatedVectorDrawable` work under-the-hood

## Conclusion

* TODO: write this shit

<hr class="footnote-divider"/>

<sup id="footnote1">1</sup> Be sure to check out the [`ListItem`][ListItem_Source] composable in the Material Design component library before writing your own! <a href="#ref1" title="Jump to footnote 1.">&#8617;</a>

<sup id="footnote2">2</sup> The [TopAppBar][TopAppBar_SlotAPI_Source] component is one such example. It consists of 3 slots: one for its navigation icon, one for its title/subtitle text, and another for its action icons. <a href="#ref2" title="Jump to footnote 2.">&#8617;</a> 

<sup id="footnote3">3</sup> A perfect example where `Ambient`s are used is in the `Surface` composable, which automatically calculates a content color based on the surface's background color and provides it to the [`AmbientContentColor`][Surface_AmbientContentColor_Source]. This ensures that composables in the `Surface` such as `Text` and `Icon` (and anything else that uses `AmbientContentColor.current` as its default color) will automatically take on an accessible color depending on the background, making it really easy to transition between light mode and dark mode. <a href="#ref3" title="Jump to footnote 3.">&#8617;</a> 

<sup id="footnote4">4</sup> Note that we use `CoilImage` from Chris Banes' [Accompanist][Accompanist_Source] library to load the contact's avatar from a remote image URL. The library also provides support for `Picasso` as well, and support for Glide is a known [feature request][Accompanist_Glide_FeatureRequest]. <a href="#ref4" title="Jump to footnote 4.">&#8617;</a>

  [ContactListProject_SourceCode]: <https://github.com/alexjlockwood/adp-contact-list-compose>

  [Ambient_Docs]: <https://developer.android.com/reference/kotlin/androidx/compose/runtime/Ambient>

  [Surface_AmbientContentColor_Source]: <https://cs.android.com/androidx/platform/frameworks/support/+/androidx-master-dev:compose/material/material/src/commonMain/kotlin/androidx/compose/material/Surface.kt;l=113;drc=0264f5abe8b93d4aec391ac9e49cc5b5e2217a63>

  [Text_AmbientContentColor_Source]: <https://cs.android.com/androidx/platform/frameworks/support/+/androidx-master-dev:compose/foundation/foundation/src/commonMain/kotlin/androidx/compose/foundation/Text.kt;l=212;drc=cd46cc34028f844feeb03578bc665db4c7394c14>

  [Text_AmbientTextStyle_Source]: <https://cs.android.com/androidx/platform/frameworks/support/+/androidx-master-dev:compose/foundation/foundation/src/commonMain/kotlin/androidx/compose/foundation/Text.kt;l=210;drc=cd46cc34028f844feeb03578bc665db4c7394c14>
  
  [MaterialDesignSpec_Lists]: https://material.io/components/lists

  [TopAppBar_SlotAPI_Source]: <https://cs.android.com/androidx/platform/frameworks/support/+/androidx-master-dev:compose/material/material/src/commonMain/kotlin/androidx/compose/material/AppBar.kt;l=72;drc=e243833b9705e35184bb8aec84cb9ef49f66eb76>

  [ListItem_Source]: https://cs.android.com/androidx/platform/frameworks/support/+/androidx-master-dev:compose/material/material/src/commonMain/kotlin/androidx/compose/material/ListItem.kt;l=66;drc=528739f5a4f9e6b397aa206de080953dd5e15a90

  [Accompanist_Source]: <https://github.com/chrisbanes/accompanist>

  [Accompanist_Glide_FeatureRequest]: <https://github.com/chrisbanes/accompanist/issues/112>