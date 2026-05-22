import View from './view.js';

export default class TripInfoView extends View {
  #route = '';
  #dates = '';
  #price = 0;

  constructor({route = '', dates = '', price = 0} = {}) {
    super();
    this.#route = route;
    this.#dates = dates;
    this.#price = price;
  }

  get template() {
    return (`
      <section class="trip-main__trip-info  trip-info">
        <div class="trip-info__main">
          <h1 class="trip-info__title">${this.#route}</h1>
          <p class="trip-info__dates">${this.#dates}</p>
        </div>

        <p class="trip-info__cost">
          Total: &euro;&nbsp;<span class="trip-info__cost-value">${this.#price}</span>
        </p>
      </section>
    `);
  }

  update({route, dates, price} = {}) {
    if (typeof route === 'string') {
      this.#route = route;
    }

    if (typeof dates === 'string') {
      this.#dates = dates;
    }

    if (typeof price === 'number') {
      this.#price = price;
    }

    this.element.querySelector('.trip-info__title').textContent = this.#route;
    this.element.querySelector('.trip-info__dates').innerHTML = this.#dates;
    this.element.querySelector('.trip-info__cost-value').textContent = String(this.#price);
  }
}
