import View from './view.js';

const EMPTY_LIST_MESSAGE = 'Click New Event to create your first point';

function createNoPointTemplate() {
  return `<p class="trip-events__msg">${EMPTY_LIST_MESSAGE}</p>`;
}

export default class NoPointView extends View {
  get template() {
    return createNoPointTemplate();
  }
}
