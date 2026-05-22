import {RenderPosition, render, replace} from '../render.js';
import {generateFilters} from '../utils/filter.js';
import FilterView from '../view/filter-view.js';

export default class FilterPresenter {
  #filterModel = null;
  #pointsModel = null;
  #filtersContainer = null;
  #filterComponent = null;

  constructor({filterModel, pointsModel}) {
    this.#filterModel = filterModel;
    this.#pointsModel = pointsModel;
    this.#filtersContainer = document.querySelector('.trip-controls__filters');
  }

  init() {
    this.#renderFilter();
    this.#filterModel.addObserver(this.#handleModelChange);
    this.#pointsModel.addObserver(this.#handleModelChange);
  }

  #handleFilterChange = (evt) => {
    const {target} = evt;

    if (!target.matches('.trip-filters__filter-input')) {
      return;
    }

    this.#filterModel.setFilter(target.value);
  };

  #handleModelChange = () => {
    this.#renderFilter();
  };

  #renderFilter() {
    const filterComponent = new FilterView({
      filters: generateFilters(this.#pointsModel.getPoints()),
      currentFilter: this.#filterModel.getFilter(),
    });

    if (this.#filterComponent) {
      replace(filterComponent, this.#filterComponent);
    } else {
      render(filterComponent, this.#filtersContainer, RenderPosition.BEFOREEND);
    }

    this.#filterComponent = filterComponent;
    this.#filterComponent.element.addEventListener('change', this.#handleFilterChange);
  }
}
