---
layout: post
title: Using newInstance() to Instantiate a Fragment
date: 2012-05-24
comments: false
---

I recently came across an interesting question on StackOverflow regarding Fragment instantiation:

> What is the difference between `new MyFragment()` and `MyFragment.newInstance()`? Should I prefer one over the other?

Good question. The answer, as the title of this blog suggests, is a matter of proper design.

Here, the `newInstance()` method is what we call a "static factory method", a simple pattern that is often used as a way to instantiate an object without directly calling the object's default constructor. For example, it is often used to implement a Singleton design pattern:

```java
public static class Singleton {
    
    private static final Singleton instance = null;
        
    /** 
     * Make the class private to prevent direct instantiation. This 
     * forces clients to call newInstance(), which will ensure the
     * class' Singleton property.
     */
    private Singleton() { }
   
    /**
     * If instance is null, then instantiate the object by calling
     * the default constructor (this is OK since we are calling
     * it from within the class). This method should be marked
     * "synchronized" if you plan on calling it from multiple threads!
     */ 
    public static Singleton getInstance() {
        if (instance == null) {
            instance = new Singleton();
        }
        return instance;
    }
}
```

The programmer forces the client to call `newInstance()` to retrieve an instance of the class. This is important because simply providing a default constructor would allow the client access to multiple instances of the class (as this goes against the singleton property).

The same general idea is often applied to fragments. Providing a static factory method for your fragments is good practice when you want to add initialization arguments to the newly instantiated object. For example, consider the following code:

public class MyFragment extends Fragment {

```java
public class MyFragment extends Fragment {

    /**
     * Static factory method that takes an int parameter,
     * initializes the fragment's arguments, and returns the
     * new fragment to the client.
     */
    public static MyFragment newInstance(int index) {
        MyFragment f = new MyFragment();
        Bundle args = new Bundle();
        args.putInt("index", index);
        f.setArguments(args);
        return f;
    }

}
```

Rather than having the client call the default constructor and manually set the fragment's arguments themselves, we provide a static factory method that does this for them. This is preferred over the default constructor for two reasons. One, it's convenient for the client, and two, it enforces well-defined behavior. By providing a static factory method, we protect ourselves from bugs down the line--we no longer need to worry about accidentally forgetting to initialize the fragment's arguments or incorrectly doing so.

Overall, while the difference between the two is mostly just a matter of design, this difference is really important because it provides another level of abstraction and makes code a lot easier to understand.

Leave a comment if this helped... it'll motivate me to write more of these blog posts in the future! :)