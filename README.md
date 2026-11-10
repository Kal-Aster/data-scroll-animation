# scroll-based HTMLElement property management
## Installation
`npm install data-scroll-animation`
## Usage
`data-scroll-parent` attribute
>Specifies the start and end point of nested animation

`data-scroll-top`
>Defines top offset in px

`data-scroll-bottom`
>Defines bottom offset in px

The animation begins at `start - topOffset` and ends at `end + bottomOffset`
```
┌-------------------> topOffset     = frame 0
|
|
╔═════════════════╗-> start
║                 ║
║      PARENT     ║
║                 ║
╚═════════════════╝-> end
|
|
└-------------------> bottomOffset  = frame 1
```

`data-scroll-(property)-(frame)="(value)"`
>Sets `property` of the attribute owner element to `value` at specified `frame`
>
>`property` have format `[property.]*property`, so `style.width` works as well `customProperty`
>
>`value` is linearly interpolated between frames, unless an easing is set
special `frame`s are "before" and "after"
>
>Before the first frame and after the last one the value of the nearest frame is kept

`data-scroll-(property)-extrapolate`
>Extends the first and the last interpolation segments of `property` up to frame 0 and frame 1 instead of keeping the nearest value
>
>The attribute value is ignored. It needs at least two numeric frames and is ignored when the values can't be interpolated
```html
<div
    data-scroll-style.top-0.2="10px"
    data-scroll-style.top-0.8="40px"
    data-scroll-style.top-extrapolate
></div>
<!-- top is 0px at frame 0, 5px at 0.1, 45px at 0.9 and 50px at 1 -->
```

`data-scroll-(property)-easing="(easing)"`
>Applies `easing` to every interpolation segment of `property`, like `animation-timing-function` does between CSS keyframes
>
>`easing` is one of:
>- `linear`
>- a function of [easings.net](https://easings.net) in kebab-case: `ease-(in|out|in-out)-(sine|quad|cubic|quart|quint|expo|circ|back|elastic|bounce)`, for example `ease-in-out-cubic` or `ease-out-bounce`
>- the CSS functions `cubic-bezier(x1, y1, x2, y2)` and `steps(count, position)`
>
>An invalid value is ignored and the segments stay linear
>
>The segments extended by `-extrapolate` stay linear
```html
<div
    data-scroll-style.top-0="0px"
    data-scroll-style.top-0.5="100px"
    data-scroll-style.top-1="0px"
    data-scroll-style.top-easing="ease-in-out-cubic"
></div>
<!-- top eases in and out from 0px to 100px and back -->
```

`data-scroll-(method)()`
>Calls `method` every frame with frame number as first and only argument `method(frame: number): number`
```js
import ScrollAnimation from "data-scroll-animation";

ScrollAnimation.add(document.body); // adds all animation in the document
ScrollAnimation.add(document.querySelector("#animation")) // adds only the #animation element

ScrollAnimation.remove(document.querySelector("#element")) // removes only the #element element
```

### Render method
By default animations are rendered only when something can have moved a parent.
`setMethod` switches to rendering on every animation frame, even when the page is still:
```js
ScrollAnimation.setMethod(ScrollAnimation.METHOD.ANIMATION_FRAME); // render every frame
ScrollAnimation.setMethod(ScrollAnimation.METHOD.EVENTS); // render on events (default)
```
With `METHOD.EVENTS` a render is scheduled on the next frame after:
- scroll of the page or of any inner scrollable container;
- resize of the window;
- resize of a parent or of the whole document (for example content above a parent that grows or shrinks).

A parent that moves without any of these is not detected: for example inside a fixed-height scrollable container, when an element above the parent changes height or the `margin-top` of the parent changes, or in the page when an element above the parent grows and another one shrinks by the same amount.
In these cases call `requestRender` after the change:
```js
ScrollAnimation.requestRender(); // schedules a render on the next frame, does nothing with METHOD.ANIMATION_FRAME
```

### Smoothness and browser limitations
Browsers scroll on a separate thread (the compositor), while animations are rendered by JavaScript on the main thread.
Chromium and Firefox keep the two in sync as long as the page renders on every frame, so with both render methods the animations follow the scroll without lag.

Elements whose animation compensates the scroll are the most sensitive to a missed frame: for example a `top` that grows while scrolling to keep an element still, or a switch between `position: absolute` and `fixed`.
When the page misses a frame the compositor has already scrolled the content but the element is still in the previous position, so it visibly jumps back and forth.

This happens with Firefox on Linux under X11 (observed with Firefox 158 and an integrated Intel GPU), even if the render takes less than 2ms: the page often misses the vertical sync and stays one or two frames behind the scroll.
It is not specific to this library: it happens with any scroll-linked effect made in JavaScript, and in Firefox also with CSS scroll-driven animations, because there they still run on the main thread.
The same pages are smooth on Chromium and on Firefox for Android. See the [Firefox bug about scroll-linked effects](https://bugzilla.mozilla.org/show_bug.cgi?id=1367770).

To reduce the problem:
- make elements that stay still while the content scrolls with `position: sticky`, which the compositor moves together with the scroll, and use the animations for the other properties (colors, sizes, opacity, movements of the element itself), where a late frame is not noticeable;
- on Linux a Wayland session should give a more regular frame timing than X11; check that Firefox runs on Wayland natively in `about:support` (*Window Protocol* must be `wayland`, not `xwayland`).

## Development
`npm run build`
>Builds `dist/` (UMD, ES module and type declarations)

`npm run dev`
>Rebuilds `test/scripts/main.js` on every change and serves the test page at http://localhost:8080

`npm run build:test`
>Builds `test/scripts/main.js` once
