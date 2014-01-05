---
layout: post
title: 'Basic Android Debugging with Logs'
date: 2012-05-30
permalink: /2012/05/intro-to-android-debug-logging.html
---
As with most areas in software engineering, debugging is a crucial aspect
of Android development. Properly setting up your application for debugging
can save you hours of work and frustration. Unfortunately, in my experience
not many beginners learn how to properly make use of the utility classes
provided in the Android SDK. Unless you are an experienced developer, it
is my personal belief that Android debugging should follow a _pattern_.
This will prove beneficial for a couple reasons:

<!--more-->

  + **It allows you to anticipate bugs down the line.** Setting up your development
    work space for debugging will give you a head start on bugs you might encounter
    in the future.

  + **It gives you centralized control over the debugging process.** Disorganized and
    sparse placement of log messages in your class can clutter your logcat output, making
    it difficult to interpret debugging results. The ability to toggle certain groups
    of log messages on/off can make your life a whole lot easier, especially if your
    application is complex.

### The `Log` Class

For those of you who don't know, the Android SDK includes a useful logging
utility class called `android.util.Log`. The class allows you to
log messages categorized based severity; each type of logging message has
its own message. Here is a listing of the message types, and their respective
method calls, ordered from lowest to highest priority:

  + The `Log.v()` method is used to log verbose messages.
  + The `Log.d()` method is used to log debug messages.
  + The `Log.i()` method is used to log informational messages.
  + The `Log.w()` method is used to log warnings.
  + The `Log.e()` method is used to log errors.
  + The `Log.wtf()` method is used to log events that should never happen
    ("wtf" being an abbreviation for "What a Terrible Failure", of course).
    You can think of this method as the equivalent of Java's `assert` method.

One should _always_ consider a message's type when assigning log messages to
one of the six method calls, as this will allow you to
<a href="http://developer.android.com/guide/developing/debugging/debugging-log.html#filteringOutput">filter your logput output</a>
when appropriate. It is also important to understand when it is acceptable to
compile log messages into your application:

  + **Verbose logs should never be compiled into an application except during development.** 
    When development is complete and you are ready to release your application to the world,
    you should remove all verbose method calls either by commenting them out, or using
    ProGuard to remove any verbose log statements directly from the bytecode of your
    compiled JAR executable, as described in Christopher's answer in this
    <a href="http://stackoverflow.com/q/2018263/844882">StackOverflow post</a>.
  + **Debug logs** are compiled in but are ignored at runtime.
  + **Error**, **warning**, and **informational** logs are always kept.

### A Simple Pattern

A simple way to organize debugging is with the sample pattern implemented
below. A global, static string is given to represent the specific class
(an Activity in this example, but it could be a service, an adapter,
anything), and a boolean variable to represent whether or not log
messages should be printed to the logcat.

```java
public class SampleActivity extends Activity {

  /**
   * A string constant to use in calls to the "log" methods. Its
   * value is often given by the name of the class, as this will 
   * allow you to easily determine where log methods are coming
   * from when you analyze your logcat output.
   */
  private static final String TAG = "SampleActivity";

  /**
   * Toggle this boolean constant's value to turn on/off logging
   * within the class. 
   */
  private static final boolean VERBOSE = true;

  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    if (VERBOSE) Log.v(TAG, "+++ ON CREATE +++");
  }

  @Override
  public void onStart() {
    super.onStart();
    if (VERBOSE) Log.v(TAG, "++ ON START ++");
  }

  @Override
  public void onResume() {
    super.onResume();
    if (VERBOSE) Log.v(TAG, "+ ON RESUME +");
  }
}
```

Don't be afraid to be creative in how you print your log messages to the logcat!
For instance, when the sample activity above is launched, the resulting logcat
is presented in an nicely formatted and human-readable way:

```
V SampleActivity +++ ON CREATE +++
V SampleActivity ++ ON START++
V SampleActivity + ON RESUME +
```

### Conclusion

In this post, I have covered the basics in which Android debugging can (and
should) be performed. In a future post, I will go into a bit more depth by
providing some more advanced patterns that will give you more control over
how debugging is performed at runtime.

Leave a comment if this helped... it'll motivate me to write more of these
blog posts in the future! :)