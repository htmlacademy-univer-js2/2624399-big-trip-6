import BoardPresenter from './presenter/board-presenter.js';
import PointsModel from './model/points-model.js';
import FilterModel from './model/filter-model.js';
import FilterPresenter from './presenter/filter-presenter.js';
import BigTripApiService from './framework/big-trip-api-service.js';

const END_POINT = 'https://23.objects.pages.academy/big-trip';
const AUTHORIZATION = `Basic ${Math.random().toString(36).slice(2)}`;

const apiService = new BigTripApiService(END_POINT, AUTHORIZATION);
const pointsModel = new PointsModel(apiService);
const filterModel = new FilterModel();
const filterPresenter = new FilterPresenter({filterModel, pointsModel});
const boardPresenter = new BoardPresenter({pointsModel, filterModel});

const bootstrap = async () => {
  await pointsModel.init();

  filterPresenter.init();
  boardPresenter.init();
};

void bootstrap();

