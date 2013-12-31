---
layout: post
title: Google Play Services: Setup & Verification
date: 2013-01-08
permalink: /2013/01/google-play-services-setup.html
comments: true
---

<p>One of the trickiest aspects of writing a robust web-based Android application is authentication, simply due to its asynchronous nature and the many edge cases that one must cover. Thankfully, the recently released Google Play Services API greatly simplifies the authentication process, providing developers with a consistent and safe way to grant and receive OAuth2 access tokens to Google services. Even so, there are still several cases that must be covered in order to provide the best possible user experience. A professionally built Android application should be able to react to even the most unlikely events, for example, if a previously logged in user uninstalls Google Play Services, or navigates to the system settings and clears the application’s data when the foreground Activity is in a paused state. This post focuses on how to make use of the Google Play Services library while still accounting for edge cases such as these.</p>

<h4>Verifying Google Play Services</h4>

<p>In this post, we will implement a very basic (but robust) Android application that authenticates a user with Google services. Our implementation will consist of a single Activity:</p>

<p>
<pre class="brush:java">
public class AuthActivity extends Activity {

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    setContentView(R.layout.main);
  }
}
</pre>
</p>

<p>As you probably already know, before we attempt authentication using Google Play Services, we must first verify that the service is up-to-date and installed on the device. This seems easy enough, but <i>where</i> should these checks be performed? As with most edge-case checks, it makes the most sense to verify that our device is properly configured in the Activity’s <span style="font-family: 'Courier New', Courier, monospace;">onResume()</span> method. Verifying in <span style="font-family: 'Courier New', Courier, monospace;">onResume()</span> is important because it has the application perform a check each time the Activity is brought into the foreground, thus guaranteeing that our application will never incorrectly assume that Google Play Services is properly configured:</p>

<!--more-->

<p>
<pre class="brush:java">
@Override
protected void onResume() {
  super.onResume();
  if (checkPlayServices()) {
    // Then we're good to go!
  }
}
</pre>
</p>

<p>Now let’s implement <span style="font-family: 'Courier New', Courier, monospace;">checkPlayServices()</span>, which will return true if and only if Google Play Services is correctly installed and configured on the device:</p>

<p>
<pre class="brush:java">
private boolean checkPlayServices() {
  int status = GooglePlayServicesUtil.isGooglePlayServicesAvailable(this);
  if (status != ConnectionResult.SUCCESS) {
    if (GooglePlayServicesUtil.isUserRecoverableError(status)) {
      showErrorDialog(status);
    } else {
      Toast.makeText(this, "This device is not supported.", 
          Toast.LENGTH_LONG).show();
      finish();
    }
    return false;
  }
  return true;
} 

void showErrorDialog(int code) {
  GooglePlayServicesUtil.getErrorDialog(code, this, 
      REQUEST_CODE_RECOVER_PLAY_SERVICES).show();
}
</pre>
</p>

<p>And we implement <span style="font-family: 'Courier New', Courier, monospace;">onActivityResult</span> as follows:</p>

<p>
<pre class="brush:java">
static final int REQUEST_CODE_RECOVER_PLAY_SERVICES = 1001;

@Override
protected void onActivityResult(int requestCode, int resultCode, Intent data) {
  switch (requestCode) {
    case REQUEST_CODE_RECOVER_PLAY_SERVICES:
      if (resultCode == RESULT_CANCELED) {
        Toast.makeText(this, "Google Play Services must be installed.",
            Toast.LENGTH_SHORT).show();
        finish();
      }
      return;
  }
  super.onActivityResult(requestCode, resultCode, data);
}
</pre>
</p>

<p>If Google Play Services are available, the method will return true. If Google Play Services is not available and error is deemed "unrecoverable", a Toast will indicate to the user that the device is not supported. Otherwise, an error dialog will be shown and a result will eventually propagate back to <span style="font-family: 'Courier New', Courier, monospace;">onActivityResult</span>. Note that <span style="font-family: 'Courier New', Courier, monospace;">onActivityResult</span> is called <i>before</i> <span style="font-family: 'Courier New', Courier, monospace;">onResume</span>, so when a result is returned, we will perform one final check just to be sure that everything has been setup correctly.</p>

<h4>Checking the Currently Logged In User</h4>

