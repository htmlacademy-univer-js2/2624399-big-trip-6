import {RenderPosition, render} from '../render.js';
import {generateFilters} from '../mock/filter.js';
import FilterView from '../view/filter-view.js';
import SortView from '../view/sort-view.js';
import EventsListView from '../view/events-list-view.js';
import NoPointView from '../view/no-point-view.js';
import RoutePointPresenter from './route-point-presenter.js';

export default class BoardPresenter {
  #pointsModel = null;
  #filtersContainer = null;
  #eventsContainer = null;
  #eventsList = null;
  #routePointPresenters = [];

  constructor({pointsModel}) {
    this.#pointsModel = pointsModel;
    this.#filtersContainer = document.querySelector('.trip-controls__filters');
    this.#eventsContainer = document.querySelector('.trip-events');
  }

  #resetRoutePointsView() {
    this.#routePointPresenters.forEach((presenter) => presenter.resetView());
  }

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

    const sortView = new SortView();
    const eventsListView = new EventsListView();
    const tripEventsTitleElement = this.#eventsContainer.querySelector('.visually-hidden');

    render(sortView, tripEventsTitleElement, RenderPosition.AFTEREND);
    render(eventsListView, this.#eventsContainer, RenderPosition.BEFOREEND);

    this.#eventsList = this.#eventsContainer.querySelector('.trip-events__list');

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
}
