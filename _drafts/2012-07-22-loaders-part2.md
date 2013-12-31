---
layout: post
title: Understanding the LoaderManager (part 2)
date: 2012-07-22
permalink: /2012/07/understanding-loadermanager.html
comments: true
---

<p>This post introduces the <code>LoaderManager</code> class. This is the second of a series of posts I will be writing on Loaders and the LoaderManager:</p>

<ul>
<li><b>Part 1:</b> <a href="http://www.androiddesignpatterns.com/2012/07/loaders-and-loadermanager-background.html">Life Before Loaders</a></li>
<li><b>Part 2:</b> <a href="http://www.androiddesignpatterns.com/2012/07/understanding-loadermanager.html">Understanding the LoaderManager</a></li>
<li><b>Part 3:</b> <a href="http://www.androiddesignpatterns.com/2012/08/implementing-loaders.html">Implementing Loaders</a></li>
<li><b>Part 4:</b> <a href="http://www.androiddesignpatterns.com/2012/09/tutorial-loader-loadermanager.html">Tutorial: AppListLoader</a></li>
</ul>

<p><b>Note:</b> Understanding the <code>LoaderManager</code> requires some general knowledge about how <code>Loader</code>s are work. Their implementation will be covered extensively in my <a href="http://www.androiddesignpatterns.com/2012/08/implementing-loaders.html">next post</a>. For now, you should think of Loaders as simple, self-contained objects that (1) load data on a separate thread, and (2) monitor the underlying data source for updates, re-querying when changes are detected. This is more than enough to get you through the contents of this post. All Loaders are assumed to be 100% correctly implemented in this post.</p>

<h4>What is the <code>LoaderManager</code>?</h4>

<p>Simply stated, the <code>LoaderManager</code> is responsible for managing one or more <code>Loader</code>s associated with an Activity or Fragment. Each Activity and each Fragment has exactly one LoaderManager instance that is in charge of starting, stopping, retaining, restarting, and destroying its Loaders. These events are sometimes initiated directly by the client, by calling <code>initLoader()</code>, <code>restartLoader()</code>, or <code>destroyLoader()</code>. Just as often, however, these events are triggered by major Activity/Fragment lifecycle events. For example, when an Activity is destroyed, the Activity instructs its LoaderManager to destroy and close its Loaders (as well as any resources associated with them, such as a Cursor).</p>

<p>The LoaderManager does not know how data is loaded, nor does it need to. Rather, the LoaderManager instructs its Loaders when to start/stop/reset their load, retaining their state across configuration changes and providing a simple interface for delivering results back to the client. In this way, the LoaderManager is a much more intelligent and generic implementation of the now-deprecated <code>startManagingCursor</code> method. While both manage data across the twists and turns of the Activity lifecycle, the LoaderManager is far superior for several reasons:</p>

<!--more-->

<ul>
<li><p><b><code>startManagingCursor</code> manages Cursors, whereas the LoaderManager manages <code>Loader&lt;D&gt;</code> objects.</b> The advantage here is that <code>Loader&lt;D&gt;</code> is generic, where <code>D</code> is the container object that holds the loaded data. In other words, the data source doesn't have to be a Cursor; it could be a <code>List</code>, a <code>JSONArray</code>... anything. The LoaderManager is independent of the container object that holds the data and is much more flexible as a result.</p></li>

<li><p><b>Calling <code>startManagingCursor</code> will make the Activity call <code>requery()</code> on the managed cursor.</b> As mentioned in the previous post, <code>requery()</code> is a potentially expensive operation that is performed on the main UI thread. Subclasses of the <code>Loader&lt;D&gt;</code> class, on the other hand, are expected to load their data asynchronously, so using the LoaderManager will never block the UI thread.</p></li>

<li><p><b><code>startManagingCursor</code> does not retain the Cursor's state across configuration changes.</b> Instead, each time the Activity is destroyed due to a configuration change (a simple orientation change, for example), the Cursor is destroyed and must be requeried. The LoaderManager is much more intelligent in that it retains its Loaders' state across configuration changes, and thus doesn't need to requery its data.</p></li>

<li><p><b>The LoaderManager provides seamless monitoring of data!</b> Whenever the Loader's data source is modified, the LoaderManager will receive a new asynchronous load from the corresponding Loader, and will return the updated data to the client. (Note: the LoaderManager will only be notified of these changes if the Loader is implemented correctly. We will discuss how to implement custom Loaders in <a href="http://www.androiddesignpatterns.com/2012/08/implementing-loaders.html">part 3</a> of this series of posts).</p></li>
</ul>

<p>If you feel overwhelmed by the details above, I wouldn't stress over it. The most important thing to take away from this is that the <i>LoaderManager makes your life easy.</i> It initializes, manages, and destroys Loaders for you, reducing both coding complexity and subtle lifecycle-related bugs in your Activitys and Fragments. Further, interacting with the LoaderManager involves implementing three simple callback methods. We discuss the <code>LoaderManager.LoaderCallbacks&lt;D&gt;</code> in the next section.</p>

<h4>Implementing the <code>LoaderManager.LoaderCallbacks&lt;D&gt;</code> Interface</h4>

