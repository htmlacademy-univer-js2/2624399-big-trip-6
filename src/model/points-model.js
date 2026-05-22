import {generatePointsData} from '../mock/point.js';

export default class PointsModel {
  constructor() {
    const {points, offers, destinations} = generatePointsData();

    this._points = points;
    this._offers = offers;
    this._destinations = destinations;
  }

  get points() {
    return this._points;
  }

  get destinations() {
    return this._destinations;
  }

  getDestinationById(destinationId) {
    return this._destinations.find((destination) => destination.id === destinationId);
  }

  getOffersByType(type) {
    return this._offers.filter((offer) => offer.type === type);
  }

  getOfferById(offerId) {
    return this._offers.find((offer) => offer.id === offerId);
  }

  updatePoint(updatedPoint) {
    this._points = this._points.map((point) => (point.id === updatedPoint.id ? updatedPoint : point));
  }
}
