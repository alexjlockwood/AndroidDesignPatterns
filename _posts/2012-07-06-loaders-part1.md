---
layout: post
title: 'Life Before Loaders (part 1)'
date: 2012-07-06
permalink: /2012/07/loaders-and-loadermanager-background.html
comments: true
---

This post gives a brief introduction to `Loader`s and the `LoaderManager`. The first
section describes how data was loaded prior to the release of Android 3.0, pointing out out some of the flaws
of the pre-Honeycomb APIs. The second section defines the purpose of each class and summarizes their powerful
ability in asynchronously loading data.

This is the first of a series of posts I will be writing on Loaders and the LoaderManager:

  + **Part 1:** <a href="/2012/07/loaders-and-loadermanager-background.html">Life Before Loaders</a>
  + **Part 2:** <a href="/2012/07/understanding-loadermanager.html">Understanding the LoaderManager</a>
  + **Part 3:** <a href="/2012/08/implementing-loaders.html">Implementing Loaders</a>
  + **Part 4:** <a href="/2012/09/tutorial-loader-loadermanager.html">Tutorial: AppListLoader</a>

If you know nothing about `Loader`s and the `LoaderManager`, I strongly recommend you read the
<a href="http://developer.android.com/guide/components/loaders.html">documentation</a> before continuing forward.

### The Not-So-Distant Past

Before Android 3.0, many Android applications lacked in responsiveness. UI interactions glitched, transitions
between activities lagged, and ANR (Application Not Responding) dialogs rendered apps totally useless. This
lack of responsiveness stemmed mostly from the fact that developers were performing queries on the UI
thread&mdash;a very poor choice for lengthy operations like loading data.

While the <a href="http://developer.android.com/guide/practices/responsiveness.html">documentation</a> has always
stressed the importance of instant feedback, the pre-Honeycomb APIs simply did not encourage this behavior. Before
Loaders, cursors were primarily managed and queried for with two (now deprecated) `Activity` methods:

<!--more-->

  + `public void startManagingCursor(Cursor)`

    Tells the activity to take care of managing the cursor's lifecycle based on the activity's lifecycle. The
    cursor will automatically be deactivated (`deactivate()`) when the activity is stopped, and will
    automatically be closed (`close()`) when the activity is destroyed. When the activity is stopped
    and then later restarted, the Cursor is re-queried (`requery()`) for the most up-to-date data.

  + `public Cursor managedQuery(Uri, String, String, String, String)`

    A wrapper around the `ContentResolver`'s `query()` method. In addition to performing the
    query, it begins management of the cursor (that is, `startManagingCursor(cursor)` is called before
    it is returned).

While convenient, these methods were deeply flawed in that they performed queries on the UI thread. What's more,
the "managed cursors" did not retain their data across `Activity` configuration changes. The need to
`requery()` the cursor's data in these situations was unnecessary, inefficient, and made orientation
changes clunky and sluggish as a result.

### The Problem with "Managed `Cursor`s"

Let's illustrate the problem with "managed cursors" through a simple code sample. Given below is a
`ListActivity` that loads data using the pre-Honeycomb APIs. The activity makes a query
to the `ContentProvider` and begins management of the returned cursor. The results are then bound to
a `SimpleCursorAdapter`, and are displayed on the screen in a `ListView`. The code has
been condensed for simplicity.

<div class="scrollable">
{% highlight java linenos=table %}
public class SampleListActivity extends ListActivity {

  private static final String[] PROJECTION = new String[] {"_id", "text_column"};

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    // Performs a "managed query" to the ContentProvider. The Activity 
    // will handle closing and requerying the cursor.
    //
    // WARNING!! This query (and any subsequent re-queries) will be
    // performed on the UI Thread!!
    Cursor cursor = managedQuery(
        CONTENT_URI,  // The Uri constant in your ContentProvider class
        PROJECTION,   // The columns to return for each data row
        null,         // No where clause
        null,         // No where clause
        null);        // No sort order

    String[] dataColumns = { "text_column" };
    int[] viewIDs = { R.id.text_view };
 
    // Create the backing adapter for the ListView.
    //
    // WARNING!! While not readily obvious, using this constructor will 
    // tell the CursorAdapter to register a ContentObserver that will
    // monitor the underlying data source. As part of the monitoring
    // process, the ContentObserver will call requery() on the cursor 
    // each time the data is updated. Since Cursor#requery() is performed 
    // on the UI thread, this constructor should be avoided at all costs!
    SimpleCursorAdapter adapter = new SimpleCursorAdapter(
        this,                // The Activity context
        R.layout.list_item,  // Points to the XML for a list item
        cursor,              // Cursor that contains the data to display
        dataColumns,         // Bind the data in column "text_column"...
        viewIDs);              // ...to the TextView with id "R.id.text_view"

