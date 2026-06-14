function adaptPointFromServer(point) {
  const {
    base_price: basePrice,
    date_from: dateFrom,
    date_to: dateTo,
    is_favorite: isFavorite,
    ...restPoint
  } = point;

  return {
    ...restPoint,
    basePrice,
    dateFrom,
    dateTo,
    isFavorite,
  };
}

function adaptPointToServer(point) {
  const {
    basePrice,
    dateFrom,
    dateTo,
    isFavorite,
    ...restPoint
  } = point;

  return {
    ...restPoint,
    'base_price': basePrice,
    'date_from': dateFrom,
    'date_to': dateTo,
    'is_favorite': isFavorite,
  };
}

function adaptDestinationsFromServer(destinations) {
  return structuredClone(destinations);
}

function adaptOffersFromServer(offersByType) {
  return offersByType.flatMap(({type, offers}) => offers.map((offer) => ({
    ...offer,
    type,
  })));
}

export {
  adaptDestinationsFromServer,
  adaptOffersFromServer,
  adaptPointFromServer,
  adaptPointToServer,
};
