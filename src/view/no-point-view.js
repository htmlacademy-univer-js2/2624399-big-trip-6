import View from './view.js';

const EMPTY_LIST_MESSAGE = 'Click New Event to create your first point';

function createNoPointTemplate(message) {
  return `<p class="trip-events__msg">${message}</p>`;
}

export default class NoPointView extends View {
  #message = EMPTY_LIST_MESSAGE;

  constructor(message = EMPTY_LIST_MESSAGE) {
    super();
    this.#message = message;
  }

  get template() {
    return createNoPointTemplate(this.#message);
  }
}
