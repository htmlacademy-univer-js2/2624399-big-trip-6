import ApiService from './api-service.js';
import {
  adaptDestinationsFromServer,
  adaptOffersFromServer,
  adaptPointFromServer,
  adaptPointToServer,
} from './adapters.js';

export default class BigTripApiService extends ApiService {
  async getPoints() {
    const response = await this._load({url: 'points'});
    const points = await ApiService.parseResponse(response);

    return points.map(adaptPointFromServer);
  }

  async getDestinations() {
    const response = await this._load({url: 'destinations'});
    const destinations = await ApiService.parseResponse(response);

    return adaptDestinationsFromServer(destinations);
  }

  async getOffers() {
    const response = await this._load({url: 'offers'});
    const offers = await ApiService.parseResponse(response);

    return adaptOffersFromServer(offers);
  }

  async updatePoint(point) {
    const response = await this._load({
      url: `points/${point.id}`,
      method: 'PUT',
      body: JSON.stringify(adaptPointToServer(point)),
      headers: new Headers({'Content-Type': 'application/json'}),
    });

    const updatedPoint = await ApiService.parseResponse(response);

    return adaptPointFromServer(updatedPoint);
  }
}
