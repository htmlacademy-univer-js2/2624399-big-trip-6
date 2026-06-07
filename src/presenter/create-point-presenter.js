import {RenderPosition, render, remove} from '../render.js';
import CreatePointView from '../view/create-point-view.js';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';

dayjs.extend(customParseFormat);

const FORM_DATE_FORMAT = 'DD/MM/YY HH:mm';
const DEFAULT_POINT_TYPE = 'flight';

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
    this.#createPointComponent = new CreatePointView(this.#createPointViewModel(), {
      onFormSubmit: this.#handleFormSubmit,
      onFormClose: this.#handleFormClose,
    });
    render(this.#createPointComponent, this.#eventsList, RenderPosition.AFTERBEGIN);
    this.#createPointComponent.initDatePickers();

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
    const pointType = DEFAULT_POINT_TYPE;

    return {
      id: 'new-point',
      type: pointType,
      offers: this.#pointsModel.offers,
      destinationName: '',
      destinations: this.#pointsModel.destinations,
      startDate: '',
      endDate: '',
      price: 0,
      availableOffers: this.#pointsModel.getOffersByType(pointType).map((offer) => ({
        id: offer.id,
        title: offer.title,
        price: offer.price,
        checked: false,
      })),
      description: '',
      pictures: [],
      isNewPoint: true,
    };
  }

  #createPointFromFormState(formState = {}) {
    const destinationName = formState.destinationName ?? '';
    const availableOffers = formState.availableOffers ?? [];
    const destination = this.#pointsModel.destinations.find((item) => item.name === destinationName) ?? this.#pointsModel.destinations[0];
    const selectedOfferIds = availableOffers
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
    if (this.#isDestroyed || this.#isSubmitting) {
      return;
    }

    this.#isSubmitting = true;
    this.#createPointComponent?.setSaving();

    const actionPromise = this.#onViewAction?.(UserAction.ADD_POINT, UpdateType.MINOR, this.#createPointFromFormState(formState));

    Promise.resolve(actionPromise)
      .catch(() => {
        this.#createPointComponent?.setAborting();
      })
      .finally(() => {
        this.#isSubmitting = false;
      });
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
