const POINT_TYPES = [
  'taxi',
  'bus',
  'train',
  'ship',
  'drive',
  'flight',
  'check-in',
  'sightseeing',
  'restaurant',
];

const CITIES = [
  'Amsterdam',
  'Geneva',
  'Chamonix',
  'Paris',
  'Madrid',
];

const LOREM_SENTENCES = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  'Cras aliquet varius magna, non porta ligula feugiat eget.',
  'Fusce tristique felis at fermentum pharetra.',
  'Aliquam id orci ut lectus varius viverra.',
  'Nullam nunc ex, convallis sed finibus eget, sollicitudin eget ante.',
  'Phasellus eros mauris, condimentum sed nibh vitae, sodales efficitur ipsum.',
  'Sed blandit, eros vel aliquam faucibus, purus ex euismod diam, eu luctus nunc ante ut dui.',
  'Sed sed nisi sed augue convallis suscipit in sed felis.',
  'Aliquam erat volutpat.',
  'Nunc fermentum tortor ac porta dapibus.',
  'In rutrum ac purus sit amet tempus.',
];

const OFFER_TITLES_BY_TYPE = {
  taxi: ['Order Uber', 'Choose comfort class'],
  bus: ['Infotainment system', 'Choose seats'],
  train: ['Book a meal', 'Choose seats'],
  ship: ['Choose a cabin', 'Book a transfer'],
  drive: ['Rent a car', 'Add full insurance'],
  flight: ['Add luggage', 'Switch to comfort', 'Add meal', 'Choose seats'],
  'check-in': ['Add breakfast', 'Late checkout'],
  sightseeing: ['Book a guide', 'Add museum tickets'],
  restaurant: ['Choose table', 'Add tasting set'],
};

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomItem(items) {
  return items[getRandomInt(0, items.length - 1)];
}

function generateDestinationDescription() {
  const sentenceCount = getRandomInt(1, 5);
  return LOREM_SENTENCES.slice(0, sentenceCount).join(' ');
}

function generateDestinations() {
  return CITIES.map((name, index) => ({
    id: `destination-${index + 1}`,
    name,
    description: generateDestinationDescription(),
    pictures: Array.from({length: getRandomInt(2, 5)}, () => ({
      src: `https://loremflickr.com/248/152?random=${getRandomInt(1, 1000)}`,
      description: `${name} photo`,
    })),
  }));
}

function generateOffers() {
  let offerId = 1;

  return POINT_TYPES.flatMap((type) => {
    const titles = OFFER_TITLES_BY_TYPE[type] || [];

    return titles.map((title) => ({
      id: `offer-${offerId++}`,
      type,
      title,
      price: getRandomInt(10, 120),
    }));
  });
}

function generatePoints(destinations, offers) {
  const now = new Date();

  return [0, 1, 2].map((dayShift, index) => {
    const type = getRandomItem(POINT_TYPES);
    const destination = getRandomItem(destinations);
    const typeOffers = offers.filter((offer) => offer.type === type);
    const selectedOfferCount = getRandomInt(0, Math.min(2, typeOffers.length));
    const selectedOffers = typeOffers.slice(0, selectedOfferCount).map((offer) => offer.id);

    const dateFrom = new Date(now);
    dateFrom.setDate(dateFrom.getDate() + dayShift);
    dateFrom.setHours(9 + index * 2, getRandomInt(0, 5) * 10, 0, 0);

    const dateTo = new Date(dateFrom);
    dateTo.setMinutes(dateTo.getMinutes() + getRandomInt(30, 180));

    return {
      id: `point-${index + 1}`,
      basePrice: getRandomInt(20, 250),
      dateFrom: dateFrom.toISOString(),
      dateTo: dateTo.toISOString(),
      destination: destination.id,
      isFavorite: Boolean(index % 2),
      offers: selectedOffers,
      type,
    };
  });
}

function generatePointsData() {
  const destinations = generateDestinations();
  const offers = generateOffers();
  const points = generatePoints(destinations, offers);

  return {
    points,
    offers,
    destinations,
  };
}

export {POINT_TYPES, generatePointsData};
