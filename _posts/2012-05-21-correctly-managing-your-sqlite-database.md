---
layout: post
title: Correctly Managing Your SQLite Database
date: 2012-05-21
permalink: /2012/05/correctly-managing-your-sqlite-database.html
comments: true
---

<p>One thing that I've noticed other Android developers having trouble with is properly setting up their <code>SQLiteDatabase</code>. Often times, I come across questions on StackOverflow asking about error messages such as,</p>

<p>
<pre class="brush: text">
E/Database(234): Leak found
E/Database(234): Caused by: java.lang.IllegalStateException: SQLiteDatabase created and never closed
</pre>
</p>

<p>As you have probably figured out, this exception is thrown when you have opened more <code>SQLiteDatabase</code> instances than you have closed. Managing the database can be complicated when first starting out with Android development, especially to those who are just beginning to understand the <code>Activity</code> lifecycle. The easiest solution is to make your database instance a singleton instance across the entire application's lifecycle. This will ensure that no leaks occur, and will make your life a lot easier since it eliminates the possibility of forgetting to close your database as you code.</p>

<p>Here are two examples that illustrates three possible approaches in managing your singleton database. These will ensure safe access to the database throughout the application.</p>
<!--more-->

<h4>Approach #1: Use an Abstract Factory to Instantiate the <code>SQLiteOpenHelper</code></h4>

<p>Declare your database helper as a static instance variable and use the Abstract Factory pattern to guarantee the singleton property. The sample code below should give you a good idea on how to go about designing the <code>DatabaseHelper</code> class correctly.</p>

<p>The static factory <code>getInstance()</code> method ensures that only one <code>DatabaseHelper</code> will ever exist at any given time. If the <code>sInstance</code> object has not been initialized, one will be created. If one has already been created then it will simply be returned. <b>You should not initialize your helper object using with <code>new DatabaseHelper(context)</code>!</b>. Instead, always use <code>DatabaseHelper.getInstance(context)</code>, as it guarantees that only one database helper will exist across the entire application's lifecycle.</p>

<p>
<pre class="brush: java">
public class DatabaseHelper extends SQLiteOpenHelper { 

  private static DatabaseHelper sInstance = null;

  private static final String DATABASE_NAME = "database_name";
  private static final String DATABASE_TABLE = "table_name";
  private static final int DATABASE_VERSION = 1;

  public static DatabaseHelper getInstance(Context context) {
     
    // Use the application context, which will ensure that you 
    // don't accidentally leak an Activity's context.
    // See this article for more information: http://bit.ly/6LRzfx
    if (sInstance == null) {
      sInstance = new DatabaseHelper(context.getApplicationContext());
    }
    return sInstance;
  }
    
  /**
   * Constructor should be private to prevent direct instantiation.
   * make call to static factory method "getInstance()" instead.
   */
  private DatabaseHelper(Context context) {
    super(context, DATABASE_NAME, null, DATABASE_VERSION);
  }
}
</pre>
</p>

<h4>Approach #2: Wrap the <code>SQLiteDatabase</code> in a <code>ContentProvider</code></h4>

<p>This is also a nice approach. For one, the new <code>CursorLoader</code> class requires <code>ContentProvider</code>s, so if you want an Activity or Fragment to implement <code>LoaderManager.LoaderCallbacks&lt;Cursor&gt;</code> with a <code>CursorLoader</code> (<a href="http://www.androiddesignpatterns.com/2012/07/understanding-loadermanager.html">read this post for more information</a>), you'll need to implement a <code>ContentProvider</code> for your application. Further, you don't need to worry about making a singleton database helper with <code>ContentProvider</code>s. Simply call <code>getContentResolver()</code> from the Activity and the system will take care of everything for you (in other words, there is no need for designing a Singleton pattern to prevent multiple instances from being created).</p>

<p>Leave a comment if this helped or if you have any questions! :)</p>