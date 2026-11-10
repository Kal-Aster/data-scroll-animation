// maps the progress inside a segment, from 0 to 1, to the progress of the interpolated value
type Easing = (progress: number) => number;

export default Easing;
