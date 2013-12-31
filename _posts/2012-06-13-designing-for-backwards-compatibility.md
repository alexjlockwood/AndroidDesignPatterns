---
layout: post
title: 'Designing for Backwards Compatibility'
date: 2012-06-13
permalink: /2012/06/designing-for-backwards-compatibility.html
comments: true
---

A common issue in Android development is backwards compatibility. How can we add cool
new features from the most recent Android API while still ensuring that it runs
correctly on devices running older versions of Android? This post discusses the
problem by means of a simple example, and proposes a scalable, well-designed solution.

<!--more-->

(Note: please read this
<a href="/2012/06/compatability-manager-utility-class.html">short post</a>
before continuing forward).

## The Problem

Let's say we are writing an application that reads and writes pictures to new albums
(i.e. folders) located on external storage, and that we want our application to support
all devices running Donut (Android 1.6, SDK version 4) and above. Upon consulting the
<a href="http://developer.android.com/guide/topics/data/data-storage.html#filesExternal">documentation</a>,
we realize there is a slight problem. With the introduction of Froyo (Android 2.2,
SDK version 8) came a somewhat radical change in how external storage was laid out
and represented on Android devices, as well as several new API methods (see
<a href="http://developer.android.com/reference/android/os/Environment.html">`android.os.Environment`</a>)
that allow us access to the public storage directories. To ensure backwards compatibility
all the way back to Donut, we must provide two separate implementations: one for older,
pre-Froyo devices, and another for devices running Froyo and above.

## Setting up the Manifest

Before we dive into the implementation, we will first update our `uses-sdk` tag in the Android
manifest. There are two attributes we must set,

  + `android:minSdkVersion="4"`. This attribute defines a minimum API level required for
    the application to run. We want our application to run on devices running Donut and above,
    so we set its value to `"4"`.

  + `android:targetSdkVersion="15"`. This attribute is a little trickier to understand
    (and is incorrectly defined on blogs all over the internet). This attribute specifies
    the API level on which the application is designed to run. Preferably we would want
    its value to correspond to the most recently released SDK (`"15"`, at the time of this
    posting). Strictly speaking, however, its value should be given by the largest SDK
    version number that we have tested your application against (we will assume we have
    done so for the remainder of this example).

The resulting tag in our mainfest is as follows:

```
<uses-sdk 
    android:minSdkVersion="4"
    android:targetSdkVersion="15" >
</uses-sdk>
```

## Implementation

Our implementation will consist of an abstract class and two subclasses that extend
it. The abstract `AlbumStorageDirFactory` class enforces a simple contract by
requiring its subclasses to implement the `getAlbumStorageDir` method. The actual
implementation of this method depends on the device's SDK version number. Specifically,
if we are using a device running Froyo or above, its implementation will make use of
new methods introduced in API level 8. Otherwise, the correct directory must be
determined using pre-Froyo method calls, to ensure that our app remains backwards compatible.

```java
public abstract class AlbumStorageDirFactory {

  /**
   * Returns a File object that points to the folder that will store 
   * the album's pictures. 
   */
  public abstract File getAlbumStorageDir(String albumName);

  /**
   * A static factory method that returns a new AlbumStorageDirFactory 
   * instance based on the current device's SDK version.
   */
  public static AlbumStorageDirFactory newInstance() {
    // Note: the CompatibilityUtil class is implemented 
    // and discussed in a previous post, entitled 
    // "Ensuring Compatibility with a Utility Class".
    if (CompatabilityUtil.isFroyo()) {
      return new FroyoAlbumDirFactory();
    } else {
      return new BaseAlbumDirFactory();
    }
  }
}
```

The two subclasses and their implementation are given below.The class also provides
a static factory `newInstance` method (note that this method makes use of the
`CompatabilityUtil` utility class, which was both implemented and discussed in a
<a href="/2012/06/compatability-manager-utility-class.html">previous post</a>).
We discuss this method in detail in the next section.

The `BaseAlbumDirFactory` subclass handles pre-Froyo SDK versions:

```java
public class BaseAlbumDirFactory extends AlbumStorageDirFactory {

  /**
   * For pre-Froyo devices, we must provide the name of the photo directory 
   * ourselves. We choose "/dcim/" as it is the widely considered to be the 
   * standard storage location for digital camera files.
   */
  private static final String CAMERA_DIR = "/dcim/";

  @Override
  public File getAlbumStorageDir(String albumName) {
    return new File (
                    Environment.getExternalStorageDirectory() 
                    + CAMERA_DIR 
                    + albumName
    );
  }
}
```

The `FroyoAlbumDirFactory` subclass handles Froyo and above:

```java
public class FroyoAlbumDirFactory extends AlbumStorageDirFactory {

  @Override
  public File getAlbumStorageDir(String albumName) {
    return new File(Environment.getExternalStoragePublicDirectory(
            Environment.DIRECTORY_PICTURES), albumName);
  }
}
```

## Making Sense of the Pattern

Take a second to study the structure of the code above. Our implementation ensures
compatibility with pre-Froyo devices through a simple design. To ensure compatibility,
we simply request a new `AlbumStorageDirFactory` and call the abstract `getAlbumStorageDir`
method. The subclass is determined and instantiated at runtime depending on the Android
device's SDK version number. See the sample activity below for an example on how an ordinary
Activity might use this pattern to retrieve an album's directory.

```java
public class SampleActivity extends Activity {

  private AlbumStorageDirFactory mAlbumFactory;

  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    // Instantiate the AlbumStorageDirFactory. Instead of
    // invoking the subclass' default constructors directly,
    // we make use of the Abstract Factory design pattern,
    // which encapsulates the inner details. As a result, the
    // Activity does not need to know `anything` about the
    // compatibility-specific implementation--all of this is
    // done behind the scenes within the "mAlbumFactory" object.     
    mAlbumFactory = AlbumStorageDirFactory.newInstance();

    // get the album's directory
    File sampleAlbumDir = getAlbumDir("sample_album");
  }

  /**
   * A simple helper method that returns a File corresponding
   * to the album named "albumName". The helper method invokes
   * the abstract "getAlbumStorageDir" method, which will return
   * correct location of the directory depending on the subclass
   * that was returned in "newInstance" (which depends entirely
   * on the device's SDK version number).
   */
  private File getAlbumDir(String albumName) {
    return mAlbumStorageDirFactory.getAlbumStorageDir(albumName);
  }
}
```

There are a couple benefits to organizing the code the way we have:

  + **It's easily extendable.** While there is certainly no need to separate our
    implementations into classes for simple examples (such as the one discussed above),
    doing so is important when working with large, complicated projects, as it will ensure
    changes can quickly be made down the line.
  + **It encapsulates the implementation-specific details.** Abstracting these details
    from the client makes our code less cluttered and easier to read (note: in this case,
    "the client" was the person who wrote the Activity class).

## Conclusion

Android developers constantly write code to ensure backwards compatibility. As projects
expand and applications become more complex, it becomes increasingly important to ensure
your implementation is properly designed. Hopefully this post helped and will encourage
you to more elegant solutions in the future!

Leave a comment if you have any questions or criticisms... or just to let me know that
you managed to read through this entire post!