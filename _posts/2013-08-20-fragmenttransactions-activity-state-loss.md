---
layout: post
title: FragmentTransactions & Activity State Loss
date: 2012-08-20
permalink: /2013/08/fragment-transaction-commit-state-loss.html
comments: true
---

The following stack trace and exception message has plagued StackOverflow ever since Honeycomb's initial release:

    java.lang.IllegalStateException: Can not perform this action after onSaveInstanceState
        at android.support.v4.app.FragmentManagerImpl.checkStateLoss(FragmentManager.java:1341)
        at android.support.v4.app.FragmentManagerImpl.enqueueAction(FragmentManager.java:1352)
        at android.support.v4.app.BackStackRecord.commitInternal(BackStackRecord.java:595)
        at android.support.v4.app.BackStackRecord.commit(BackStackRecord.java:574)

This post will explain _why_ and _when_ this exception is thrown, and will conclude with several suggestions that will help ensure it never crashes your application again.

#### Why was the exception thrown?

The exception was thrown because you attempted to commit a `FragmentTransaction` 
after the activity's state had been saved, resulting in a phenomenon known as _Activity 
state loss_. Before we get into the details of what this actually means, however, let's 
first take a look at what happens under-the-hood when `onSaveInstanceState()` is 
called. As I discussed in my last post about <a href="http://www.androiddesignpatterns.com/2013/08/binders-death-recipients.html">`Binder`'s &amp; Death Recipients</a>, 
Android applications have very little control over their destiny within the Android runtime 
environment. The Android system has the power to terminate processes at any time to free up 
memory, and background activities may be killed with little to no warning as a result. To 
ensure that this sometimes erratic behavior remains hidden from the user, the framework gives 
each Activity a chance to save its state by calling its `onSaveInstanceState()` 
method before making the Activity vulnerable to destruction. When the saved state is later 
restored, the user will be given the perception that they are seamlessly switching between 
foreground and background activities, regardless of whether or not the Activity had been 
killed by the system.

When the framework calls `onSaveInstanceState()`, it passes the method a 
`Bundle` object for the Activity to use to save its state, and the Activity 
records in it the state of its dialogs, fragments, and views. When the method returns, 
the system parcels the `Bundle` object across a Binder interface to the 
System Server process, where it is safely stored away. When the system later decides 
to recreate the Activity, it sends this same `Bundle` object back to the 
application, for it to use to restore the Activity's old state.

So why then is the exception thrown? Well, the problem stems from the fact that 
these `Bundle` objects represent a snapshot of an Activity at the moment 
`onSaveInstanceState()` was called, and nothing more. That means when you call `FragmentTransaction#commit()` after `onSaveInstanceState()` is 
called, the transaction won't be remembered because it was never recorded as part of the 
Activity's state in the first place. From the user's point of view, the transaction will 
appear to be lost, resulting in accidental UI state loss. In order to protect the user 
experience, Android avoids state loss at all costs, and simply throws an 
`IllegalStateException` whenever it occurs.

<!--more-->

#### When is the exception thrown?

If you've encountered this exception before, you've probably noticed that the moment 
when it is thrown is slightly inconsistent across different platform versions. For 
example, you probably found that older devices tended to throw the exception less 
frequently, or that your application was more likely to crash when using the support 
library than when using the official framework classes. These slight inconsistencies 
have led many to assume that the support library is buggy and can't be trusted. 
These assumptions, however, are generally not true.

The reason why these slight inconsistencies exist stems from a significant change to 
the Activity lifecycle that was made in Honeycomb. Prior to Honeycomb, Activities 
were not considered killable until after they had been paused, meaning that 
`onSaveInstanceState()` was called immediately before `onPause()`. 
Beginning with Honeycomb, however, Activities are considered to be killable only 
after they have been _stopped_, meaning that `onSaveInstanceState()` 
will now be called before `onStop()` instead of immediately before 
`onPause()`. These differences are summarized in the table below:

| | pre-Honeycomb | post-Honeycomb |
| --- | --- | --- |
| Activities can be killed before `onPause()`? | NO | NO |
| Activities can be killed before `onStop()`? | YES | NO |
| `onSaveInstanceState(Bundle)` is guaranteed to be called before... | `onPause()` | `onStop()` |


<!--
<table border="1" cellpadding="5">
  <tbody><tr>
    <th style="width: 270px"></th>
    <th>pre-Honeycomb</th>
    <th>post-Honeycomb</th>
  </tr>
  <tr>
    <td style="width: 270px">Activities can be killed before `onPause()`?</td>
    <td>NO</td>
    <td>NO</td>
  </tr>
  <tr>
    <td style="width: 270px">Activities can be killed before `onStop()`?</td>
    <td>YES</td>
    <td>NO</td>
  </tr>
  <tr>
    <td style="width: 270px">`onSaveInstanceState(Bundle)` is guaranteed to be called before...</td>
    <td>`onPause()`</td>
    <td>`onStop()`</td>
  </tr>
</tbody></table>
-->

As a result of the slight changes that were made to the Activity lifecycle, the support 
library sometimes needs to alter its behavior depending on the platform version. For 
example, on Honeycomb devices and above, an exception will be thrown each and every 
time a `commit()` is called after `onSaveInstanceState()` 
to warn the developer that state loss has occurred. However, throwing an exception 
every time this happened would be too restrictive on pre-Honeycomb devices, which 
have their `onSaveInstanceState()` method called much earlier in the 
Activity lifecycle and are more vulnerable to accidental state loss as a result. 
The Android team was forced to make a compromise: for better inter-operation with 
older versions of the platform, older devices would have to live with the accidental 
state loss that might result between `onPause()` and `onStop()`. 
The support library's behavior across the two platforms is summarized in the table below:

