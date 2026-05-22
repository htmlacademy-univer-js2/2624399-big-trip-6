import {RenderPosition, render, replace} from '../render.js';
import RoutePointView from '../view/route-point-view.js';
import EditPointView from '../view/edit-point-view.js';
import {POINT_TYPES} from '../mock/point.js';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';

dayjs.extend(customParseFormat);

const FORM_DATE_FORMAT = 'DD/MM/YY HH:mm';

const UserAction = {
  UPDATE_POINT: 'update-point',
  DELETE_POINT: 'delete-point',
};

const UpdateType = {
  PATCH: 'patch',
  MINOR: 'minor',
};

const DATE_LABEL_FORMAT = 'MMM DD';
const TIME_FORMAT = 'HH:mm';

function formatShortDate(dateString) {
  return dayjs(dateString).format(DATE_LABEL_FORMAT).toUpperCase();
}

function formatTime(dateString) {
  return dayjs(dateString).format(TIME_FORMAT);
}

function formatDuration(dateFrom, dateTo) {
  const durationInMinutes = dayjs(dateTo).diff(dayjs(dateFrom), 'minute');
  const days = Math.floor(durationInMinutes / (24 * 60));
  const hours = Math.floor((durationInMinutes % (24 * 60)) / 60);
  const minutes = durationInMinutes % 60;

  if (!days && !hours) {
    return `${minutes}M`;
  }

  if (!days) {
    return `${String(hours).padStart(2, '0')}H ${String(minutes).padStart(2, '0')}M`;
  }

  return `${String(days).padStart(2, '0')}D ${String(hours).padStart(2, '0')}H ${String(minutes).padStart(2, '0')}M`;
}

function formatDateForForm(dateString) {
  if (!dateString) {
    return '';
  }

  return dayjs(dateString).format(FORM_DATE_FORMAT);
}

function capitalizeType(type) {
  return type
    .split('-')
    .map((part) => `${part[0].toUpperCase()}${part.slice(1)}`)
    .join('-');
}

export default class RoutePointPresenter {
  #pointsModel = null;
  #eventsList = null;
  #point = null;
  #routePointComponent = null;
  #editPointComponent = null;
  #isEditing = false;
  #onBeforeEdit = null;
  #onViewAction = null;

  constructor({point, pointsModel, eventsList, onBeforeEdit, onViewAction}) {
    this.#point = point;
    this.#pointsModel = pointsModel;
    this.#eventsList = eventsList;
    this.#onBeforeEdit = onBeforeEdit;
    this.#onViewAction = onViewAction;
  }

  init() {
    this.#routePointComponent = this.#createRoutePointComponent();
    render(this.#routePointComponent, this.#eventsList, RenderPosition.BEFOREEND);
  }

  resetView() {
    if (this.#isEditing) {
      this.replaceFormToPoint();
    }
  }

  replacePointToForm = () => {
    this.#onBeforeEdit?.();

    this.#editPointComponent = this.#createEditPointComponent();
    replace(this.#editPointComponent, this.#routePointComponent);
    this.#isEditing = true;

    document.addEventListener('keydown', this.#documentEscKeyDownHandler);
  };

  replaceFormToPoint = () => {
    replace(this.#routePointComponent, this.#editPointComponent);
    this.#isEditing = false;

    document.removeEventListener('keydown', this.#documentEscKeyDownHandler);
  };

  #createRoutePointViewModel() {
    const destination = this.#pointsModel.getDestinationById(this.#point.destination);
    const offers = this.#point.offers
      .map((offerId) => this.#pointsModel.getOfferById(offerId))
      .filter(Boolean)
      .map((offer) => ({
        title: offer.title,
        price: offer.price,
      }));

    return {
      date: this.#point.dateFrom.slice(0, 10),
      dateLabel: formatShortDate(this.#point.dateFrom),
      icon: `img/icons/${this.#point.type}.png`,
      title: `${capitalizeType(this.#point.type)} ${destination?.name || ''}`.trim(),
      start: this.#point.dateFrom,
      startLabel: formatTime(this.#point.dateFrom),
      end: this.#point.dateTo,
      endLabel: formatTime(this.#point.dateTo),
      duration: formatDuration(this.#point.dateFrom, this.#point.dateTo),
      price: this.#point.basePrice,
      favorite: this.#point.isFavorite,
      offers,
    };
  }

  #createEditPointViewModel() {
    const pointType = this.#point?.type || POINT_TYPES[0];
    const destination = this.#pointsModel.getDestinationById(this.#point.destination);
    const availableOffers = this.#pointsModel
      .getOffersByType(pointType)
      .map((offer) => ({
        id: offer.id,
        title: offer.title,
        price: offer.price,
        checked: Boolean(this.#point.offers.includes(offer.id)),
      }));

    return {
      id: this.#point?.id,
      type: pointType,
      pointTypes: POINT_TYPES,
      offers: this.#pointsModel.offers,
      destinationName: destination?.name || '',
      destinations: this.#pointsModel.destinations,
      startDate: formatDateForForm(this.#point?.dateFrom),
      endDate: formatDateForForm(this.#point?.dateTo),
      price: this.#point?.basePrice ?? '',
      availableOffers,
      description: destination?.description || '',
      pictures: destination?.pictures || [],
      isNewPoint: false,
    };
  }

  #handleFavoriteClick = (updatedRoutePoint) => {
    const updatedPoint = {
      ...this.#point,
      isFavorite: updatedRoutePoint.favorite,
    };

    this.#onViewAction?.(UserAction.UPDATE_POINT, UpdateType.PATCH, updatedPoint);
  };

  #handleEditClick = () => {
    this.replacePointToForm();
  };

  #handleFormSubmit = (updatedFormState) => {
    this.#onViewAction?.(UserAction.UPDATE_POINT, UpdateType.MINOR, this.#createPointFromFormState(updatedFormState));
  };

  #handleDeleteClick = (deletedFormState) => {
    this.#onViewAction?.(UserAction.DELETE_POINT, UpdateType.MINOR, this.#createPointFromFormState(deletedFormState));
  };

  #createPointFromFormState(formState) {
    const destination = this.#pointsModel.getDestinationById(
      this.#pointsModel.destinations.find((item) => item.name === formState.destinationName)?.id,
    ) || this.#pointsModel.getDestinationById(this.#point.destination);
    const selectedOfferIds = formState.availableOffers
      .filter((offer) => offer.checked)
      .map((offer) => offer.id);

    return {
      id: formState.id,
      basePrice: Number(formState.price) || 0,
      dateFrom: dayjs(formState.startDate, FORM_DATE_FORMAT).toISOString(),
      dateTo: dayjs(formState.endDate, FORM_DATE_FORMAT).toISOString(),
      destination: destination?.id || this.#point.destination,
      isFavorite: this.#point.isFavorite,
      offers: selectedOfferIds,
      type: formState.type,
    };
  }

  #documentEscKeyDownHandler = (evt) => {
    if (evt.key !== 'Escape') {
      return;
    }

    evt.preventDefault();
    this.replaceFormToPoint();
  };

  #createRoutePointComponent() {
    return new RoutePointView(this.#createRoutePointViewModel(), {
      onEditClick: this.#handleEditClick,
      onFavoriteClick: this.#handleFavoriteClick,
    });
  }

  #createEditPointComponent() {
    return new EditPointView(this.#createEditPointViewModel(), {
      onFormSubmit: this.#handleFormSubmit,
      onRollupClick: this.#handleFormSubmit,
      onDeleteClick: this.#handleDeleteClick,
    });
  }
}
