import Observable from '../framework/observable.js';
import {FilterType} from '../const.js';

const ModelEvent = {
  POINTS_CHANGED: 'points-changed',
};

function filterPoints(points, filterType) {
  const now = new Date();

  switch (filterType) {
    case FilterType.FUTURE:
      return points.filter((point) => new Date(point.dateFrom) > now);
    case FilterType.PRESENT:
      return points.filter((point) => new Date(point.dateFrom) <= now && new Date(point.dateTo) >= now);
    case FilterType.PAST:
      return points.filter((point) => new Date(point.dateTo) < now);
    case FilterType.EVERYTHING:
    default:
      return points;
  }
}

export default class PointsModel extends Observable {
  #apiService = null;
  #points = [];
  #offers = [];
  #destinations = [];

  constructor(apiService) {
    super();

    this.#apiService = apiService;
  }

  async init() {
    try {
      const [points, destinations, offers] = await Promise.all([
        this.#apiService.getPoints(),
        this.#apiService.getDestinations(),
        this.#apiService.getOffers(),
      ]);

      this.#points = points;
      this.#destinations = destinations;
      this.#offers = offers;
    } catch {
      this.#points = [];
      this.#offers = [];
      this.#destinations = [];
    }
  }

  getPoints(filterType = FilterType.EVERYTHING) {
    return filterPoints(this.#points, filterType);
  }

  get destinations() {
    return this.#destinations;
  }

  get offers() {
    return this.#offers;
  }

  getDestinationById(destinationId) {
    return this.#destinations.find((destination) => destination.id === destinationId);
  }

  getOffersByType(type) {
    return this.#offers.filter((offer) => offer.type === type);
  }

  getOfferById(offerId) {
    return this.#offers.find((offer) => offer.id === offerId);
  }

  addPoint(point) {
    this.#points = [structuredClone(point), ...this.#points];
    this._notify(ModelEvent.POINTS_CHANGED);
  }

  async updatePoint(updatedPoint) {
    const serverUpdatedPoint = await this.#apiService.updatePoint(updatedPoint);

    this.#points = this.#points.map((point) => (point.id === serverUpdatedPoint.id ? serverUpdatedPoint : point));
    this._notify(ModelEvent.POINTS_CHANGED);
  }

  deletePoint(pointId) {
    this.#points = this.#points.filter((point) => point.id !== pointId);
    this._notify(ModelEvent.POINTS_CHANGED);
  }
}
