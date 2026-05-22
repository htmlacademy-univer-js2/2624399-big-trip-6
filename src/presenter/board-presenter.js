import {RenderPosition, render, replace} from '../render.js';
import {FilterType} from '../const.js';
import SortView from '../view/sort-view.js';
import EventsListView from '../view/events-list-view.js';
import NoPointView from '../view/no-point-view.js';
import TripInfoView from '../view/trip-info-view.js';
import RoutePointPresenter from './route-point-presenter.js';
import CreatePointPresenter from './create-point-presenter.js';
import UiBlocker from '../framework/ui-blocker/ui-blocker.js';
import dayjs from 'dayjs';

const SortType = {
  DAY: 'sort-day',
  TIME: 'sort-time',
  PRICE: 'sort-price',
};

const UserAction = {
  ADD_POINT: 'add-point',
  UPDATE_POINT: 'update-point',
  DELETE_POINT: 'delete-point',
};

const EMPTY_LIST_MESSAGE_BY_FILTER = {
  [FilterType.EVERYTHING]: 'Click New Event to create your first point',
  [FilterType.FUTURE]: 'There are no future events now',
  [FilterType.PRESENT]: 'There are no present events now',
  [FilterType.PAST]: 'There are no past events now',
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

function formatTripDates(points) {
  if (!points.length) {
    return '';
  }

  const sorted = [...points].sort((a, b) => new Date(a.dateFrom) - new Date(b.dateFrom));
  const start = dayjs(sorted[0].dateFrom);
  const end = dayjs(sorted[sorted.length - 1].dateTo);

  if (start.isSame(end, 'month') && start.isSame(end, 'year')) {
    return `${start.format('D')}&nbsp;&mdash;&nbsp;${end.format('D MMM')}`;
  }

  if (start.isSame(end, 'year')) {
    return `${start.format('D MMM')}&nbsp;&mdash;&nbsp;${end.format('D MMM')}`;
  }

  return `${start.format('D MMM YYYY')}&nbsp;&mdash;&nbsp;${end.format('D MMM YYYY')}`;
}

function buildRouteTitle(points, pointsModel) {
  if (!points.length) {
    return '';
  }

  const sorted = [...points].sort((a, b) => new Date(a.dateFrom) - new Date(b.dateFrom));
  const names = [];

  sorted.forEach((point) => {
    const dest = pointsModel.getDestinationById(point.destination);
    const name = dest?.name || '';
    if (!name) {
      return;
    }
    if (names.length === 0 || names[names.length - 1] !== name) {
      names.push(name);
    }
  });

  if (names.length === 0) {
    return '';
  }

  if (names.length > 3) {
    return `${names[0]} &mdash; ... &mdash; ${names[names.length - 1]}`;
  }

  return names.join(' &mdash; ');
}

function calculateTotalPrice(points, pointsModel) {
  return points.reduce((sum, point) => {
    const offersSum = (point.offers || []).reduce((acc, offerId) => {
      const offer = pointsModel.getOfferById(offerId);
      return acc + (offer?.price || 0);
    }, 0);

    return sum + (point.basePrice || 0) + offersSum;
  }, 0);
}

export default class BoardPresenter {
  #pointsModel = null;
  #filterModel = null;
  #eventsContainer = null;
  #eventsList = null;
  #eventsListView = null;
  #sortView = null;
  #tripInfoComponent = null;
  #tripInfoContainer = null;
  #routePointPresenters = [];
  #createPointPresenter = null;
  #sortType = SortType.DAY;
  #uiBlocker = new UiBlocker({lowerLimit: 300, upperLimit: 1000});

  constructor({pointsModel, filterModel}) {
    this.#pointsModel = pointsModel;
    this.#filterModel = filterModel;
    this.#eventsContainer = document.querySelector('.trip-events');
    this.#tripInfoContainer = document.querySelector('.trip-main');
  }

  #resetRoutePointsView() {
    this.#routePointPresenters.forEach((presenter) => presenter.resetView());
  }

  #destroyCreatePointPresenter(silent = false) {
    if (!this.#createPointPresenter) {
      return;
    }

    const createPointPresenter = this.#createPointPresenter;
    this.#createPointPresenter = null;

    if (silent) {
      createPointPresenter.destroy(true);
      return;
    }

    createPointPresenter.destroy();
  }

  #clearBoard() {
    this.#routePointPresenters = [];

    const sortableElements = this.#eventsContainer.querySelectorAll('.trip-events__trip-sort, .trip-events__list, .trip-events__msg');

    sortableElements.forEach((element) => element.remove());

    this.#eventsList = null;
    this.#eventsListView = null;
    this.#sortView = null;
  }

  #getSortedPoints(points) {
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

  #getFilteredPoints() {
    return this.#pointsModel.getPoints(this.#filterModel.getFilter());
  }

  #renderRoutePoints() {
    const points = this.#getSortedPoints(this.#getFilteredPoints());

    points.forEach((point) => {
      const routePointPresenter = new RoutePointPresenter({
        point,
        pointsModel: this.#pointsModel,
        eventsList: this.#eventsList,
        onBeforeEdit: () => {
          this.#destroyCreatePointPresenter(true);
          this.#resetRoutePointsView();
        },
        onViewAction: this.#handleViewAction,
      });

      this.#routePointPresenters.push(routePointPresenter);
      routePointPresenter.init();
    });
  }

  #renderEmptyState() {
    const noPointView = new NoPointView(EMPTY_LIST_MESSAGE_BY_FILTER[this.#filterModel.getFilter()] ?? EMPTY_LIST_MESSAGE_BY_FILTER[FilterType.EVERYTHING]);
    render(noPointView, this.#eventsContainer, RenderPosition.BEFOREEND);
  }

  #renderSort() {
    const sortView = new SortView({
      onSortTypeChange: this.#sortTypeChangeHandler,
    });
    const tripEventsTitleElement = this.#eventsContainer.querySelector('.visually-hidden');

    render(sortView, tripEventsTitleElement, RenderPosition.AFTEREND);
    this.#sortView = sortView;
  }

  #renderEventsList() {
    const eventsListView = new EventsListView();
    render(eventsListView, this.#eventsContainer, RenderPosition.BEFOREEND);
    this.#eventsListView = eventsListView;
    this.#eventsList = this.#eventsContainer.querySelector('.trip-events__list');
  }

  #renderBoard = ({renderEmptyList = false} = {}) => {
    this.#destroyCreatePointPresenter(true);
    this.#clearBoard();

    const points = this.#getFilteredPoints();

    if (!points.length && !renderEmptyList) {
      this.#renderEmptyState();
      return;
    }

    this.#renderSort();
    this.#renderEventsList();
    this.#renderRoutePoints();
  };

  #renderTripInfo() {
    const points = this.#pointsModel.getPoints();
    const route = buildRouteTitle(points, this.#pointsModel);
    const dates = formatTripDates(points);
    const price = calculateTotalPrice(points, this.#pointsModel);

    const tripInfoComponent = new TripInfoView({route, dates, price});

    const existing = this.#tripInfoContainer.querySelector('.trip-main__trip-info');

    if (this.#tripInfoComponent) {
      replace(tripInfoComponent, this.#tripInfoComponent);
    } else if (existing) {
      existing.replaceWith(tripInfoComponent.element);
    } else {
      render(tripInfoComponent, this.#tripInfoContainer, RenderPosition.AFTERBEGIN);
    }

    this.#tripInfoComponent = tripInfoComponent;
  }

  #sortTypeChangeHandler = (sortType) => {
    if (this.#sortType === sortType) {
      return;
    }

    this.#sortType = sortType;
    this.#renderBoard({renderEmptyList: true});
  };

  #handleModelChange = (event) => {
    if (event === 'filter-changed') {
      this.#sortType = SortType.DAY;
    }

    this.#renderTripInfo();
    this.#renderBoard();
  };

  #handleViewAction = async (actionType, updateType, update) => {
    void updateType;

    this.#uiBlocker.block();

    try {
      switch (actionType) {
        case UserAction.UPDATE_POINT:
          await this.#pointsModel.updatePoint(update);
          break;
        case UserAction.DELETE_POINT:
          await this.#pointsModel.deletePoint(update.id);
          break;
        case UserAction.ADD_POINT:
          await this.#pointsModel.addPoint(update);
          break;
        default:
          break;
      }
    } finally {
      this.#uiBlocker.unblock();
    }
  };

  #handleAddPointClick = () => {
    if (this.#createPointPresenter) {
      return;
    }

    this.#destroyCreatePointPresenter(true);
    this.#resetRoutePointsView();

    this.#sortType = SortType.DAY;
    this.#filterModel.setFilter(FilterType.EVERYTHING);
    this.#renderBoard({renderEmptyList: this.#pointsModel.getPoints().length === 0});

    this.#createPointPresenter = new CreatePointPresenter({
      pointsModel: this.#pointsModel,
      eventsList: this.#eventsList,
      onViewAction: this.#handleViewAction,
      onViewClose: () => {
        this.#renderBoard();
      },
    });
    this.#createPointPresenter.init();
  };

  getRoutePointPresenterById(pointId) {
    return this.#routePointPresenters.find((presenter) => presenter.pointId === pointId);
  }

  init() {
    this.#pointsModel.addObserver(this.#handleModelChange);
    this.#filterModel.addObserver(this.#handleModelChange);

    const addPointButton = document.querySelector('.trip-main__event-add-btn');
    addPointButton.addEventListener('click', this.#handleAddPointClick);

    this.#renderTripInfo();
    this.#renderBoard();
  }
}
