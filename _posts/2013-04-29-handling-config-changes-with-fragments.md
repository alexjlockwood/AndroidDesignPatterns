---
layout: post
title: Handling Configuration Changes with Fragments
date: 2013-04-29
permalink: /2013/04/retaining-objects-across-config-changes.html
comments: true
---

<p>This post addresses a common question: <i>what is the best way to retain active objects—such as running </i><code>Thread</code><i>s, </i><code>Socket</code><i>s, and </i><code>AsyncTask</code><i>s—across device configuration changes?</i></p>

<p>To answer this question, we will first discuss some of the common difficulties developers face when using long-running background tasks in conjunction with the Activity lifecycle. Then, we will describe the flaws of two common approaches to solving the problem. Finally, we will conclude with sample code illustrating the recommended solution, which uses retained Fragments to achieve our goal.</p>

<!--more-->

<h4>Configuration Changes & Background Tasks</h4>

<p>One problem with configuration changes and the destroy-and-create cycle that Activitys go through as a result stems from the fact that these events are unpredictable and may occur at any time. Concurrent background tasks only add to this problem. Assume, for example, that an Activity starts an <code>AsyncTask</code> and soon after the user rotates the screen, causing the Activity to be destroyed and recreated. When the <code>AsyncTask</code> eventually finishes its work, it will incorrectly report its results back to the old Activity instance, completely unaware that a new Activity has been created. As if this wasn't already an issue, the new Activity instance might waste valuable resources by firing up the background work <i>again</i>, unaware that the old <code>AsyncTask</code> is still running. For these reasons, it is vital that we correctly and efficiently retain active objects across Activity instances when configuration changes occur.</p>

<h4>Bad Practice: Retain the Activity</h4>

<p>Perhaps the hackiest and most widely abused workaround is to disable the default destroy-and-recreate behavior by setting the <code>android:configChanges</code> attribute in your Android manifest. The apparent simplicity of this approach makes it extremely attractive to developers; <a href="http://stackoverflow.com/a/5336057/844882">Google engineers</a>, however, discourage its use. The primary concern is that it requires you to handle device configuration changes manually in code. Handling configuration changes requires you to take many additional steps to ensure that each and every string, layout, drawable, dimension, etc. remains in sync with the device's current configuration, and if you aren't careful, your application can easily have a whole series of resource-specific bugs as a result.</p>

<p>Another reason why Google discourages its use is because many developers incorrectly assume that setting <code>android:configChanges="orientation"</code> (for example) will magically protect their application from unpredictable scenarios in which the underlying Activity will be destroyed and recreated. <i>This is not the case.</i> Configuration changes can occur for a number of reasons&mdash;not just screen orientation changes. Inserting your device into a display dock, changing the default language, and modifying the device's default font scaling factor are just three examples of events that can trigger a device configuration change, all of which signal the system to destroy and recreate all currently running Activitys the next time they are resumed. As a result, setting the <code>android:configChanges</code> attribute is generally not good practice.</p>

<h4>Deprecated: Override <code>onRetainNonConfigurationInstance()</code></h4>

<p>Prior to Honeycomb's release, the recommended means of transferring active objects across Activity instances was to override the <code>onRetainNonConfigurationInstance()</code> and <code>getLastNonConfigurationInstance()</code> methods. Using this approach, transferring an active object across Activity instances was merely a matter of returning the active object in <code>onRetainNonConfigurationInstance()</code> and retrieving it in <code>getLastNonConfigurationInstance()</code>. As of API 13, these methods have been deprecated in favor of the more Fragment's <code>setRetainInstance(boolean)</code> capability, which provides a much cleaner and modular means of retaining objects during configuration changes. We discuss this Fragment-based approach in the next section.</p>

<h4>Recommended: Manage the Object Inside a Retained <code>Fragment</code></h4>

<p>Ever since the introduction of Fragments in Android 3.0, the recommended means of retaining active objects across Activity instances is to wrap and manage them inside of a retained "worker" Fragment. By default, Fragments are destroyed and recreated along with their parent Activitys when a configuration change occurs. Calling <code>Fragment#setRetainInstance(true)</code> allows us to bypass this destroy-and-recreate cycle, signaling the system to retain the current instance of the fragment when the activity is recreated. As we will see, this will prove to be extremely useful with Fragments that hold objects like running <code>Thread</code>s, <code>AsyncTask</code>s, <code>Socket</code>s, etc.</p>

<p>The sample code below serves as a basic example of how to retain an <code>AsyncTask</code> across a configuration change using retained Fragments. The code guarantees that progress updates and results are delivered back to the currently displayed Activity instance and ensures that we never accidentally leak an <code>AsyncTask</code> during a configuration change. The design consists of two classes, a <code>MainActivity</code>...</p>

```java
/**
 * This Activity displays the screen's UI, creates a TaskFragment
 * to manage the task, and receives progress updates and results 
 * from the TaskFragment when they occur.
 */
public class MainActivity extends Activity implements TaskFragment.TaskCallbacks {

  private TaskFragment mTaskFragment;

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    setContentView(R.layout.main);

    FragmentManager fm = getFragmentManager();
    mTaskFragment = (TaskFragment) fm.findFragmentByTag("task");

    // If the Fragment is non-null, then it is currently being
    // retained across a configuration change.
    if (mTaskFragment == null) {
      mTaskFragment = new TaskFragment();
      fm.beginTransaction().add(mTaskFragment, "task").commit();
    }

    // TODO: initialize views, restore saved state, etc.
  }

  // The four methods below are called by the TaskFragment when new
  // progress updates or results are available. The MainActivity 
  // should respond by updating its UI to indicate the change.

  @Override
  public void onPreExecute() { ... }

  @Override
  public void onProgressUpdate(int percent) { ... }

  @Override
  public void onCancelled() { ... }

  @Override
  public void onPostExecute() { ... }
}
```

