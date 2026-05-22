import View from './view.js';

const FILTER_LABELS = {
  everything: 'Everything',
  future: 'Future',
  present: 'Present',
  past: 'Past',
};

const DEFAULT_FILTERS = [
  {type: 'everything', disabled: false},
  {type: 'future', disabled: false},
  {type: 'present', disabled: false},
  {type: 'past', disabled: false},
];

function createFilterTemplate({type, disabled}, isChecked) {
  return `
    <div class="trip-filters__filter">
      <input
        id="filter-${type}"
        class="trip-filters__filter-input visually-hidden"
        type="radio"
        name="trip-filter"
        value="${type}"
        ${isChecked ? 'checked' : ''}
        ${disabled ? 'disabled' : ''}
      >
      <label class="trip-filters__filter-label" for="filter-${type}">${FILTER_LABELS[type]}</label>
    </div>
  `;
}

export default class FilterView extends View {
  #filters = DEFAULT_FILTERS;

  constructor(filters = DEFAULT_FILTERS) {
    super();
    this.#filters = filters;
  }

  get template() {
    const filtersTemplate = this.#filters
      .map((filter, index) => createFilterTemplate(filter, index === 0))
      .join('');

    return (`
      <form class="trip-filters" action="#" method="get">
        ${filtersTemplate}

        <button class="visually-hidden" type="submit">Accept filter</button>
      </form>
    `);
  }
}