<p>The <code>LoaderManager.LoaderCallbacks&lt;D&gt;</code> interface is a simple contract that the <code>LoaderManager</code> uses to report data back to the client. Each Loader gets its own callback object that the LoaderManager will interact with. This callback object fills in the gaps of the abstract <code>LoaderManager</code> implementation, telling it how to instantiate the Loader (<code>onCreateLoader</code>) and providing instructions when its load is complete/reset (<code>onLoadFinished</code> and <code>onLoadReset</code>, respectively). Most often you will implement the callbacks as part of the component itself, by having your Activity or Fragment implement the <code>LoaderManager.LoaderCallbacks&lt;D&gt;</code> interface:</p>

<p>
<pre class="brush:java">public class SampleActivity extends Activity implements LoaderManager.LoaderCallbacks&lt;D&gt; {

  public Loader&lt;D&gt; onCreateLoader(int id, Bundle args) { ... }

  public void onLoadFinished(Loader&lt;D&gt; loader, D data) { ... }

  public void onLoaderReset(Loader&lt;D&gt; loader) { ... }

  /* ... */
}
</pre>
</p>

<p>Once instantiated, the client passes the callbacks object ("<code>this</code>", in this case) as the third argument to the LoaderManager's <code>initLoader</code> method, and will be bound to the Loader as soon as it is created.</p>

<p>Overall, implementing the <a href="http://developer.android.com/reference/android/app/LoaderManager.LoaderCallbacks.html">callbacks</a> is straightforward. Each callback method serves a specific purpose that makes interacting with the LoaderManager easy:</p>

<ul>

<li><p><b><code>onCreateLoader</code></b> simply returns a new <code>Loader</code>. The LoaderManager will call this method when it first creates the Loader.</p></li>

<li><p><b><code>onLoadFinished</code></b> is called automatically when a Loader has finished its load. This method is typically where the client will update the application's UI with the loaded data. The client may (and should) assume that new data will be returned to this method each time new data is made available. Remember that it is the Loader's job to monitor the data source and to perform the actual asynchronous loads. The LoaderManager will receive these loads once they have completed, and then pass the result to the callback object's <code>onLoadFinished</code> method for the client (i.e. the Activity/Fragment) to use.</p></li>

<li><p>Lastly, <b><code>onLoadReset</code></b> is called when the Loader's data is about to be reset. This method gives you the opportunity to remove any references to old data that may no longer be available.</p></li>

</ul>

<p>In the next section, we will discuss a commonly asked question from beginning Android developers: how to transition from outdated managed Cursors to the much more powerful LoaderManager.</p>

<h4>Transitioning from Managed Cursors to the <code>LoaderManager</code></h4>

<p>The code below is similar in behavior to the sample in my <a href="http://www.androiddesignpatterns.com/2012/07/loaders-and-loadermanager-background.html">previous post</a>. The difference, of course, is that it has been updated to use the LoaderManager. The <code>CursorLoader</code> ensures that all queries are performed asynchronously, thus guaranteeing that we won't block the UI thread. Further, the LoaderManager manages the <code>CursorLoader</code> across the Activity lifecycle, retaining its data on configuration changes and directing each new data load to the callback's <code>onLoadFinished</code> method, where the Activity is finally free to make use of the queried Cursor.</p>

<p>
<pre class="brush:java">public class SampleListActivity extends ListActivity implements
    LoaderManager.LoaderCallbacks&lt;Cursor&gt; {

  private static final String[] PROJECTION = new String[] { "_id", "text_column" };

  // The loader's unique id. Loader ids are specific to the Activity or
  // Fragment in which they reside.
  private static final int LOADER_ID = 1;

  // The callbacks through which we will interact with the LoaderManager.
  private LoaderManager.LoaderCallbacks&lt;Cursor&gt; mCallbacks;

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

    // The Activity (which implements the LoaderCallbacks&lt;Cursor&gt;
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
  public Loader&lt;Cursor&gt; onCreateLoader(int id, Bundle args) {
    // Create a new CursorLoader with the following query parameters.
    return new CursorLoader(SampleListActivity.this, CONTENT_URI,
        PROJECTION, null, null, null);
  }

  @Override
  public void onLoadFinished(Loader&lt;Cursor&gt; loader, Cursor cursor) {
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
  public void onLoaderReset(Loader&lt;Cursor&gt; loader) {
    // For whatever reason, the Loader's data is now unavailable.
    // Remove any references to the old data by replacing it with
    // a null Cursor.
    mAdapter.swapCursor(null);
  }
}
</pre>
</p>

<h4>Conclusion</h4>

<p>As its name suggests, the <code>LoaderManager</code> is responsible for managing <code>Loader</code>s across the Activity/Fragment lifecycle. The LoaderManager is simple and its implementation usually requires very little code. The tricky part is implementing the Loaders, the topic of the next post: <a href="http://www.androiddesignpatterns.com/2012/08/implementing-loaders.html">Implementing Loaders (part 3)</a>.</p>

<p>Leave a comment if you have any questions... or just to let me know if this post helped or not! Don't forget to +1 this blog in the top right corner too! :)</p>