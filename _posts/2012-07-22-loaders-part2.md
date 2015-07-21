---
layout: post
title: 'Understanding the LoaderManager (part 2)'
date: 2012-07-22
permalink: /2012/07/understanding-loadermanager.html
related: ['/2012/06/content-resolvers-and-content-providers.html',
          '/2014/12/activity-fragment-transitions-in-android-lollipop-part1.html',
          '/2013/04/retaining-objects-across-config-changes.html']
---
This post introduces the `LoaderManager` class. This is the second of a series of posts I will
be writing on Loaders and the LoaderManager:

  + **Part 1:** <a href="/2012/07/loaders-and-loadermanager-background.html">Life Before Loaders</a>
  + **Part 2:** <a href="/2012/07/understanding-loadermanager.html">Understanding the LoaderManager</a>
  + **Part 3:** <a href="/2012/08/implementing-loaders.html">Implementing Loaders</a>
  + **Part 4:** <a href="/2012/09/tutorial-loader-loadermanager.html">Tutorial: AppListLoader</a>

**Note:** Understanding the `LoaderManager` requires some general knowledge about how `Loader`s work. Their implementation will be covered extensively in my
<a href="/2012/08/implementing-loaders.html">next post</a>. For now, you should think
of Loaders as simple, self-contained objects that (1) load data on a separate thread, and (2) monitor the underlying data
source for updates, re-querying when changes are detected. This is more than enough to get you through the contents
of this post. All Loaders are assumed to be 100% correctly implemented in this post.

### What is the `LoaderManager`?

Simply stated, the `LoaderManager` is responsible for managing one or more `Loader`s
associated with an Activity or Fragment. Each Activity and each Fragment has exactly one LoaderManager
instance that is in charge of starting, stopping, retaining, restarting, and destroying its Loaders.
These events are sometimes initiated directly by the client, by calling `initLoader()`,
`restartLoader()`, or `destroyLoader()`. Just as often, however, these events
are triggered by major Activity/Fragment lifecycle events. For example, when an Activity is destroyed,
the Activity instructs its LoaderManager to destroy and close its Loaders (as well as any resources
associated with them, such as a Cursor).

<!--more-->

The LoaderManager does not know how data is loaded, nor does it need to. Rather, the LoaderManager
instructs its Loaders when to start/stop/reset their load, retaining their state across configuration
changes and providing a simple interface for delivering results back to the client. In this way, the
LoaderManager is a much more intelligent and generic implementation of the now-deprecated
`startManagingCursor` method. While both manage data across the twists and turns of the
Activity lifecycle, the LoaderManager is far superior for several reasons:

  + <strong>`startManagingCursor` manages Cursors, whereas the LoaderManager manages `Loader<D>` objects.</strong>
    The advantage here is that `Loader<D>` is generic, where `D` is the container object that holds the
    loaded data. In other words, the data source doesn't have to be a Cursor; it could be a `List`, a
    `JSONArray`... anything. The LoaderManager is independent of the container object that holds the data and is
    much more flexible as a result.

  + **Calling `startManagingCursor` will make the Activity call `requery()` on the managed cursor.**
    As mentioned in the previous post, `requery()` is a potentially expensive operation that is performed on the
    main UI thread. Subclasses of the `Loader<D>` class, on the other hand, are expected to load their data
    asynchronously, so using the LoaderManager will never block the UI thread.

  + **`startManagingCursor` does not retain the Cursor's state across configuration changes.**
    Instead, each time the Activity is destroyed due to a configuration change (a simple orientation change, for example),
    the Cursor is destroyed and must be requeried. The LoaderManager is much more intelligent in that it retains its Loaders'
    state across configuration changes, and thus doesn't need to requery its data.

  + **The LoaderManager provides seamless monitoring of data!** Whenever the Loader's data source is modified, the LoaderManager
    will receive a new asynchronous load from the corresponding Loader, and will return the updated data to the client. (Note: the
    LoaderManager will only be notified of these changes if the Loader is implemented correctly. We will discuss how to implement
    custom Loaders in <a href="/2012/08/implementing-loaders.html">part 3</a> of this series of posts).

If you feel overwhelmed by the details above, I wouldn't stress over it. The most important thing to take away from this is that the
_LoaderManager makes your life easy._ It initializes, manages, and destroys Loaders for you, reducing both coding complexity and
subtle lifecycle-related bugs in your Activitys and Fragments. Further, interacting with the LoaderManager involves implementing three
simple callback methods. We discuss the `LoaderManager.LoaderCallbacks<D>` in the next section.

### Implementing the `LoaderManager.LoaderCallbacks<D>` Interface

The `LoaderManager.LoaderCallbacks<D>` interface is a simple contract that the `LoaderManager`
uses to report data back to the client. Each Loader gets its own callback object that the LoaderManager will interact with.
This callback object fills in the gaps of the abstract `LoaderManager` implementation, telling it how to
instantiate the Loader (`onCreateLoader`) and providing instructions when its load is complete/reset
(`onLoadFinished` and `onLoadReset`, respectively). Most often you will implement the callbacks
as part of the component itself, by having your Activity or Fragment implement the `LoaderManager.LoaderCallbacks<D>`
interface:

```java
public class SampleActivity extends Activity implements LoaderManager.LoaderCallbacks<D> {

  public Loader<D> onCreateLoader(int id, Bundle args) { ... }

  public void onLoadFinished(Loader<D> loader, D data) { ... }

  public void onLoaderReset(Loader<D> loader) { ... }

  /* ... */
}
```

