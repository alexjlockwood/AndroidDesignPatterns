---
layout: post
title: 'Implementing Loaders (part 3)'
date: 2012-08-21
permalink: /2012/08/implementing-loaders.html
related: ['/2013/04/retaining-objects-across-config-changes.html',
          '/2014/01/thread-scheduling-in-android.html',
          '/2013/07/binders-window-tokens.html']
updated: '2014-01-16'
---
This post introduces the `Loader<D>` class as well as custom Loader implementations.
This is the third of a series of posts I will be writing on Loaders and the LoaderManager:

  + **Part 1:** <a href="/2012/07/loaders-and-loadermanager-background.html">Life Before Loaders</a>
  + **Part 2:** <a href="/2012/07/understanding-loadermanager.html">Understanding the LoaderManager</a>
  + **Part 3:** <a href="/2012/08/implementing-loaders.html">Implementing Loaders</a>
  + **Part 4:** <a href="/2012/09/tutorial-loader-loadermanager.html">Tutorial: AppListLoader</a>

First things first, if you haven’t read my previous two posts, I suggest you do so before continuing further.
Here is a very brief summary of what this blog has covered so far.
<a href="/2012/07/loaders-and-loadermanager-background.html">Life Before Loaders (part 1)</a> described the
flaws of the pre-Honeycomb 3.0 API and its tendency to perform lengthy queries on the main UI thread.
These UI-unfriendly APIs resulted in unresponsive applications and were the primary motivation for introducing
the Loader and the LoaderManager in Android 3.0.
<a href="/2012/07/understanding-loadermanager.html">Understanding the LoaderManager (part 2)</a> introduced
the LoaderManager class and its role in delivering asynchronously loaded data to the client. The LoaderManager
manages its Loaders across the Activity/Fragment lifecycle and can retain loaded data across configuration changes.

<!--more-->

### Loader Basics

Loaders are responsible for performing queries on a separate thread, monitoring the data source for changes,
and delivering new results to a registered listener (usually the LoaderManager) when changes are detected.
These characteristics make Loaders a powerful addition to the Android SDK for several reasons:

  1. <b>They encapsulate the actual loading of data.</b> The Activity/Fragment no longer needs to know how to load data.
     Instead, the Activity/Fragment delegates the task to the Loader, which carries out the request behind the scenes
     and has its results delivered back to the Activity/Fragment.

  2. <b>They abstract out the idea of threads from the client.</b> The Activity/Fragment does not need to worry
     about offloading queries to a separate thread, as the Loader will do this automatically. This reduces
     code complexity and eliminates potential thread-related bugs.

  3. <b>They are entirely <i>event-driven</i>.</b> Loaders monitor the underlying data source and automatically
     perform new loads for up-to-date results when changes are detected. This makes working with Loaders
     easy, as the client can simply trust that the Loader will auto-update its data on its own.
     All the Activity/Fragment has to do is initialize the Loader and respond to any results that might
     be delivered. Everything in between is done by the Loader.

Loaders are a somewhat advanced topic and may take some time getting used to. We begin by analyzing
its four defining characteristics in the next section.

### What Makes Up a Loader?

