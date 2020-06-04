"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _multer = require('multer'); var _multer2 = _interopRequireDefault(_multer);
var _crypto = require('crypto'); var _crypto2 = _interopRequireDefault(_crypto);
var _path = require('path');
var _multers3 = require('multer-s3'); var _multers32 = _interopRequireDefault(_multers3);
var _awssdk = require('aws-sdk'); var _awssdk2 = _interopRequireDefault(_awssdk);

const storageTypes = {
  local: _multer2.default.diskStorage({
    destination: _path.resolve.call(void 0, __dirname, '..', '..', 'tmp', 'uploads'),
    filename: (req, file, cb) => {
      _crypto2.default.randomBytes(16, (err, res) => {
        if (err) return cb(err);
        file.key = res.toString('hex') + _path.extname.call(void 0, file.originalname);
        return cb(null, file.key);
      });
    },
  }),
  s3: _multers32.default.call(void 0, {
    s3: new _awssdk2.default.S3(),
    bucket: 'gobarberperfil',
    contentType: _multers32.default.AUTO_CONTENT_TYPE,
    acl: 'public-read',
    key: (req, file, cb) => {
      _crypto2.default.randomBytes(16, (err, res) => {
        if (err) return cb(err);
        return cb(null, res.toString('hex') + _path.extname.call(void 0, file.originalname));
      });
    },
  }),
};

exports. default = {
  storage: storageTypes.local,
};
