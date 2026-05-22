import View from './view.js';

const EMPTY_ROUTE_POINT = {
  date: '',
  dateLabel: '',
  icon: 'img/icons/taxi.png',
  title: '',
  start: '',
  startLabel: '',
  end: '',
  endLabel: '',
  duration: '',
  price: '',
  favorite: false,
  offers: [],
};

function createOffersMarkup(offers) {
  if (!offers.length) {
    return '';
  }

  return (`
    <h4 class="visually-hidden">Offers:</h4>
    <ul class="event__selected-offers">
      ${offers.map((offer) => (`
        <li class="event__offer">
          <span class="event__offer-title">${offer.title}</span>
          &plus;&euro;&nbsp;
          <span class="event__offer-price">${offer.price}</span>
        </li>
      `)).join('')}
    </ul>
  `);
}

export default class RoutePointView extends View {
  #routePoint = EMPTY_ROUTE_POINT;
  #onEditClick = null;
  #onFavoriteClick = null;

  constructor(routePoint = EMPTY_ROUTE_POINT, {onEditClick, onFavoriteClick} = {}) {
    super();
    this.#routePoint = routePoint;
    this.#onEditClick = onEditClick;
    this.#onFavoriteClick = onFavoriteClick;

    this.#setInnerHandlers();
  }

  get template() {
    const {date, dateLabel, icon, title, start, startLabel, end, endLabel, duration, price, favorite, offers} = this.#routePoint;
    const favoriteClass = favorite ? ' event__favorite-btn--active' : '';

    return (`
      <li class="trip-events__item">
        <div class="event">
          <time class="event__date" datetime="${date}">${dateLabel}</time>
          <div class="event__type">
            <img class="event__type-icon" width="42" height="42" src="${icon}" alt="Event type icon">
          </div>
          <h3 class="event__title">${title}</h3>
          <div class="event__schedule">
            <p class="event__time">
              <time class="event__start-time" datetime="${start}">${startLabel}</time>
              &mdash;
              <time class="event__end-time" datetime="${end}">${endLabel}</time>
            </p>
            <p class="event__duration">${duration}</p>
          </div>
          <p class="event__price">
            &euro;&nbsp;<span class="event__price-value">${price}</span>
          </p>
          ${createOffersMarkup(offers)}
          <button class="event__favorite-btn${favoriteClass}" type="button">
            <span class="visually-hidden">Add to favorite</span>
            <svg class="event__favorite-icon" width="28" height="28" viewBox="0 0 28 28">
              <path d="M14 21l-8.22899 4.3262 1.57159-9.1631L.685209 9.67376 9.8855 8.33688 14 0l4.1145 8.33688 9.2003 1.33688-6.6574 6.48934 1.5716 9.1631L14 21z"/>
            </svg>
          </button>
          <button class="event__rollup-btn" type="button">
            <span class="visually-hidden">Open event</span>
          </button>
        </div>
      </li>
    `);
  }

  #rollupClickHandler = (evt) => {
    evt.preventDefault();
    this.#onEditClick?.();
  };

  #favoriteClickHandler = (evt) => {
    evt.preventDefault();

    this.#onFavoriteClick?.({
      ...this.#routePoint,
      favorite: !this.#routePoint.favorite,
    });
  };

  #setInnerHandlers() {
    const rollupButton = this.element.querySelector('.event__rollup-btn');
    const favoriteButton = this.element.querySelector('.event__favorite-btn');

    if (!rollupButton) {
      return;
    }

    rollupButton.addEventListener('click', this.#rollupClickHandler);

    if (favoriteButton) {
      favoriteButton.addEventListener('click', this.#favoriteClickHandler);
    }
  }
}
