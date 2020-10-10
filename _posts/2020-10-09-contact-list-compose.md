---
layout: post
title: "Contact List Compose"
date: 2020-10-09
permalink: /2020/10/contact-list-compose.html
related: ['/2013/08/fragment-transaction-commit-state-loss.html',
    '/2016/11/introduction-to-icon-animation-techniques.html',
    '/2016/08/contextcompat-getcolor-getdrawable.html']
---

<!--morestart-->

Introduction

<!--more-->

### Creating the `ContactListItem`

```kotlin
/**
 * A simple ListItem that displays text, detail text, a start icon,
 * and an optional end icon.
 */
@Composable
fun ContactListItem(
    text: @Composable (() -> Unit),
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
                    // If not explicitly set by the caller, apply a subtitle1 text style
                    // w/ high emphasis to the text.
                    text()
                }
            }

            if (detailText != null) {
                ProvideEmphasis(EmphasisAmbient.current.medium) {
                    ProvideTextStyle(MaterialTheme.typography.body2) {
                        // If not explicitly set by the caller, apply a body2 text style
                        // w/ medium emphasis to the detail text.
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

### Creating the `ContactCard`

#### Creating the content

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

@Composable
private fun StartImage(imageUrl: String, modifier: Modifier = Modifier) {
    CoilImage(
        data = imageUrl,
        modifier = modifier.preferredSize(48.dp).clip(CircleShape),
        fadeIn = true,
        contentScale = ContentScale.Crop,
    )
}

@Composable
private fun StartIcon(asset: VectorAsset, modifier: Modifier = Modifier) {
    Icon(asset = asset, modifier = modifier.preferredSize(48.dp))
}

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

#### Putting it all together

```kotlin
@Composable
fun ContactCard(
    contact: Contact,
    modifier: Modifier = Modifier,
    isExpanded: Boolean = false,
) {
    Card(modifier = modifier, elevation = 2.dp) {
        Column {
            HeaderImage(imageUrl = contact.imageUrl)
            ContactListItem(
                text = { SingleLineText(text = contact.name) },
                detailText = { SingleLineText(text = contact.description) },
                startIcon = { StartImage(imageUrl = contact.imageUrl) },
                // TODO: add a chevron as the list item's end icon
            )
            // TODO: animate expanded state changes
            if (isExpanded) {
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

### Creating the `ContactList`

```kotlin
/**
 * Displays a recyclable list of expandable [ContactCard]s.
 */
@Composable
fun ContactList(contacts: List<Contact>, modifier: Modifier = Modifier) {
    val expandedContactsMap = remember { mutableStateMapOf<String, Boolean>() }
    LazyColumnForIndexed(
        items = contacts,
        modifier = modifier,
        contentPadding = PaddingValues(16.dp),
    ) { index, contact ->
        val isContactExpanded = expandedContactsMap[contact.id] ?: false
        ContactCard(
            contact = contact,
            modifier = Modifier
                .fillMaxWidth()
                .clickable(onClick = { expandedContactsMap[contact.id] = !isContactExpanded }),
            isExpanded = isContactExpanded,
        )
        if (index < contacts.size - 1) {
            Spacer(modifier = Modifier.height(16.dp))
        }
    }
}
```

### Creating the `ContactListScreen`

```kotlin
/**
 * The home screen of the application that displays a [TopAppBar] and the [ContactList].
 */
@Composable
fun ContactListScreen(contacts: List<Contact>, modifier: Modifier = Modifier) {
    Scaffold(
        modifier = modifier,
        topBar = {
            TopAppBar(
                title = { Text(stringResource(R.string.app_name)) },
                backgroundColor = MaterialTheme.colors.background,
            )
        },
    ) {
        ContactList(contacts = contacts)
    }
}
```

### TODO

* Update title, permalink, date, and related links