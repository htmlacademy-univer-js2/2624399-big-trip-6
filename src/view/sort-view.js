import View from './view.js';

export default class SortView extends View {
  #onSortTypeChange = null;

  constructor({onSortTypeChange} = {}) {
    super();
    this.#onSortTypeChange = onSortTypeChange;

    this.#setInnerHandlers();
  }

  get template() {
    return (`
      <form class="trip-events__trip-sort  trip-sort" action="#" method="get">
        <div class="trip-sort__item  trip-sort__item--day" data-sort-type="sort-day">
          <input id="sort-day" class="trip-sort__input  visually-hidden" type="radio" name="trip-sort" value="sort-day" checked data-sort-type="sort-day">
          <label class="trip-sort__btn" for="sort-day">Day</label>
        </div>

        <div class="trip-sort__item  trip-sort__item--event" data-sort-type="sort-event">
          <input id="sort-event" class="trip-sort__input  visually-hidden" type="radio" name="trip-sort" value="sort-event" disabled data-sort-type="sort-event">
          <label class="trip-sort__btn" for="sort-event">Event</label>
        </div>

        <div class="trip-sort__item  trip-sort__item--time" data-sort-type="sort-time">
          <input id="sort-time" class="trip-sort__input  visually-hidden" type="radio" name="trip-sort" value="sort-time" data-sort-type="sort-time">
          <label class="trip-sort__btn" for="sort-time">Time</label>
        </div>

        <div class="trip-sort__item  trip-sort__item--price" data-sort-type="sort-price">
          <input id="sort-price" class="trip-sort__input  visually-hidden" type="radio" name="trip-sort" value="sort-price" data-sort-type="sort-price">
          <label class="trip-sort__btn" for="sort-price">Price</label>
        </div>

        <div class="trip-sort__item  trip-sort__item--offer" data-sort-type="sort-offer">
          <input id="sort-offer" class="trip-sort__input  visually-hidden" type="radio" name="trip-sort" value="sort-offer" disabled data-sort-type="sort-offer">
          <label class="trip-sort__btn" for="sort-offer">Offers</label>
        </div>
      </form>
    `);
  }

  #sortTypeChangeHandler = (evt) => {
    const sortType = evt.target.closest('[data-sort-type]')?.dataset.sortType;

    if (!sortType) {
      return;
    }

    this.#onSortTypeChange?.(sortType);
  };

  #setInnerHandlers() {
    this.element.addEventListener('change', this.#sortTypeChangeHandler);
  }
}