There are four characteristics which ultimately determine a Loader’s behavior:

  1. <b>A task to perform the asynchronous load.</b> To ensure that loads are done on a separate thread,
     subclasses should extend `AsyncTaskLoader<D>` as opposed to the `Loader<D>` class.
     `AsyncTaskLoader<D>` is an abstract Loader which provides an `AsyncTask` to do its work.
     When subclassed, implementing the asynchronous task is as simple as implementing the abstract
     `loadInBackground()` method, which is called on a worker thread to perform the data load.

  2. <b>A registered listener to receive the Loader's results when it completes a load.</b><sup><a href="#footnote1" id="ref1">1</a></sup>
     For each of its Loaders, the LoaderManager registers an `OnLoadCompleteListener<D>` which will forward
     the Loader’s delivered results to the client with a call to `onLoadFinished(Loader<D> loader, D result)`.
     Loaders should deliver results to these registered listeners with a call to `Loader#deliverResult(D result)`.

  3. <b>One of three<sup><a href="#footnote2" id="ref2">2</a></sup> distinct states.</b> Any given Loader will either be in a
     _started_, _stopped_, or _reset_ state:
      - Loaders in a _started state_ execute loads and may deliver their results to the listener at any
        time. Started Loaders should monitor for changes and perform new loads when changes are detected.
        Once started, the Loader will remain in a started state until it is either stopped or reset.
        This is the only state in which `onLoadFinished` will ever be called.
      - Loaders in a _stopped state_ continue to monitor for changes but should **not**
        deliver results to the client. From a stopped state, the Loader may either be started or reset.
      - Loaders in a _reset state_ should **not** execute new loads, should **not** deliver new
        results, and should **not** monitor for changes. When a loader enters a reset state, it should
        invalidate and free any data associated with it for garbage collection (likewise, the client should
        make sure they remove any references to this data, since it will no longer be available). More
        often than not, reset Loaders will never be called again; however, in some cases they may be started,
        so they should be able to start running properly again if necessary.

  4. **An observer to receive notifications when the data source has changed.** Loaders should implement an observer of some sort
     (i.e. a `ContentObserver`, a `BroadcastReceiver`, etc.) to monitor the underlying data source for changes.
     When a change is detected, the observer should call `Loader#onContentChanged()`, which will either (a) force a new
     load if the Loader is in a started state or, (b) raise a flag indicating that a change has been made so that if the Loader
     is ever started again, it will know that it should reload its data.

By now you should have a basic understanding of how Loaders work. If not, I suggest you let it sink in for a bit and
come back later to read through once more (reading the
<a href="http://developer.android.com/reference/android/content/Loader.html">documentation</a> never hurts either!).
That being said, let’s get our hands dirty with the actual code!

### Implementing the Loader

As I stated earlier, there is a lot that you must keep in mind when implementing your own custom Loaders.
Subclasses must implement `loadInBackground()` and should override `onStartLoading()`,
`onStopLoading()`, `onReset()`, `onCanceled()`, and
`deliverResult(D results)` to achieve a fully functioning Loader. Overriding these methods is
very important as the LoaderManager will call them regularly depending on the state of the Activity/Fragment
lifecycle. For example, when an Activity is first started, the Activity instructs the LoaderManager to
start each of its Loaders in `Activity#onStart()`. If a Loader is not already started, the
LoaderManager calls `startLoading()`, which puts the Loader in a started state and immediately
calls the Loader’s `onStartLoading()` method. In other words, a lot of work that the LoaderManager
does behind the scenes **relies on the Loader being correctly implemented**, so don’t take the task of
implementing these methods lightly!

The code below serves as a template of what a Loader implementation typically looks like. The `SampleLoader`
queries a list of `SampleItem` objects and delivers a `List<SampleItem>` to the client:

