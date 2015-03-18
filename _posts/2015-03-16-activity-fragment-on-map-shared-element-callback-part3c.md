---
layout: post
title: 'onMapSharedElements() (part 3c)'
date: 2015-03-16
permalink: /2015/03/activity-fragment-on-map-shared-element-callback-part3c.html
related: ['/2012/08/implementing-loaders.html',
    '/2013/08/fragment-transaction-commit-state-loss.html',
    '/2012/06/app-force-close-honeycomb-ics.html']
---

This post continues our in-depth analysis of _shared element transitions_ by discussing an important feature of the Lollipop Transition API: `SharedElementCallback`s. It is the fifth of a series of posts I will be writing on the topic:

* **Part 1:** [Getting Started with Activity & Fragment Transitions][part1]
* **Part 2:** [Content Transitions In-Depth][part2]
* **Part 3a:** [Shared Element Transitions In-Depth][part3a]
* **Part 3b:** [Postponed Shared Element Transitions][part3b]
* **Part 3c:** [`onMapSharedElements()`][part3c]
* **Part 4:** ????? (_coming soon!_)

Both the Activity and Fragment Transition API provide a [`SharedElementCallback`][SharedElementCallback] class that developers can use to customize their shared element transitions. The class provides six methods total. In this blog post we will focus on the `onMapSharedElements()` callback method.

### How the framework finds shared elements

<!--morestart-->

One of the first things the framework does before a shared element transition begins is determine the set of shared element views that will need to be animated. For example, when `A` starts `B`, the framework will need to go through the following steps (a similar process is followed when `B` returns to `A` as well):

<!--more-->

1. Find the set of shared elements in `A`'s view hierarchy based on the transition names specified in [`makeSceneTransitionAnimation()`][makeSceneTransitionAnimation] for Activities or [`addSharedElement()`][addSharedElement] for Fragments.

2. The framework starts `B` and sends with it the set of transition names that will be transitioned. `B` will remember this set of transition names for when `B` later returns to `A` and the return/reenter shared element transition is played. The framework searches `B`'s view hierarchy for the views corresponding to the provided transition names. If the framework fails to find a view with a specified transition name, the view will be rejected. If there are multiple views in the hierarchy with the same transition name, the behavior is undefined.

### Switching shared elements using `onMapSharedElements()`

As you can see above, the framework handles most of the work for you automatically by searching the view hierarchy and comparing transition names to determine the set of shared elements to be transitioned. However, the framework also allows developers to alter the shared elements map before the transition begins. Fortunately, the `onMapSharedElements()` method allows us to achieve this. The method takes two arguments:

1. `List<String> names` - A list of strings containing the developer-specified transition names. 

2. `Map<String, View> sharedElements` - A mapping of transition names to their corresponding `View`s.

When overriding `onMapSharedElements()`, the developer must modify these two data structures to achieve the desired mapping of transition names to shared element views. This opens up a few opportunities for us to customize our shared element transitions:

1. You want to use a different shared element when navigating back. **TODO: add video example**

2. The two Activities cannot share the same transition name. For example, a list of contacts will display each contact with its own unique transition name. Going from an activity that displays a single contact to an activity that displays a list of contacts will be difficult, because the single contact activity might not know the unique transition name ahead of time. The list activity will therefore need to manually "re-map" the single contact to the desired list contact.

3. You want to cancel a shared element transition. For example, if the shared element has been scrolled off the screen, or if the user has rotated the screen from portrait to landscape and the shared element no longer exists in the layout.

### Implementing a simple example

