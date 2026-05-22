import {RenderPosition, render, replace} from '../render.js';
import RoutePointView from '../view/route-point-view.js';
import EditPointView from '../view/edit-point-view.js';

const POINT_TYPES = [
  'taxi',
  'bus',
  'train',
  'ship',
  'drive',
  'flight',
  'check-in',
  'sightseeing',
  'restaurant',
];

function formatShortDate(dateString) {
  return new Date(dateString)
    .toLocaleDateString('en-US', {month: 'short', day: '2-digit'})
    .toUpperCase();
}

function formatTime(dateString) {
  return new Date(dateString).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function formatDuration(dateFrom, dateTo) {
  const durationInMinutes = Math.round((new Date(dateTo) - new Date(dateFrom)) / (1000 * 60));
  const hours = Math.floor(durationInMinutes / 60);
  const minutes = durationInMinutes % 60;

  if (!hours) {
    return `${minutes}M`;
  }

  return `${String(hours).padStart(2, '0')}H ${String(minutes).padStart(2, '0')}M`;
}

function formatDateForForm(dateString) {
  if (!dateString) {
    return '';
  }

  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${day}/${month}/${year} ${hours}:${minutes}`;
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

  constructor({point, pointsModel, eventsList, onBeforeEdit}) {
    this.#point = point;
    this.#pointsModel = pointsModel;
    this.#eventsList = eventsList;
    this.#onBeforeEdit = onBeforeEdit;
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
      destinationName: destination?.name || '',
      destinations: this.#pointsModel.destinations.map((item) => item.name),
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
    this.#point = {
      ...this.#point,
      isFavorite: updatedRoutePoint.favorite,
    };

    this.#pointsModel.updatePoint(this.#point);

    const updatedRoutePointComponent = this.#createRoutePointComponent();

    if (this.#isEditing) {
      this.#routePointComponent = updatedRoutePointComponent;

      return;
    }

    replace(updatedRoutePointComponent, this.#routePointComponent);
    this.#routePointComponent = updatedRoutePointComponent;
  };

  #handleEditClick = () => {
    this.replacePointToForm();
  };

  #handleFormSubmit = () => {
    this.replaceFormToPoint();
  };

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
    });
  }
}
