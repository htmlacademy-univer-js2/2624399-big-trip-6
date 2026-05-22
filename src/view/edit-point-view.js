import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import {POINT_TYPES} from '../mock/point.js';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import {
  capitalizeType,
  createOfferSelector,
  createTypeItem,
  getDestinationByName,
  getOffersByType,
} from './point-form-utils.js';

const DATE_FORMAT = 'd/m/y H:i';

const EMPTY_EDIT_POINT = {
  id: 'new-point',
  type: POINT_TYPES[0],
  pointTypes: POINT_TYPES,
  offers: [],
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

export default class EditPointView extends AbstractStatefulView {
  #onFormSubmit = null;
  #onRollupClick = null;
  #startDatePicker = null;
  #endDatePicker = null;

  constructor(editPoint = EMPTY_EDIT_POINT, {onFormSubmit, onRollupClick} = {}) {
    super();
    this._setState({
      ...EMPTY_EDIT_POINT,
      ...editPoint,
      pointTypes: editPoint.pointTypes ?? POINT_TYPES,
      availableOffers: editPoint.availableOffers ?? getOffersByType(editPoint.offers ?? [], editPoint.type ?? POINT_TYPES[0]),
    });
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
    } = this._state;

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
                ${destinations.map((destination) => `<option value="${destination.name}"></option>`).join('')}
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

  #typeChangeHandler = (evt) => {
    const {target} = evt;

    if (!target.matches('.event__type-input') || !target.checked) {
      return;
    }

    this.updateElement({
      type: target.value,
      availableOffers: getOffersByType(this._state.offers, target.value),
    });
  };

  #destinationChangeHandler = (evt) => {
    const {target} = evt;

    if (!target.matches('.event__input--destination')) {
      return;
    }

    const destination = getDestinationByName(this._state.destinations, target.value);

    this.updateElement({
      destinationName: target.value,
      description: destination?.description || '',
      pictures: destination?.pictures || [],
    });
  };

  #inputHandler = (evt) => {
    const {target} = evt;

    if (target.matches('.event__input--destination')) {
      const destination = getDestinationByName(this._state.destinations, target.value);

      this.updateElement({
        destinationName: target.value,
        description: destination?.description || '',
        pictures: destination?.pictures || [],
      });

      return;
    }

    if (target.matches('.event__input--price')) {
      this.updateElement({price: target.value});
      return;
    }
  };

  #dateChangeHandler = (fieldName) => (_selectedDates, dateString) => {
    this.updateElement({[fieldName]: dateString});
  };

  #destroyDatePickers() {
    this.#startDatePicker?.destroy();
    this.#endDatePicker?.destroy();
    this.#startDatePicker = null;
    this.#endDatePicker = null;
  }

  #setDatePickers() {
    const pointId = this._state.id || 'new-point';
    const startDateElement = this.element.querySelector(`#event-start-time-${pointId}`);
    const endDateElement = this.element.querySelector(`#event-end-time-${pointId}`);

    this.#startDatePicker = flatpickr(startDateElement, {
      dateFormat: DATE_FORMAT,
      enableTime: true,
      allowInput: true,
      time_24hr: true,
      defaultDate: this._state.startDate || null,
      onChange: this.#dateChangeHandler('startDate'),
    });

    this.#endDatePicker = flatpickr(endDateElement, {
      dateFormat: DATE_FORMAT,
      enableTime: true,
      allowInput: true,
      time_24hr: true,
      defaultDate: this._state.endDate || null,
      onChange: this.#dateChangeHandler('endDate'),
    });
  }

  #offerChangeHandler = (evt) => {
    const {target} = evt;

    if (!target.matches('.event__offer-checkbox')) {
      return;
    }

    const offerId = target.dataset.offerId;

    this.updateElement({
      availableOffers: this._state.availableOffers.map((offer) => (
        offer.id === offerId
          ? {...offer, checked: target.checked}
          : offer
      )),
    });
  };

  #setInnerHandlers() {
    const formElement = this.element.querySelector('.event--edit');
    const rollupButton = this.element.querySelector('.event__rollup-btn');

    formElement.addEventListener('submit', this.#formSubmitHandler);
    formElement.addEventListener('change', this.#typeChangeHandler);
    formElement.addEventListener('change', this.#destinationChangeHandler);
    formElement.addEventListener('change', this.#offerChangeHandler);
    formElement.addEventListener('input', this.#inputHandler);

    if (rollupButton) {
      rollupButton.addEventListener('click', this.#rollupClickHandler);
    }

    this.#destroyDatePickers();
    this.#setDatePickers();
  }

  removeElement() {
    this.#destroyDatePickers();
    super.removeElement();
  }

  _restoreHandlers() {
    this.#setInnerHandlers();
  }
}
