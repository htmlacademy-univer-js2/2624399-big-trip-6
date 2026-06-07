import View from './view.js';

function createTripInfoTemplate({route, dates, price}) {
  return `
    <section class="trip-main__trip-info trip-info">
      <div class="trip-info__main">
        <h1 class="trip-info__title">${route}</h1>

        <p class="trip-info__dates">${dates}</p>
      </div>

      <p class="trip-info__cost">
        Total: &euro;&nbsp;<span class="trip-info__cost-value">${price}</span>
      </p>
    </section>
  `;
}

export default class TripInfoView extends View {
  #tripInfo = {
    route: '',
    dates: '',
    price: 0,
  };

  constructor({route = '', dates = '', price = 0} = {}) {
    super();
    this.#tripInfo = {route, dates, price};
  }

  get template() {
    return createTripInfoTemplate(this.#tripInfo);
  }
}
