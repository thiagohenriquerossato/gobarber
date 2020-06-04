import Sequelize, { Model } from 'sequelize';

class File extends Model {
  static init(sequelize) {
    if (process.env.NODE_ENV === 'development') {
      super.init(
        {
          name: Sequelize.STRING,
          path: Sequelize.STRING,
          url: {
            type: Sequelize.VIRTUAL,
            get() {
              return `${process.env.APP_URL}/files/${this.path}`;
            },
          },
        },
        {
          sequelize,
        }
      );

      return this;
    }
    super.init(
      {
        name: Sequelize.STRING,
        path: Sequelize.STRING,
        url: Sequelize.VIRTUAL,
      },
      {
        sequelize,
      }
    );

    return this;
  }
}

export default File;