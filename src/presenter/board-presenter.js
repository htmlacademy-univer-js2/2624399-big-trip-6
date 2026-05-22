import {RenderPosition, render} from '../render.js';
import {generateFilters} from '../mock/filter.js';
import FilterView from '../view/filter-view.js';
import SortView from '../view/sort-view.js';
import EventsListView from '../view/events-list-view.js';
import NoPointView from '../view/no-point-view.js';
import RoutePointPresenter from './route-point-presenter.js';

const SortType = {
  DAY: 'sort-day',
  TIME: 'sort-time',
  PRICE: 'sort-price',
};

function sortPointsByDate(points) {
  return [...points].sort((pointA, pointB) => new Date(pointA.dateFrom) - new Date(pointB.dateFrom));
}

function getPointDuration(point) {
  return new Date(point.dateTo) - new Date(point.dateFrom);
}

function sortPointsByDuration(points) {
  return [...points].sort((pointA, pointB) => getPointDuration(pointB) - getPointDuration(pointA));
}

function sortPointsByPrice(points) {
  return [...points].sort((pointA, pointB) => pointB.basePrice - pointA.basePrice);
}

export default class BoardPresenter {
  #pointsModel = null;
  #filtersContainer = null;
  #eventsContainer = null;
  #eventsList = null;
  #routePointPresenters = [];
  #sortType = SortType.DAY;

  constructor({pointsModel}) {
    this.#pointsModel = pointsModel;
    this.#filtersContainer = document.querySelector('.trip-controls__filters');
    this.#eventsContainer = document.querySelector('.trip-events');
  }

  #resetRoutePointsView() {
    this.#routePointPresenters.forEach((presenter) => presenter.resetView());
  }

  #clearRoutePoints() {
    this.#routePointPresenters = [];

    if (this.#eventsList) {
      this.#eventsList.innerHTML = '';
    }
  }

  #getSortedPoints() {
    const points = this.#pointsModel.points;

    switch (this.#sortType) {
      case SortType.TIME:
        return sortPointsByDuration(points);
      case SortType.PRICE:
        return sortPointsByPrice(points);
      case SortType.DAY:
      default:
        return sortPointsByDate(points);
    }
  }

  #renderRoutePoints() {
    const points = this.#getSortedPoints();

    this.#clearRoutePoints();

    points.forEach((point) => {
      const routePointPresenter = new RoutePointPresenter({
        point,
        pointsModel: this.#pointsModel,
        eventsList: this.#eventsList,
        onBeforeEdit: () => this.#resetRoutePointsView(),
      });

      this.#routePointPresenters.push(routePointPresenter);
      routePointPresenter.init();
    });
  }

  #sortTypeChangeHandler = (sortType) => {
    if (this.#sortType === sortType) {
      return;
    }

    this.#sortType = sortType;
    this.#renderRoutePoints();
  };

  init() {
    const points = this.#pointsModel.points;

    this.#routePointPresenters = [];

    const filterView = new FilterView(generateFilters(points));

    render(filterView, this.#filtersContainer, RenderPosition.BEFOREEND);

    if (!points.length) {
      const noPointView = new NoPointView();

      render(noPointView, this.#eventsContainer, RenderPosition.BEFOREEND);
      return;
    }

    const sortView = new SortView({
      onSortTypeChange: this.#sortTypeChangeHandler,
    });
    const eventsListView = new EventsListView();
    const tripEventsTitleElement = this.#eventsContainer.querySelector('.visually-hidden');

    render(sortView, tripEventsTitleElement, RenderPosition.AFTEREND);
    render(eventsListView, this.#eventsContainer, RenderPosition.BEFOREEND);

    this.#eventsList = this.#eventsContainer.querySelector('.trip-events__list');

    this.#renderRoutePoints();
  }
}
