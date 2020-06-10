import Sequelize from 'sequelize';
import mongoose from 'mongoose';

import User from '../app/models/User';
import File from '../app/models/File';
import Appointment from '../app/models/Appointment';

import databaseConfig from '../config/database';

const models = [User, File, Appointment];

class Database {
  constructor() {
    this.init();
    this.mongo();
  }

  init() {
    this.conection = new Sequelize(databaseConfig);
    models
      .map((model) => model.init(this.conection))
      .map(
        (model) => model.associate && model.associate(this.conection.models)
      );
  }

  mongo() {
    mongoose.set('useNewUrlParser', true);
    mongoose.set('useUnifiedTopology', true);
    const mongo = {
      uri: process.env.MONGO_URL,
      opt: {
        useFinAndModify: true,
      },
    };
    this.mongoConnection = mongoose.connect(mongo.uri, mongo.ppt);
    /* this.mongoConnection = mongoose.connect(
      'mongodb://localhost:27017/gobarber',
      { userNewUrleParser: true, useFinAndModify: true }
    ); */
  }
}

export default new Database();
