import {RenderPosition, render} from '../render.js';
import FilterView from '../view/filter-view.js';
import SortView from '../view/sort-view.js';
import EventsListView from '../view/events-list-view.js';
import EditPointView from '../view/edit-point-view.js';
import RoutePointView from '../view/route-point-view.js';

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

export default class BoardPresenter {
  constructor({pointsModel}) {
    this._pointsModel = pointsModel;
    this._filtersContainer = document.querySelector('.trip-controls__filters');
    this._eventsContainer = document.querySelector('.trip-events');
    this._eventsList = null;
  }

  _createRoutePointViewModel(point) {
    const destination = this._pointsModel.getDestinationById(point.destination);
    const offers = point.offers
      .map((offerId) => this._pointsModel.getOfferById(offerId))
      .filter(Boolean)
      .map((offer) => ({
        title: offer.title,
        price: offer.price,
      }));

    return {
      date: point.dateFrom.slice(0, 10),
      dateLabel: formatShortDate(point.dateFrom),
      icon: `img/icons/${point.type}.png`,
      title: `${capitalizeType(point.type)} ${destination?.name || ''}`.trim(),
      start: point.dateFrom,
      startLabel: formatTime(point.dateFrom),
      end: point.dateTo,
      endLabel: formatTime(point.dateTo),
      duration: formatDuration(point.dateFrom, point.dateTo),
      price: point.basePrice,
      favorite: point.isFavorite,
      offers,
    };
  }

  _createEditPointViewModel(point = null, isNewPoint = false) {
    const pointType = point?.type || POINT_TYPES[0];
    const destination = point ? this._pointsModel.getDestinationById(point.destination) : null;
    const availableOffers = this._pointsModel
      .getOffersByType(pointType)
      .map((offer) => ({
        id: offer.id,
        title: offer.title,
        price: offer.price,
        checked: Boolean(point?.offers.includes(offer.id)),
      }));

    return {
      id: point?.id,
      type: pointType,
      pointTypes: POINT_TYPES,
      destinationName: destination?.name || '',
      destinations: this._pointsModel.destinations.map((item) => item.name),
      startDate: formatDateForForm(point?.dateFrom),
      endDate: formatDateForForm(point?.dateTo),
      price: point?.basePrice ?? '',
      availableOffers,
      description: destination?.description || '',
      pictures: destination?.pictures || [],
      isNewPoint,
    };
  }

  init() {
    const points = this._pointsModel.points;

    const filterView = new FilterView();
    const sortView = new SortView();
    const eventsListView = new EventsListView();
    const newPointView = new EditPointView(this._createEditPointViewModel(null, true));
    const editPointView = new EditPointView(this._createEditPointViewModel(points[0]));

    render(filterView, this._filtersContainer, RenderPosition.BEFOREEND);

    const tripEventsTitleElement = this._eventsContainer.querySelector('.visually-hidden');

    render(sortView, tripEventsTitleElement, RenderPosition.AFTEREND);
    render(eventsListView, this._eventsContainer, RenderPosition.BEFOREEND);

    this._eventsList = this._eventsContainer.querySelector('.trip-events__list');

    render(newPointView, this._eventsList, RenderPosition.BEFOREEND);
    render(editPointView, this._eventsList, RenderPosition.BEFOREEND);

    points.forEach((point) => {
      render(new RoutePointView(this._createRoutePointViewModel(point)), this._eventsList, RenderPosition.BEFOREEND);
    });
  }
}