```java
public class SampleLoader extends AsyncTaskLoader<List<SampleItem>> {

  // We hold a reference to the Loader’s data here.
  private List<SampleItem> mData;

  public SampleLoader(Context ctx) {
    // Loaders may be used across multiple Activitys (assuming they aren't
    // bound to the LoaderManager), so NEVER hold a reference to the context
    // directly. Doing so will cause you to leak an entire Activity's context.
    // The superclass constructor will store a reference to the Application
    // Context instead, and can be retrieved with a call to getContext().
    super(ctx);
  }

  /****************************************************/
  /** (1) A task that performs the asynchronous load **/
  /****************************************************/

  @Override
  public List<SampleItem> loadInBackground() {
    // This method is called on a background thread and should generate a
    // new set of data to be delivered back to the client.
    List<SampleItem> data = new ArrayList<SampleItem>();

    // TODO: Perform the query here and add the results to 'data'.

    return data;
  }

  /********************************************************/
  /** (2) Deliver the results to the registered listener **/
  /********************************************************/

  @Override
  public void deliverResult(List<SampleItem> data) {
    if (isReset()) {
      // The Loader has been reset; ignore the result and invalidate the data.
      releaseResources(data);
      return;
    }

    // Hold a reference to the old data so it doesn't get garbage collected.
    // We must protect it until the new data has been delivered.
    List<SampleItem> oldData = mData;
    mData = data;

    if (isStarted()) {
      // If the Loader is in a started state, deliver the results to the
      // client. The superclass method does this for us.
      super.deliverResult(data);
    }

    // Invalidate the old data as we don't need it any more.
    if (oldData != null && oldData != data) {
      releaseResources(oldData);
    }
  }

  /*********************************************************/
  /** (3) Implement the Loader’s state-dependent behavior **/
  /*********************************************************/

  @Override
  protected void onStartLoading() {
    if (mData != null) {
      // Deliver any previously loaded data immediately.
      deliverResult(mData);
    }

    // Begin monitoring the underlying data source.
    if (mObserver == null) {
      mObserver = new SampleObserver();
      // TODO: register the observer
    }

    if (takeContentChanged() || mData == null) {
      // When the observer detects a change, it should call onContentChanged()
      // on the Loader, which will cause the next call to takeContentChanged()
      // to return true. If this is ever the case (or if the current data is
      // null), we force a new load.
      forceLoad();
    }
  }

  @Override
  protected void onStopLoading() {
    // The Loader is in a stopped state, so we should attempt to cancel the 
    // current load (if there is one).
    cancelLoad();

    // Note that we leave the observer as is. Loaders in a stopped state
    // should still monitor the data source for changes so that the Loader
    // will know to force a new load if it is ever started again.
  }

  @Override
  protected void onReset() {
    // Ensure the loader has been stopped.
    onStopLoading();

    // At this point we can release the resources associated with 'mData'.
    if (mData != null) {
      releaseResources(mData);
      mData = null;
    }

    // The Loader is being reset, so we should stop monitoring for changes.
    if (mObserver != null) {
      // TODO: unregister the observer
      mObserver = null;
    }
  }

  @Override
  public void onCanceled(List<SampleItem> data) {
    // Attempt to cancel the current asynchronous load.
    super.onCanceled(data);

    // The load has been canceled, so we should release the resources
    // associated with 'data'.
    releaseResources(data);
  }

  private void releaseResources(List<SampleItem> data) {
    // For a simple List, there is nothing to do. For something like a Cursor, we 
    // would close it in this method. All resources associated with the Loader
    // should be released here.
  }

  /*********************************************************************/
  /** (4) Observer which receives notifications when the data changes **/
  /*********************************************************************/
 
  // NOTE: Implementing an observer is outside the scope of this post (this example
  // uses a made-up "SampleObserver" to illustrate when/where the observer should 
  // be initialized). 
  
  // The observer could be anything so long as it is able to detect content changes
  // and report them to the loader with a call to onContentChanged(). For example,
  // if you were writing a Loader which loads a list of all installed applications
  // on the device, the observer could be a BroadcastReceiver that listens for the
  // ACTION_PACKAGE_ADDED intent, and calls onContentChanged() on the particular 
  // Loader whenever the receiver detects that a new application has been installed.
  // Please don’t hesitate to leave a comment if you still find this confusing! :)
  private SampleObserver mObserver;
}
```


### Conclusion

I hope these posts were useful and gave you a better understanding of how Loaders and the LoaderManager work
together to perform asynchronous, auto-updating queries. Remember that Loaders are your friends... if you use
them, your app will benefit in both responsiveness and the amount of code you need to write to get everything
working properly! Hopefully I could help lessen the learning curve a bit by detailing them out!

As always, please don’t hesitate to leave a comment if you have any questions! And don't
forget to +1 this blog in the top right corner if you found it helpful!

<hr class="footnote-divider" />

<sup id="footnote1">1</sup> You don't need to worry about registering a listener for your Loader unless you plan on using it without the LoaderManager. The LoaderManager will act as this "listener" and will forward any results that the Loader delivers to the `LoaderCallbacks#onLoadFinished` method. <a href="#ref1" title="Jump to footnote 1.">&#8617;</a>

<sup id="footnote2">2</sup> Loaders may also be in an <a href="http://developer.android.com/reference/android/content/Loader.html#onAbandon()">"abandoned"</a> state. This is an optional intermediary state between "stopped" and "reset" and is not discussed here for the sake of brevity. That said, in my experience implementing `onAbandon()` is usually not necessary. <a href="#ref2" title="Jump to footnote 2.">&#8617;</a>
