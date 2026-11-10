# CHANGELOG

## [2.0.0] - Unreleased
### Breaking changes
- the module exports a single default object: `import ScrollAnimation from "data-scroll-animation"` instead of
  `import * as ScrollAnimation` or named imports (the UMD global and `require` are unchanged)
- only the entry point can be imported: the files inside `dist` are not reachable anymore
- animations are rendered on events by default (`METHOD.EVENTS`) instead of on every animation frame:
  call `setMethod(METHOD.ANIMATION_FRAME)` to restore the previous behavior
- before the first keyframe the first value is kept, as the last value after the last keyframe,
  instead of extending the first segment: add `data-scroll-(property)-extrapolate` to extend it

### Added
- `setMethod` and `METHOD` to choose between rendering on events and on every animation frame
- `requestRender` to schedule a render when a parent moves without scrolling or resizing
- `data-scroll-(property)-extrapolate` is documented and extends both the first and the last segments
- `data-scroll-(property)-easing` applies an easing to every interpolation segment: the functions of easings.net,
  `cubic-bezier()` and `steps()`
- horizontally scrolling parents are recognized and parents that can't scroll are ignored

### Changed
- importing the library doesn't access the DOM anymore, so it can be imported during server-side rendering
- interpolated values are rounded to 4 decimals
- numbers like `.5`, `+5` and `1e-3` are recognized, hexadecimal colors are not interpolated
- a property is rendered only when its value can have changed
- the position of a scroll parent ignores the CSS transforms of its ancestors

### Fixed
- type declarations matching the module format in every TypeScript module resolution
- `NaN` position when the parent range has zero height
- the render is skipped when the scroll jumps across the whole range
- an element moved to another parent stays among the children of the old one
- `_x` → `X` conversion of property names applied only to the first occurrence
- methods not called in the final render of `remove`
- render loop not stopped or restarted correctly

## [1.3.0] - 2021-10-12
- skip "html" element in rect calculations
- emit ts declarations

## [1.2.2] - 2021-06-08
- fix get rect top

## [1.2.1] - 2021-05-08
- fix function handling
- fix get scroll parent

## [1.2.0] - 2021-04-06
- optimize rendering

## [1.1.2] - 2021-04-05
- force render on refresh

## [1.1.1] - 2021-04-05
- avoid unnecessary renders

## [1.1.0] - 2021-04-04
- remove "render" event
- improve `constructString` and rect computation

## [1.0.4] - 2021-02-12
- fix continous render after removing element with base scroll parent
- remove useless comments
- update dependencies

## [1.0.3] - 2021-02-11
- fix multiple render simultaneously
- fix parent not refreshing when child refreshes
- improve ts type declaration

## [1.0.2] - 2021-02-08
- change dist structure
- update entry points in package.json
- update dependencies