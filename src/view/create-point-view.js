import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import {POINT_TYPES} from '../const.js';
import {
  capitalizeType,
  createOfferSelector,
  createTypeItem,
  getDestinationByName,
  getOffersByType,
} from './point-form-utils.js';

const DEFAULT_POINT_TYPE = 'flight';

const EMPTY_CREATE_POINT = {
  id: 'new-point',
  type: DEFAULT_POINT_TYPE,
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
  isNewPoint: true,
  isDisabled: false,
  saveButtonText: 'Save',
};

export default class CreatePointView extends AbstractStatefulView {
  #onFormSubmit = null;
  #onFormClose = null;

  constructor(createPoint = EMPTY_CREATE_POINT) {
    super();
    this._setState({
      ...EMPTY_CREATE_POINT,
      ...createPoint,
      pointTypes: createPoint.pointTypes ?? POINT_TYPES,
      availableOffers: createPoint.availableOffers ?? EMPTY_CREATE_POINT.availableOffers,
    });

    this.#onFormSubmit = createPoint.onFormSubmit;
    this.#onFormClose = createPoint.onFormClose;

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
      isDisabled,
      saveButtonText,
    } = this._state;

    const pointId = id || 'new-point';
    const typeLabel = capitalizeType(type);

    return (`
      <li class="trip-events__item">
        <form class="event event--edit" action="#" method="post">
          <header class="event__header">
            <div class="event__type-wrapper">
              <label class="event__type  event__type-btn" for="event-type-toggle-${pointId}">
                <span class="visually-hidden">Choose event type</span>
                <img class="event__type-icon" width="17" height="17" src="img/icons/${type}.png" alt="Event type icon">
              </label>
              <input class="event__type-toggle  visually-hidden" id="event-type-toggle-${pointId}" type="checkbox"${isDisabled ? ' disabled' : ''}>

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
              <input class="event__input  event__input--destination" id="event-destination-${pointId}" type="text" name="event-destination" value="${destinationName}" list="destination-list-${pointId}"${isDisabled ? ' disabled' : ''}>
              <datalist id="destination-list-${pointId}">
                ${destinations.map((destination) => `<option value="${destination.name}"></option>`).join('')}
              </datalist>
            </div>

            <div class="event__field-group  event__field-group--time">
              <label class="visually-hidden" for="event-start-time-${pointId}">From</label>
              <input class="event__input  event__input--time" id="event-start-time-${pointId}" type="text" name="event-start-time" value="${startDate}"${isDisabled ? ' disabled' : ''}>
              &mdash;
              <label class="visually-hidden" for="event-end-time-${pointId}">To</label>
              <input class="event__input  event__input--time" id="event-end-time-${pointId}" type="text" name="event-end-time" value="${endDate}"${isDisabled ? ' disabled' : ''}>
            </div>

            <div class="event__field-group  event__field-group--price">
              <label class="event__label" for="event-price-${pointId}">
                <span class="visually-hidden">Price</span>
                &euro;
              </label>
              <input class="event__input  event__input--price" id="event-price-${pointId}" type="number" min="0" step="1" inputmode="numeric" name="event-price" value="${price}"${isDisabled ? ' disabled' : ''}>
            </div>

            <button class="event__save-btn  btn  btn--blue" type="submit"${isDisabled ? ' disabled' : ''}>${saveButtonText}</button>
            <button class="event__reset-btn" type="reset"${isDisabled ? ' disabled' : ''}>Cancel</button>
          </header>

          <section class="event__details">
            <section class="event__section  event__section--offers">
              <h3 class="event__section-title  event__section-title--offers">Offers</h3>

              <div class="event__available-offers">
                ${availableOffers.map((offer) => createOfferSelector(offer, pointId, isDisabled)).join('')}
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
    this.#onFormSubmit?.(structuredClone(this._state));
  };

  #formResetHandler = (evt) => {
    evt.preventDefault();
    this.#onFormClose?.();
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
      const price = target.value.replace(/\D/g, '');

      if (price !== target.value) {
        target.value = price;
      }

      this.updateElement({price});
      return;
    }

    if (target.matches('.event__input--time') && target.name === 'event-start-time') {
      this.updateElement({startDate: target.value});
      return;
    }

    if (target.matches('.event__input--time') && target.name === 'event-end-time') {
      this.updateElement({endDate: target.value});
    }
  };

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

  setSaving() {
    this.updateElement({isDisabled: true, saveButtonText: 'Saving...'});
  }

  setAborting() {
    this.shake(() => {
      this.updateElement({isDisabled: false, saveButtonText: 'Save'});
    });
  }

  #setInnerHandlers() {
    const formElement = this.element.querySelector('.event--edit');

    formElement.addEventListener('submit', this.#formSubmitHandler);
    formElement.addEventListener('reset', this.#formResetHandler);
    formElement.addEventListener('change', this.#typeChangeHandler);
    formElement.addEventListener('change', this.#destinationChangeHandler);
    formElement.addEventListener('change', this.#offerChangeHandler);
    formElement.addEventListener('input', this.#inputHandler);
  }

  _restoreHandlers() {
    this.#setInnerHandlers();
  }
}
