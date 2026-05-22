import {FilterType} from '../const.js';

const isFuturePoint = (point) => new Date(point.dateFrom) > new Date();
const isPresentPoint = (point) => {
  const now = new Date();

  return new Date(point.dateFrom) <= now && new Date(point.dateTo) >= now;
};
const isPastPoint = (point) => new Date(point.dateTo) < new Date();

const FILTERS_BY_TYPE = {
  [FilterType.EVERYTHING]: (points) => points.length,
  [FilterType.FUTURE]: (points) => points.filter(isFuturePoint).length,
  [FilterType.PRESENT]: (points) => points.filter(isPresentPoint).length,
  [FilterType.PAST]: (points) => points.filter(isPastPoint).length,
};

function generateFilters(points) {
  return Object.values(FilterType).map((type) => {
    const pointsCount = FILTERS_BY_TYPE[type](points);

    return {
      type,
      disabled: type !== FilterType.EVERYTHING && pointsCount === 0,
    };
  });
}

export {generateFilters};
