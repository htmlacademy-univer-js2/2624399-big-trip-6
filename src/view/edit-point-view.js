import View from './view.js';

const EMPTY_EDIT_POINT = {
  id: 'new-point',
  type: 'taxi',
  pointTypes: ['taxi', 'bus', 'train', 'ship', 'drive', 'flight', 'check-in', 'sightseeing', 'restaurant'],
  destinationName: '',
  destinations: [],
  startDate: '',
  endDate: '',
  price: '',
  availableOffers: [],
  description: '',
  pictures: [],
  isNewPoint: false,
};

function capitalizeType(type) {
  return type
    .split('-')
    .map((part) => `${part[0].toUpperCase()}${part.slice(1)}`)
    .join('-');
}

function createOfferSelector(offer, pointId) {
  const inputId = `event-offer-${offer.id}-${pointId}`;

  return (`
    <div class="event__offer-selector">
      <input class="event__offer-checkbox  visually-hidden" id="${inputId}" type="checkbox" name="event-offer-${offer.id}"${offer.checked ? ' checked' : ''}>
      <label class="event__offer-label" for="${inputId}">
        <span class="event__offer-title">${offer.title}</span>
        &plus;&euro;&nbsp;
        <span class="event__offer-price">${offer.price}</span>
      </label>
    </div>
  `);
}

function createTypeItem(type, currentType, pointId) {
  const inputId = `event-type-${type}-${pointId}`;

  return (`
    <div class="event__type-item">
      <input id="${inputId}" class="event__type-input  visually-hidden" type="radio" name="event-type" value="${type}"${type === currentType ? ' checked' : ''}>
      <label class="event__type-label  event__type-label--${type}" for="${inputId}">${capitalizeType(type)}</label>
    </div>
  `);
}

export default class EditPointView extends View {
  #editPoint = EMPTY_EDIT_POINT;
  #onFormSubmit = null;
  #onRollupClick = null;

  constructor(editPoint = EMPTY_EDIT_POINT, {onFormSubmit, onRollupClick} = {}) {
    super();
    this.#editPoint = editPoint;
    this.#onFormSubmit = onFormSubmit;
    this.#onRollupClick = onRollupClick;

    this.#setInnerHandlers();
  }

  get template() {
    const {
      id,
      type,
      pointTypes,
      destinationName,
      destinations,
      startDate,
      endDate,
      price,
      availableOffers,
      description,
      pictures,
      isNewPoint,
    } = this.#editPoint;

    const pointId = id || 'new-point';
    const typeLabel = capitalizeType(type);
    const resetButtonLabel = isNewPoint ? 'Cancel' : 'Delete';

    return (`
      <li class="trip-events__item">
        <form class="event event--edit" action="#" method="post">
          <header class="event__header">
            <div class="event__type-wrapper">
              <label class="event__type  event__type-btn" for="event-type-toggle-${pointId}">
                <span class="visually-hidden">Choose event type</span>
                <img class="event__type-icon" width="17" height="17" src="img/icons/${type}.png" alt="Event type icon">
              </label>
              <input class="event__type-toggle  visually-hidden" id="event-type-toggle-${pointId}" type="checkbox">

              <div class="event__type-list">
                <fieldset class="event__type-group">
                  <legend class="visually-hidden">Event type</legend>
                  ${pointTypes.map((pointType) => createTypeItem(pointType, type, pointId)).join('')}
                </fieldset>
              </div>
            </div>

            <div class="event__field-group  event__field-group--destination">
              <label class="event__label  event__type-output" for="event-destination-${pointId}">
                ${typeLabel}
              </label>
              <input class="event__input  event__input--destination" id="event-destination-${pointId}" type="text" name="event-destination" value="${destinationName}" list="destination-list-${pointId}">
              <datalist id="destination-list-${pointId}">
                ${destinations.map((destination) => `<option value="${destination}"></option>`).join('')}
              </datalist>
            </div>

            <div class="event__field-group  event__field-group--time">
              <label class="visually-hidden" for="event-start-time-${pointId}">From</label>
              <input class="event__input  event__input--time" id="event-start-time-${pointId}" type="text" name="event-start-time" value="${startDate}">
              &mdash;
              <label class="visually-hidden" for="event-end-time-${pointId}">To</label>
              <input class="event__input  event__input--time" id="event-end-time-${pointId}" type="text" name="event-end-time" value="${endDate}">
            </div>

            <div class="event__field-group  event__field-group--price">
              <label class="event__label" for="event-price-${pointId}">
                <span class="visually-hidden">Price</span>
                &euro;
              </label>
              <input class="event__input  event__input--price" id="event-price-${pointId}" type="text" name="event-price" value="${price}">
            </div>

            <button class="event__save-btn  btn  btn--blue" type="submit">Save</button>
            <button class="event__reset-btn" type="reset">${resetButtonLabel}</button>
            ${isNewPoint ? '' : `
              <button class="event__rollup-btn" type="button">
                <span class="visually-hidden">Open event</span>
              </button>
            `}
          </header>

          <section class="event__details">
            <section class="event__section  event__section--offers">
              <h3 class="event__section-title  event__section-title--offers">Offers</h3>

              <div class="event__available-offers">
                ${availableOffers.map((offer) => createOfferSelector(offer, pointId)).join('')}
              </div>
            </section>

            <section class="event__section  event__section--destination">
              <h3 class="event__section-title  event__section-title--destination">Destination</h3>
              <p class="event__destination-description">${description}</p>

              <div class="event__photos-container">
                <div class="event__photos-tape">
                  ${pictures.map((picture) => `<img class="event__photo" src="${picture.src}" alt="${picture.description}">`).join('')}
                </div>
              </div>
            </section>
          </section>
        </form>
      </li>
    `);
  }

  #formSubmitHandler = (evt) => {
    evt.preventDefault();
    this.#onFormSubmit?.();
  };

  #rollupClickHandler = (evt) => {
    evt.preventDefault();
    this.#onRollupClick?.();
  };

  #setInnerHandlers() {
    const formElement = this.element.querySelector('.event--edit');
    const rollupButton = this.element.querySelector('.event__rollup-btn');

    formElement.addEventListener('submit', this.#formSubmitHandler);

    if (rollupButton) {
      rollupButton.addEventListener('click', this.#rollupClickHandler);
    }
  }
}
