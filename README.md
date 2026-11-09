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
>`value` is linearly interpolated between frames
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

`data-scroll-(method)()`
>Calls `method` every frame with frame number as first and only argument `method(frame: number): number`
```js
import * as ScrollAnimation from "data-scroll-animation";

ScrollAnimation.add(document.body); // adds all animation in the document
ScrollAnimation.add(document.querySelector("#animation")) // adds only the #animation element

ScrollAnimation.remove(document.querySelector("#element")) // removes only the #element element
```

### Render method
By default animations are rendered on every animation frame, even when the page is still.
`setMethod` switches to rendering only when something can have moved a parent:
```js
ScrollAnimation.setMethod(ScrollAnimation.METHOD.EVENTS); // render on events
ScrollAnimation.setMethod(ScrollAnimation.METHOD.ANIMATION_FRAME); // render every frame (default)
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

## Development
`npm run build`
>Builds `dist/` (UMD, ES module and type declarations)

`npm run dev`
>Rebuilds `test/scripts/main.js` on every change and serves the test page at http://localhost:8080

`npm run build:test`
>Builds `test/scripts/main.js` once
