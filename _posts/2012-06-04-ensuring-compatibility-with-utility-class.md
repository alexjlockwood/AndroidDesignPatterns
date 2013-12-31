---
layout: post
title: Ensuring Compatibility with a Utility Class
date: 2012-06-14
permalink: /2012/06/compatability-manager-utility-class.html
comments: true
---

<p>This (rather short) post introduces the concept of a <b>utility class</b>&nbsp;and gives a simple example of how you can use one to tidy up your code. As Android projects grow in size, it becomes increasingly important that your code remains organized and well-structured. Providing a utility class for commonly called methods can help tremendously in reducing the complexity of your project, allowing you to structure your code in a readable and easily understandable way.</p>

<p>Here's a simple example. Let's say you are building an Android application that frequently checks the device's SDK version code, to ensure backward compatibility. You'll need to use the constants provided in the <code>android.os.Build.VERSION_CODES</code> class, but these constants are long and can quickly clutter up your code. In this case, it might be a good idea to create a <code>CompatabilityUtil</code> utility class. A sample implementation is given below:</p>

<!--more-->

<p>
<pre class="brush: java">
public class CompatibilityUtil {
    
  /**
   * Get the current Android API level.
   */
  public static int getSdkVersion() {
    return Build.VERSION.SDK_INT;
  }

  /**
   * Determine if the device is running API level 8 or higher.
   */
  public static boolean isFroyo() {
    return getSdkVersion() >= Build.VERSION_CODES.FROYO;
  }

  /**
   * Determine if the device is running API level 11 or higher.
   */
  public static boolean isHoneycomb() {
    return getSdkVersion() >= Build.VERSION_CODES.HONEYCOMB;
  }

  /**
   * Determine if the device is a tablet (i.e. it has a large screen).
   * 
   * @param context The calling context.
   */
  public static boolean isTablet(Context context) {
    return (context.getResources().getConfiguration().screenLayout
            & Configuration.SCREENLAYOUT_SIZE_MASK)
            >= Configuration.SCREENLAYOUT_SIZE_LARGE;
  }

  /**
   * Determine if the device is a HoneyComb tablet.
   * 
   * @param context The calling context.
   */
  public static boolean isHoneycombTablet(Context context) {
    return isHoneycomb() && isTablet(context);
  }

  /**
   * This class can't be instantiated.
   */
  private CompatibilityUtil() { }
}
</pre>
</p>

<p>Developers often create a separate package called <code>[package name].util</code> for frequently used utility classes. So for example, if your package name is <code>com.example.myapp</code>, then a nice place to put your utility classes would be in a separate package called <code>com.example.myapp.util</code>. However, remember that there's no need to <i>over-organize</i> your project. Creating a separate package might be a good idea for a larger project, but is completely unnecessary if your project contains only 5-10 classes. I might write a post about package/class organization in the future. For now, check out the (very well-designed) <a href="http://code.google.com/p/iosched/source/browse/">Google I/O 2011</a> app's source code. You will learn a lot!</p>