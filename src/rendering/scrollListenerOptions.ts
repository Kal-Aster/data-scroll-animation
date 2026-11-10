// scroll does not bubble: capture catches also the scroll of inner containers
const scrollListenerOptions: AddEventListenerOptions = { capture: true, passive: true };

export default scrollListenerOptions;