| | pre-Honeycomb | post-Honeycomb |
| --- | --- | --- |
| `commit()` before `onPause()` | OK | OK |
| `commit()` between `onPause()` and `onStop()` | STATE LOSS | OK |
| `commit()` after `onStop()` | EXCEPTION | EXCEPTION |

<!--
<table border="1" cellpadding="5">
  <tbody><tr>
    <th style="width: 270px"></th>
    <th>pre-Honeycomb</th>
    <th>post-Honeycomb</th>
  </tr>
  <tr>
    <td style="width: 270px">`commit()` before `onPause()`</td>
    <td>OK</td>
    <td>OK</td>
  </tr>
  <tr>
    <td style="width: 270px">`commit()` between `onPause()` and `onStop()`</td>
    <td>STATE LOSS</td>
    <td>OK</td>
  </tr>
  <tr>
    <td style="width: 270px">`commit()` after `onStop()`</td>
    <td>EXCEPTION</td>
    <td>EXCEPTION</td>
  </tr>
</tbody></table>
-->

#### How to avoid the exception?

Avoiding Activity state loss becomes a whole lot easier once you understand what is actually 
going on. If you've made it this far in the post, hopefully you understand a little better 
how the support library works and why it is so important to avoid state loss in your applications. 
In case you've referred to this post in search of a quick fix, however, here are some suggestions 
to keep in the back of your mind as you work with `FragmentTransaction`s in your applications:

+ **Be careful when committing transactions inside Activity lifecycle methods.** 
A large majority of applications will only ever commit transactions the very first 
time `onCreate()` is called and/or in response to user input, and will 
never face any problems as a result. However, as your transactions begin to venture 
out into the other Activity lifecycle methods, such as `onActivityResult()`, 
`onStart()`, and `onResume()`, things can get a little tricky. 
For example, you should not commit transactions inside the `FragmentActivity#onResume()` 
method, as there are some cases in which the method can be called before the 
activity's state has been restored (see the <a href="http://developer.android.com/reference/android/support/v4/app/FragmentActivity.html#onResume()">documentation</a> for more information). 
If your application requires committing a transaction in an Activity lifecycle 
method other than `onCreate()`, do it in either 
`FragmentActivity#onResumeFragments()` or `Activity#onPostResume()`. 
These two methods are guaranteed to be called after the Activity has been restored to its 
original state, and therefore avoid the possibility of state loss all together. 
(As an example of how this can be done, check out my answer to <a href="http://stackoverflow.com/q/16265733/844882">this StackOverflow question</a> for 
some ideas on how to commit `FragmentTransaction`s in response to calls 
made to the `Activity#onActivityResult()` method).

+ **Avoid performing transactions inside asynchronous callback methods.** This 
includes commonly used methods such as `AsyncTask#onPostExecute()` and 
`LoaderManager.LoaderCallbacks#onLoadFinished()`. The problem with 
performing transactions in these methods is that they have no knowledge of the 
current state of the Activity lifecycle when they are called. For example, 
consider the following sequence of events:

    1. An activity executes an `AsyncTask`.
    2. The user presses the "Home" key, causing the activity's `onSaveInstanceState()` 
and `onStop()` methods to be called.
    3. The `AsyncTask` completes and `onPostExecute()` is 
called, unaware that the Activity has since been stopped.
    4. A `FragmentTransaction` is committed inside the 
`onPostExecute()` method, causing an exception to be thrown.

    In general, the best way to avoid the exception in these cases is to simply avoid 
committing transactions in asynchronous callback methods all together. Google 
engineers seem to agree with this belief as well. According to 
<a href="https://groups.google.com/d/msg/android-developers/dXZZjhRjkMk/QybqCW5ukDwJ">this post</a> 
on the Android Developers group, the Android team considers the major shifts in UI 
that can result from committing `FragmentTransaction`s from within 
asynchronous callback methods to be bad for the user experience. If your application 
requires performing the transaction inside these callback methods and there is no 
easy way to guarantee that the callback won't be invoked after `onSaveInstanceState()`, 
you may have to resort to using `commitAllowingStateLoss()` and 
dealing with the state loss that might occur. (See also these two StackOverflow 
posts for additional hints, <a href="http://stackoverflow.com/q/8040280/844882">here</a> 
and <a href="http://stackoverflow.com/q/7992496/844882">here</a>).

+ **Use `commitAllowingStateLoss()` only as a last resort.** The only 
difference between calling `commit()` and `commitAllowingStateLoss()` 
is that the latter will not throw an exception if state loss occurs. Usually you don't 
want to use this method because it implies that there is a possibility that state loss 
could happen. The better solution, of course, is to write your application so that 
`commit()` is guaranteed to be called before the activity's state has been 
saved, as this will result in a better user experience. Unless the possibility of 
state loss can't be avoided, `commitAllowingStateLoss()` should not be used.

Hopefully these tips will help you resolve any issues you have had with this exception 
in the past. If you are still having trouble, post a question on 
<a href="http://stackoverflow.com">StackOverflow</a> and post a link in a comment below 
and I can take a look. :)

As always, thanks for reading, and leave a comment if you have any questions. 
Don't forget to +1 this blog and share this post on Google+ if you found it interesting!