<p>...and a <code>TaskFragment</code>...</p>

```java
/**
 * This Fragment manages a single background task and retains 
 * itself across configuration changes.
 */
public class TaskFragment extends Fragment {

  /**
   * Callback interface through which the fragment will report the
   * task's progress and results back to the Activity.
   */
  public static interface TaskCallbacks {
    void onPreExecute();
    void onProgressUpdate(int percent);
    void onCancelled();
    void onPostExecute();
  }

  private TaskCallbacks mCallbacks;
  private DummyTask mTask;

  /**
   * Hold a reference to the parent Activity so we can report the
   * task's current progress and results. The Android framework 
   * will pass us a reference to the newly created Activity after 
   * each configuration change.
   */
  @Override
  public void onAttach(Activity activity) {
    super.onAttach(activity);
    mCallbacks = (TaskCallbacks) activity;
  }

  /**
   * This method will only be called once when the retained
   * Fragment is first created.
   */
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    // Retain this fragment across configuration changes.
    setRetainInstance(true);

    // Create and execute the background task.
    mTask = new DummyTask();
    mTask.execute();
  }

  /**
   * Set the callback to null so we don't accidentally leak the 
   * Activity instance.
   */
  @Override
  public void onDetach() {
    super.onDetach();
    mCallbacks = null;
  }

  /**
   * A dummy task that performs some (dumb) background work and
   * proxies progress updates and results back to the Activity.
   *
   * Note that we need to check if the callbacks are null in each
   * method in case they are invoked after the Activity's and
   * Fragment's onDestroy() method have been called.
   */
  private class DummyTask extends AsyncTask<Void, Integer, Void> {

    @Override
    protected void onPreExecute() {
      if (mCallbacks != null) {
        mCallbacks.onPreExecute();
      }
    }

    /**
     * Note that we do NOT call the callback object's methods
     * directly from the background thread, as this could result 
     * in a race condition.
     */
    @Override
    protected Void doInBackground(Void... ignore) {
      for (int i = 0; !isCancelled() && i < 100; i++) {
        SystemClock.sleep(100);
        publishProgress(i);
      }
      return null;
    }

    @Override
    protected void onProgressUpdate(Integer... percent) {
      if (mCallbacks != null) {
        mCallbacks.onProgressUpdate(percent[0]);
      }
    }

    @Override
    protected void onCancelled() {
      if (mCallbacks != null) {
        mCallbacks.onCancelled();
      }
    }

    @Override
    protected void onPostExecute(Void ignore) {
      if (mCallbacks != null) {
        mCallbacks.onPostExecute();
      }
    }
  }
}
```

<h4>Flow of Events</h4>

<p>When the <code>MainActivity</code> starts up for the first time, it instantiates and adds the <code>TaskFragment</code> to the Activity's state. The <code>TaskFragment</code> creates and executes an <code>AsyncTask</code> and proxies progress updates and results back to the <code>MainActivity</code> via the <code>TaskCallbacks</code> interface. When a configuration change occurs, the <code>MainActivity</code> goes through its normal lifecycle events, and once created the new Activity instance is passed to the <code>onAttach(Activity)</code> method, thus ensuring that the <code>TaskFragment</code> will always hold a reference to the currently displayed Activity instance even after the configuration change. The resulting design is both simple and reliable; the application framework will handle re-assigning Activity instances as they are torn down and recreated, and the <code>TaskFragment</code> and its <code>AsyncTask</code> never need to worry about the unpredictable occurrence of a configuration change. Note also that it is impossible for <code>onPostExecute()</code> to be executed in between the calls to <code>onDetach()</code> and <code>onAttach()</code>, as explained in <a href="http://stackoverflow.com/q/19964180/844882">this StackOverflow answer</a> and in my reply to Doug Stevenson in <a href="https://plus.google.com/u/0/+AlexLockwood/posts/etWuiiRiqLf">this Google+ post</a> (there is also some discussion about this in the comments below).</p>

<h4>Conclusion</h4>

<p>Synchronizing background tasks with the Activity lifecycle can be tricky and configuration changes will only add to the confusion. Fortunately, retained Fragments make handling these events very easy by consistently maintaining a reference to its parent Activity, even after being destroyed and recreated.</p>

<p>A sample application illustrating how to correctly use retained Fragments to achieve this effect is available for download on the <a href="https://play.google.com/store/apps/details?id=com.adp.retaintask">Play Store</a>. The source code is available on <a href="https://github.com/alexjlockwood/worker-fragments">GitHub</a>. Download it, import it into Eclipse, and modify it all you want!</p>

<p><a href="https://play.google.com/store/apps/details?id=com.adp.retaintask" imageanchor="1" ><img border="0" src="http://1.bp.blogspot.com/-1sQZ32vpOy4/UXtjWSjLhfI/AAAAAAAAHJw/KoXS-a5y3mo/s320/Screenshot_2013-04-27-04-22-18.png" /></a></p>

<p>As always, leave a comment if you have any questions and don't forget to +1 this blog in the top right corner!</p>
