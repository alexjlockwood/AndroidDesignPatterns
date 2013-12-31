---
layout: post
title: Using newInstance() to Instantiate a Fragment
date: 2012-05-24
permalink: /2012/05/using-newinstance-to-instantiate.html
comments: true
---

I recently came across an interesting question on StackOverflow regarding Fragment instantiation:

> What is the difference between `new MyFragment()` and `MyFragment.newInstance()`?
> Should I prefer one over the other?

Good question. The answer, as the title of this blog suggests, is a matter of proper design. In this
case, the `newInstance()` method is a "static factory method," allowing us to initialize and setup a
new `Fragment` without having to call its constructor and additional setter methods. Providing static
factory methods for your fragments is good practice because it encapsulates and abstracts the steps
required to setup the object from the client. For example, consider the following code:

<!--more-->

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

Rather than having the client call the default constructor and manually set the fragment's arguments
themselves, we provide a static factory method that does this for them. This is preferred over the
default constructor for two reasons. One, it's convenient for the client, and two, it enforces well-defined
behavior. By providing a static factory method, we protect ourselves from bugs down the line&mdash;we no
longer need to worry about accidentally forgetting to initialize the fragment's arguments or incorrectly doing so.

Overall, while the difference between the two is mostly just a matter of design, this difference is really
important because it provides another level of abstraction and makes code a lot easier to understand.

Feel free to leave a comment if this blog post helped (it will motivate me to write more in the future)! :)
