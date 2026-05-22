import {RenderPosition, render, remove} from '../render.js';
import CreatePointView from '../view/create-point-view.js';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import {POINT_TYPES} from '../mock/point.js';

dayjs.extend(customParseFormat);

const FORM_DATE_FORMAT = 'DD/MM/YY HH:mm';

const UserAction = {
  ADD_POINT: 'add-point',
};

const UpdateType = {
  MINOR: 'minor',
};

export default class CreatePointPresenter {
  #pointsModel = null;
  #eventsList = null;
  #createPointComponent = null;
  #onViewAction = null;
  #onViewClose = null;
  #isDestroyed = false;
  #isSubmitting = false;

  constructor({pointsModel, eventsList, onViewAction, onViewClose}) {
    this.#pointsModel = pointsModel;
    this.#eventsList = eventsList;
    this.#onViewAction = onViewAction;
    this.#onViewClose = onViewClose;
  }

  init() {
    if (this.#createPointComponent) {
      return;
    }

    this.#isDestroyed = false;
    this.#createPointComponent = new CreatePointView(this.#createPointViewModel());
    render(this.#createPointComponent, this.#eventsList, RenderPosition.AFTERBEGIN);

    document.addEventListener('keydown', this.#documentEscKeyDownHandler);
  }

  destroy(silent = false) {
    if (!this.#createPointComponent) {
      return;
    }

    remove(this.#createPointComponent);
    this.#createPointComponent = null;
    this.#isDestroyed = true;
    document.removeEventListener('keydown', this.#documentEscKeyDownHandler);

    if (!this.#isSubmitting && !silent) {
      this.#onViewClose?.();
    }

    this.#isSubmitting = false;
  }

  #createPointViewModel() {
    const pointType = POINT_TYPES.includes(this.#pointsModel.offers[0]?.type) ? this.#pointsModel.offers[0].type : POINT_TYPES[0];
    const destination = this.#pointsModel.destinations[0];
    const now = dayjs();

    return {
      id: 'new-point',
      type: pointType,
      offers: this.#pointsModel.offers,
      destinationName: destination?.name || '',
      destinations: this.#pointsModel.destinations,
      startDate: now.format(FORM_DATE_FORMAT),
      endDate: now.add(1, 'hour').format(FORM_DATE_FORMAT),
      price: '',
      availableOffers: this.#pointsModel.getOffersByType(pointType).map((offer) => ({
        id: offer.id,
        title: offer.title,
        price: offer.price,
        checked: false,
      })),
      description: destination?.description || '',
      pictures: destination?.pictures || [],
      isNewPoint: true,
      onFormSubmit: this.#handleFormSubmit,
      onFormClose: this.#handleFormClose,
    };
  }

  #createPointFromFormState(formState) {
    const destination = this.#pointsModel.destinations.find((item) => item.name === formState.destinationName) ?? this.#pointsModel.destinations[0];
    const selectedOfferIds = formState.availableOffers
      .filter((offer) => offer.checked)
      .map((offer) => offer.id);

    return {
      id: `point-${Date.now()}`,
      basePrice: Number(formState.price) || 0,
      dateFrom: dayjs(formState.startDate, FORM_DATE_FORMAT).toISOString(),
      dateTo: dayjs(formState.endDate, FORM_DATE_FORMAT).toISOString(),
      destination: destination?.id,
      isFavorite: false,
      offers: selectedOfferIds,
      type: formState.type,
    };
  }

  #handleFormSubmit = (formState) => {
    if (this.#isDestroyed) {
      return;
    }

    this.#isSubmitting = true;
    this.#onViewAction?.(UserAction.ADD_POINT, UpdateType.MINOR, this.#createPointFromFormState(formState));
    this.destroy();
  };

  #handleFormClose = () => {
    this.destroy();
  };

  #documentEscKeyDownHandler = (evt) => {
    if (evt.key !== 'Escape') {
      return;
    }

    evt.preventDefault();
    this.destroy();
  };
}
