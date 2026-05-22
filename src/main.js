import BoardPresenter from './presenter/board-presenter.js';
import PointsModel from './model/points-model.js';

const pointsModel = new PointsModel();
const boardPresenter = new BoardPresenter({pointsModel});

boardPresenter.init();
