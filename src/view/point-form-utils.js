function capitalizeType(type) {
  return type
    .split('-')
    .map((part) => `${part[0].toUpperCase()}${part.slice(1)}`)
    .join('-');
}

function createOfferSelector(offer, pointId, isDisabled = false) {
  const inputId = `event-offer-${offer.id}-${pointId}`;

  return (`
    <div class="event__offer-selector">
      <input class="event__offer-checkbox  visually-hidden" data-offer-id="${offer.id}" id="${inputId}" type="checkbox" name="event-offer-${offer.id}"${offer.checked ? ' checked' : ''}${isDisabled ? ' disabled' : ''}>
      <label class="event__offer-label" for="${inputId}">
        <span class="event__offer-title">${offer.title}</span>
        &plus;&euro;&nbsp;
        <span class="event__offer-price">${offer.price}</span>
      </label>
    </div>
  `);
}

function createTypeItem(type, currentType, pointId) {
  const inputId = `event-type-${type}-${pointId}`;

  return (`
    <div class="event__type-item">
      <input id="${inputId}" class="event__type-input  visually-hidden" type="radio" name="event-type" value="${type}"${type === currentType ? ' checked' : ''}>
      <label class="event__type-label  event__type-label--${type}" for="${inputId}">${capitalizeType(type)}</label>
    </div>
  `);
}

function getDestinationByName(destinations, destinationName) {
  return destinations.find((destination) => destination.name === destinationName);
}

function getOffersByType(offers, type, selectedOfferIds = []) {
  return offers
    .filter((offer) => offer.type === type)
    .map((offer) => ({
      id: offer.id,
      title: offer.title,
      price: offer.price,
      checked: selectedOfferIds.includes(offer.id),
    }));
}

export {
  capitalizeType,
  createOfferSelector,
  createTypeItem,
  getDestinationByName,
  getOffersByType,
};