<p>What we have so far is enough to ensure that our users will be able to use our application if and only if Google Play Services is installed and up-to-date. Now let’s assume that our application also stores the name of the currently logged in user in its <span style="font-family: 'Courier New', Courier, monospace;">SharedPreferences</span>. How should our application respond in the case that the current user is unexpectedly logged out (i.e. the user has clicked "Clear data" in the app’s system settings)? It turns out that we can do something very similar. (Note that the code below makes use of a simple utility file named <a href="https://gist.github.com/4477849"><span style="font-family: 'Courier New', Courier, monospace;">AccountUtils.java</span></a>, which provides some helper methods for reading/writing account information to the app’s <span style="font-family: 'Courier New', Courier, monospace;">SharedPreferences</span>).</p>

<p>First, define a method that will verify the existence of a single authenticated user in the application’s shared preferences and update the <span style="font-family: 'Courier New', Courier, monospace;">onResume()</span> method accordingly:</p>

<p>
<pre class="brush:java">
@Override
protected void onResume() {
  super.onResume();
  if (checkPlayServices() && checkUserAccount()) {
    // Then we're good to go!
  }
}

private boolean checkPlayServices() {
  /* ... */
}

private boolean checkUserAccount() {
  String accountName = AccountUtils.getAccountName(this);
  if (accountName == null) {
    // Then the user was not found in the SharedPreferences. Either the
    // application deliberately removed the account, or the application's
    // data has been forcefully erased.
    showAccountPicker();
    return false;
  }

  Account account = AccountUtils.getGoogleAccountByName(this, accountName);
  if (account == null) {
    // Then the account has since been removed.
    AccountUtils.removeAccount(this);
    showAccountPicker();
    return false;
  }

  return true;
}

private void showAccountPicker() {
  Intent pickAccountIntent = AccountPicker.newChooseAccountIntent(
      null, null, new String[] { GoogleAuthUtil.GOOGLE_ACCOUNT_TYPE }, 
      true, null, null, null, null);
  startActivityForResult(pickAccountIntent, REQUEST_CODE_PICK_ACCOUNT);
}
</pre>
</p>

<p>Note that in the case that a user is not already signed in, an <span style="font-family: 'Courier New', Courier, monospace;">AccountPicker</span> dialog will be launched, requesting that the user selects a Google account with which the application will use to authenticate requests. The result will eventually be returned back to the Activity, so we must update the <span style="font-family: 'Courier New', Courier, monospace;">onActivityResult</span> method accordingly:</p>

<p>
<pre class="brush:java">
static final int REQUEST_CODE_RECOVER_PLAY_SERVICES = 1001;
static final int REQUEST_CODE_PICK_ACCOUNT = 1002;

@Override
protected void onActivityResult(int requestCode, int resultCode, Intent data) {
  switch (requestCode) {
    case REQUEST_CODE_RECOVER_PLAY_SERVICES:
      /* ... */
    case REQUEST_CODE_PICK_ACCOUNT:
      if (resultCode == RESULT_OK) {
        String accountName = data.getStringExtra(
            AccountManager.KEY_ACCOUNT_NAME);
        AccountUtils.setAccountName(this, accountName);
      } else if (resultCode == RESULT_CANCELED) {
        Toast.makeText(this, "This application requires a Google account.", 
            Toast.LENGTH_SHORT).show();
        finish();
      }
      return;
   }
   super.onActivityResult(requestCode, resultCode, data);
 }
</pre>
</p>

<p>As was the case before, <span style="font-family: 'Courier New', Courier, monospace;">onResume</span> will be called after <span style="font-family: 'Courier New', Courier, monospace;">onActivityResult</span>, ensuring that Google Play Services is still installed and up-to-date, and that a Google account has indeed been selected and saved to the disk.</p>

<h4>Conclusion</h4>

<p>However unlikely they might be, covering edge cases in your Android applications is very important. If a user deliberately tries to break your application (by, for example, clearing the application’s data in the system settings), the app should immediately recognize the event and act appropriately. The same concept outlined in this post applies to many areas of Android development, not just those apps which make use of Google Play Services.</p>

<p>The full source code for this post is provided here <a href="https://gist.github.com/4477849">AccountUtils.java</a> and <a href="https://gist.github.com/4477939">AuthActivity.java</a>. As always, leave a comment if you have any questions and don’t forget to +1 this post!</p>