Once instantiated, the client passes the callbacks object ("`this`", in this case) as the
third argument to the LoaderManager's `initLoader` method, and will be bound to the Loader
as soon as it is created.

Overall, implementing the <a href="http://developer.android.com/reference/android/app/LoaderManager.LoaderCallbacks.html">callbacks</a>
is straightforward. Each callback method serves a specific purpose that makes interacting with the LoaderManager easy:

  + `onCreateLoader` is a factory method that simply returns a new `Loader`. The LoaderManager will
    call this method when it first creates the Loader.

  + `onLoadFinished` is called automatically when a Loader has finished its load. This method is typically
    where the client will update the application's UI with the loaded data. The client may (and should) assume that
    new data will be returned to this method each time new data is made available. Remember that it is the Loader's
    job to monitor the data source and to perform the actual asynchronous loads. The LoaderManager will receive these
    loads once they have completed, and then pass the result to the callback object's `onLoadFinished` method
    for the client (i.e. the Activity/Fragment) to use.

  + Lastly, `onLoadReset` is called when the Loader's data is about to be reset. This method gives you the
    opportunity to remove any references to old data that may no longer be available.

In the next section, we will discuss a commonly asked question from beginning Android developers: how to
transition from outdated managed Cursors to the much more powerful LoaderManager.

### Transitioning from Managed Cursors to the `LoaderManager`

The code below is similar in behavior to the sample in my <a href="/2012/07/loaders-and-loadermanager-background.html">previous post</a>.
The difference, of course, is that it has been updated to use the LoaderManager. The `CursorLoader` ensures that all
queries are performed asynchronously, thus guaranteeing that we won't block the UI thread. Further, the LoaderManager manages
the `CursorLoader` across the Activity lifecycle, retaining its data on configuration changes and directing each
new data load to the callback's `onLoadFinished` method, where the Activity is finally free to make use of the
queried Cursor.

<div class="scrollable">
{% highlight java linenos=table %}
public class SampleListActivity extends ListActivity implements
    LoaderManager.LoaderCallbacks<Cursor> {

  private static final String[] PROJECTION = new String[] { "_id", "text_column" };

  // The loader's unique id. Loader ids are specific to the Activity or
  // Fragment in which they reside.
  private static final int LOADER_ID = 1;

  // The callbacks through which we will interact with the LoaderManager.
  private LoaderManager.LoaderCallbacks<Cursor> mCallbacks;

  // The adapter that binds our data to the ListView
  private SimpleCursorAdapter mAdapter;

  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    String[] dataColumns = { "text_column" };
    int[] viewIDs = { R.id.text_view };

    // Initialize the adapter. Note that we pass a 'null' Cursor as the
    // third argument. We will pass the adapter a Cursor only when the
    // data has finished loading for the first time (i.e. when the
    // LoaderManager delivers the data to onLoadFinished). Also note
    // that we have passed the '0' flag as the last argument. This
    // prevents the adapter from registering a ContentObserver for the
    // Cursor (the CursorLoader will do this for us!).
    mAdapter = new SimpleCursorAdapter(this, R.layout.list_item,
        null, dataColumns, viewIDs, 0);

    // Associate the (now empty) adapter with the ListView.
    setListAdapter(mAdapter);

    // The Activity (which implements the LoaderCallbacks<Cursor>
    // interface) is the callbacks object through which we will interact
    // with the LoaderManager. The LoaderManager uses this object to
    // instantiate the Loader and to notify the client when data is made
    // available/unavailable.
    mCallbacks = this;

    // Initialize the Loader with id '1' and callbacks 'mCallbacks'.
    // If the loader doesn't already exist, one is created. Otherwise,
    // the already created Loader is reused. In either case, the
    // LoaderManager will manage the Loader across the Activity/Fragment
    // lifecycle, will receive any new loads once they have completed,
    // and will report this new data back to the 'mCallbacks' object.
    LoaderManager lm = getLoaderManager();
    lm.initLoader(LOADER_ID, null, mCallbacks);
  }

  @Override
  public Loader<Cursor> onCreateLoader(int id, Bundle args) {
    // Create a new CursorLoader with the following query parameters.
    return new CursorLoader(SampleListActivity.this, CONTENT_URI,
        PROJECTION, null, null, null);
  }

  @Override
  public void onLoadFinished(Loader<Cursor> loader, Cursor cursor) {
    // A switch-case is useful when dealing with multiple Loaders/IDs
    switch (loader.getId()) {
      case LOADER_ID:
        // The asynchronous load is complete and the data
        // is now available for use. Only now can we associate
        // the queried Cursor with the SimpleCursorAdapter.
        mAdapter.swapCursor(cursor);
        break;
    }
    // The listview now displays the queried data.
  }

  @Override
  public void onLoaderReset(Loader<Cursor> loader) {
    // For whatever reason, the Loader's data is now unavailable.
    // Remove any references to the old data by replacing it with
    // a null Cursor.
    mAdapter.swapCursor(null);
  }
}
{% endhighlight %}
</div>

### Conclusion

As its name suggests, the `LoaderManager` is responsible for managing `Loader`s across the
Activity/Fragment lifecycle. The LoaderManager is simple and its implementation usually requires very little code.
The tricky part is implementing the Loaders, the topic of the next post:
<a href="/2012/08/implementing-loaders.html">Implementing Loaders (part 3)</a>.

Leave a comment if you have any questions, or just to let me know if this post helped or not!
Don't forget to +1 this blog in the top right corner too! :)
