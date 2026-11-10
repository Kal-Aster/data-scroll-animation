enum METHOD {
    // renders every frame, also when nothing moves
    ANIMATION_FRAME = 0,
    // renders only after scroll, resize of the window or resize of a parent or of the document
    EVENTS = 1
}

export default METHOD;
