import BoardPresenter from './presenter/board-presenter.js';
import PointsModel from './model/points-model.js';
import FilterModel from './model/filter-model.js';
import FilterPresenter from './presenter/filter-presenter.js';

const pointsModel = new PointsModel();
const filterModel = new FilterModel();
const filterPresenter = new FilterPresenter({filterModel, pointsModel});
const boardPresenter = new BoardPresenter({pointsModel, filterModel});

filterPresenter.init();
boardPresenter.init();
