"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _sequelize = require('sequelize'); var _sequelize2 = _interopRequireDefault(_sequelize);
var _mongoose = require('mongoose'); var _mongoose2 = _interopRequireDefault(_mongoose);

var _User = require('../app/models/User'); var _User2 = _interopRequireDefault(_User);
var _File = require('../app/models/File'); var _File2 = _interopRequireDefault(_File);
var _Appointment = require('../app/models/Appointment'); var _Appointment2 = _interopRequireDefault(_Appointment);

var _database = require('../config/database'); var _database2 = _interopRequireDefault(_database);

const models = [_User2.default, _File2.default, _Appointment2.default];

class Database {
  constructor() {
    this.init();
    this.mongo();
  }

  init() {
    this.conection = new (0, _sequelize2.default)(_database2.default);
    models
      .map((model) => model.init(this.conection))
      .map(
        (model) => model.associate && model.associate(this.conection.models)
      );
  }

  mongo() {
    _mongoose2.default.set('useNewUrlParser', true);
    _mongoose2.default.set('useUnifiedTopology', true);
    const mongo = {
      uri: process.env.MONGO_URL,
      opt: {
        useFinAndModify: true,
      },
    };
    this.mongoConnection = _mongoose2.default.connect(mongo.uri, mongo.ppt);
    /* this.mongoConnection = mongoose.connect(
      'mongodb://localhost:27017/gobarber',
      { userNewUrleParser: true, useFinAndModify: true }
    ); */
  }
}

exports. default = new Database();
