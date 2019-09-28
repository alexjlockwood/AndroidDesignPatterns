---
layout: post
title: "Creating reusable layouts using theme attributes"
date: 2019-08-08
permalink: /2019/08/creating-reusable-layouts-theme-attributes.html
related: ['/2013/08/fragment-transaction-commit-state-loss.html',
    '/2016/11/introduction-to-icon-animation-techniques.html',
    '/2016/08/contextcompat-getcolor-getdrawable.html']
style: |
    .figure-image {
      width: 100%;
      border-radius: 4px;
      text-align: center;
    }
    .figure-container {
      padding: 0% 10%;
    }
    .caption-container {
      font-size: 10pt;
      margin-left: 20px;
      margin-bottom: 30px
    }
    .caption-element {
      margin-top: 3px;
      margin-bottom:10px;
      text-align: center;
    }
---

In this blog post I want to share a useful trick that can be used to achieve more reusable layouts.

At Lyft, each of our components come in one of two styles:

* **Focus**. To be used when we anticipate a driver is likely not actively driving or in-motion. Focus states generally contain smaller type sizes, lighter weights, and smaller tap targets — similar to what is found in the passenger app. 
* **Drive**. To be used when we anticipate a driver is likely actively driving or in-motion. Drive states generally contain larger type sizes, heavier weights, and larger tap targets. A Drive screen may often be encountered while the phone is mounted a few feet away from the Driver, on the car dashboard. Since a driver is likely to be in-motion, it’s critical that we allow the app to get out of the driver’s way so that they can focus their attention on the road.

<!-- Figure 1 -->

<div class="figure-container">
    <img
        class="figure-image"
        src="/assets/images/posts/2019/08/08/ListItemsFocusDrive.jpg"
        alt="Comparing List Items using a Focus vs. Drive style."
        title="Comparing List Items using a Focus vs. Drive style.">
</div>
<div class="caption-container">
    <p class="caption-element">
        <strong>Figure 1</strong> - Comparing List Items using a Focus vs. Drive style.
    </p>
</div>

### Default styles

You have to do a bit of extra work to get this strategy to work with default styles.