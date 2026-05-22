import Observable from '../framework/observable.js';
import {FilterType} from '../const.js';

const ModelEvent = {
  FILTER_CHANGED: 'filter-changed',
};

export default class FilterModel extends Observable {
  #filter = FilterType.EVERYTHING;

  getFilter() {
    return this.#filter;
  }

  setFilter(filterType) {
    if (this.#filter === filterType) {
      return;
    }

    this.#filter = filterType;
    this._notify(ModelEvent.FILTER_CHANGED, filterType);
  }
}