    // Sets the ListView's adapter to be the cursor adapter that was 
    // just created.
    setListAdapter(adapter);
  }
}
{% endhighlight %}
</div>

There are three problems with the code above. If you have understood this post so far, the first two
shouldn't be difficult to spot:

  1. `managedQuery` performs a query on the main UI thread. This leads to unresponsive apps and
     should no longer be used.

  2. As seen in the `Activity.java`
     <a href="http://grepcode.com/file/repository.grepcode.com/java/ext/com.google.android/android/1.5_r4/android/app/Activity.java#Activity.managedQuery%28android.net.Uri%2Cjava.lang.String%5B%5D%2Cjava.lang.String%2Cjava.lang.String%29">source code</a>,
     the call to `managedQuery` begins management of the returned cursor with a call to
     `startManagingCursor(cursor)`. Having the activity manage the cursor seems convenient at first, as we
     no longer need to worry about deactivating/closing the cursor ourselves. However, this signals the activity to call
     `requery()` on the cursor
     <a href="http://grepcode.com/file/repository.grepcode.com/java/ext/com.google.android/android/1.5_r4/android/app/Activity.java#3503">each time the activity returns from a stopped state</a>,
     and therefore puts the UI thread at risk. This cost significantly outweighs the convenience of having the activity deactivate/close the cursor for us.

  3. The `SimpleCursorAdapter` constructor (line 33) is deprecated and should not be used. The
     problem with this constructor is that it will have the `SimpleCursorAdapter` auto-requery
     its data when changes are made. More specifically, the CursorAdapter will register a ContentObserver
     that monitors the underlying data source for changes, calling `requery()` on its bound
     cursor each time the data is modified. The
     <a href="http://developer.android.com/reference/android/widget/SimpleCursorAdapter.html#SimpleCursorAdapter(android.content.Context, int, android.database.Cursor, java.lang.String[], int[], int)">standard constructor</a>
     should be used instead (if you intend on loading the adapter's data with a `CursorLoader`,
     make sure you pass `0` as the last argument). Don't worry if you couldn't spot this one...
     it's a very subtle bug.

With the first Android tablet about to be released, something had to be done to encourage UI-friendly development.
The larger, 7-10" Honeycomb tablets called for more complicated, interactive, multi-paned layouts. Further, the
introduction of the `Fragment` meant that applications were about to become more dynamic and event-driven.
A simple, single-threaded approach to loading data could no longer be encouraged. Thus, the `Loader` and
the `LoaderManager` were born.

### Android 3.0, Loaders, and the LoaderManager

Prior to Honeycomb, it was difficult to manage cursors, synchronize correctly with the UI thread, and ensure
all queries occured on a background thread. Android 3.0 introduced the `Loader` and `LoaderManager` classes
to help simplify the process. Both classes are available for use in the Android Support Library, which
supports all Android platforms back to Android 1.6.

The new `Loader` API is a huge step forward, and significantly improves the user experience. `Loader`s ensure
that all cursor operations are done asynchronously, thus eliminating the possibility of blocking the UI thread.
Further, when managed by the `LoaderManager`, `Loader`s retain their existing cursor data across the activity
instance (for example, when it is restarted due to a configuration change), thus saving the cursor from
unnecessary, potentially expensive re-queries. As an added bonus, `Loader`s are intelligent enough to monitor
the underlying data source for updates, re-querying automatically when the data is changed.

### Conclusion

Since the introduction of `Loader`s in Honeycomb and Compatibility Library, Android applications have
changed for the better. Making use of the now deprecated `startManagingCursor` and `managedQuery`
methods are extremely discouraged; not only do they slow down your app, but they can potentially bring it to a
screeching halt. `Loader`s, on the other hand, significantly speed up the user experience by offloading
the work to a separate background thread.

In the next post (titled <a href="/2012/07/understanding-loadermanager.html">Understanding the LoaderManager</a>),
we will go more in-depth on how to fix these problems by completing the transition from "managed cursors" to
making use of `Loader`s and the `LoaderManager`.

Don't forget to +1 this blog in the top right corner if you found this helpful!