```java
public class MainActivity extends Activity implements View.OnClickListener {

    static String TOP_LEFT_TRANSITION_NAME = "top_left";
    static String BOTTOM_RIGHT_TRANSITION_NAME = "bottom_right";

    private View mTopLeftView;
    private View mBottomRightView;
    private boolean mIsExiting = true;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        findViewById(R.id.content).setOnClickListener(this);

        mTopLeftView = findViewById(R.id.shared_element1);
        mBottomRightView = findViewById(R.id.shared_element2);

        setExitSharedElementCallback(new SharedElementCallback() {
            @Override
            public void onMapSharedElements(List<String> names, Map<String, View> sharedElements) {
                names.clear();
                sharedElements.clear();

                if (mIsExiting) {
                    // If we are exiting, then send mTopLeftView to the next activity.
                    names.add(TOP_LEFT_TRANSITION_NAME);
                    sharedElements.put(TOP_LEFT_TRANSITION_NAME, mTopLeftView);
                } else {
                    names.add(BOTTOM_RIGHT_TRANSITION_NAME);
                    sharedElements.put(BOTTOM_RIGHT_TRANSITION_NAME, mBottomRightView);
                }
            }
        });
    }

    @Override
    public void onActivityReenter(int resultCode, Intent data) {
        super.onActivityReenter(resultCode, data);
        mIsExiting = false;
    }

    @Override
    public void onClick(View v) {
        mIsExiting = true;
        startActivity(new Intent(this, DetailsActivity.class),
                ActivityOptions.makeSceneTransitionAnimation(
                        this, mTopLeftView, TOP_LEFT_TRANSITION_NAME).toBundle());
    }
}
```

and

```java
public class DetailsActivity extends Activity {

    private View mCenterView;
    private boolean mIsEntering = true;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_details);
        
        mCenterView = findViewById(R.id.shared_element);
        
        setEnterSharedElementCallback(new SharedElementCallback() {
            @Override
            public void onMapSharedElements(List<String> names, Map<String, View> sharedElements) {
                names.clear();
                sharedElements.clear();

                if (mIsEntering) {
                    // If we are entering, then the main activity has just exited
                    // and we need to map the top left view to mCenterView.
                    names.add(TOP_LEFT_TRANSITION_NAME);
                    sharedElements.put(TOP_LEFT_TRANSITION_NAME, mCenterView);
                } else {
                    // If we are returning, then the main activity is about to reenter
                    // and we need to map the bottom right view to mCenterView.
                    names.add(BOTTOM_RIGHT_TRANSITION_NAME);
                    sharedElements.put(BOTTOM_RIGHT_TRANSITION_NAME, mCenterView);
                }
            }
        });
    }

    @Override
    public void finishAfterTransition() {
        // Setting the result to RESULT_OK ensures that onActivityReenter()
        // will be called in the main activity.
        setResult(RESULT_OK);
        mIsEntering = false;
        super.finishAfterTransition();
    }
}
```

<hr class="footnote-divider"/>
<sup id="footnote?">?</sup> ????? <a href="#ref?" title="Jump to footnote ?.">&#8617;</a>

  [SharedElementCallback]: SharedElementCallback
  [onMapSharedElements]: https://developer.android.com/reference/android/app/SharedElementCallback.html#onMapSharedElements(java.util.List%3Cjava.lang.String%3E,%20java.util.Map%3Cjava.lang.String,%20android.view.View%3E)

  [captureSharedElementState]: https://github.com/android/platform_frameworks_base/blob/lollipop-mr1-release/core/java/android/app/ActivityTransitionCoordinator.java#L750-L786
  [setSharedElementState]: https://github.com/android/platform_frameworks_base/blob/lollipop-mr1-release/core/java/android/app/ActivityTransitionCoordinator.java#L429-L503

  [makeSceneTransitionAnimation]: https://developer.android.com/reference/android/app/ActivityOptions.html#makeSceneTransitionAnimation(android.app.Activity,%20android.util.Pair%3Candroid.view.View,%20java.lang.String%3E...)
  [addSharedElement`]: https://developer.android.com/reference/android/app/FragmentTransaction.html#addSharedElement(android.view.View,%20java.lang.String)

  [part1]: /2014/12/activity-fragment-transitions-in-android-lollipop-part1.html
  [part2]: /2014/12/activity-fragment-content-transitions-in-depth-part2.html
  [part3a]: /2015/01/activity-fragment-shared-element-transitions-in-depth-part3a.html
  [part3b]: /2015/03/activity-postponed-shared-element-transitions-part3b.html
  [part3c]: /2015/03/activity-fragment-on-map-shared-element-callback-part3c.html

