"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _yup = require('yup'); var Yup = _interopRequireWildcard(_yup);
var _datefns = require('date-fns');
var _pt = require('date-fns/locale/pt'); var _pt2 = _interopRequireDefault(_pt);
var _Appointment = require('../models/Appointment'); var _Appointment2 = _interopRequireDefault(_Appointment);
var _User = require('../models/User'); var _User2 = _interopRequireDefault(_User);
var _File = require('../models/File'); var _File2 = _interopRequireDefault(_File);
var _Notification = require('../schemas/Notification'); var _Notification2 = _interopRequireDefault(_Notification);
var _cancellationMail = require('../jobs/cancellationMail'); var _cancellationMail2 = _interopRequireDefault(_cancellationMail);
var _Queue = require('../../lib/Queue'); var _Queue2 = _interopRequireDefault(_Queue);

class AppointmentController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const appointments = await _Appointment2.default.findAll({
      where: { user_id: req.userId, canceled_at: null },
      order: ['date'],
      limit: 20,
      offset: (page - 1) * 20,
      attributes: ['id', 'date', 'past', 'cancelable'],
      include: [
        {
          model: _User2.default,
          as: 'provider',
          attributes: ['id', 'name'],
          include: [
            {
              model: _File2.default,
              as: 'avatar',
              attributes: ['id', 'path', 'url'],
            },
          ],
        },
      ],
    });
    return res.json(appointments);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      provider_id: Yup.number().required(),
      date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }
    const { provider_id, date } = req.body;

    /**
     * check if provider_id is a provider
     */

    const isProvider = await _User2.default.findOne({
      where: { id: provider_id, provider: true },
    });

    if (!isProvider) {
      return res
        .status(401)
        .json({ error: 'You can only create appointments with providers' });
    }
    if (provider_id === req.userId) {
      return res
        .status(400)
        .json({ error: 'You cant create an appointment to yourself' });
    }
    /**
     * check for past date
     */

    const hourStart = _datefns.startOfHour.call(void 0, _datefns.parseISO.call(void 0, date));

    if (_datefns.isBefore.call(void 0, hourStart, new Date())) {
      return res.status(400).json({ error: 'Past date are not permited' });
    }

    /**
     * check for avialability
     */
    const checkAvialability = await _Appointment2.default.findOne({
      where: {
        provider_id,
        canceled_at: null,
        date: hourStart,
      },
    });

    if (checkAvialability) {
      return res
        .status(400)
        .json({ error: 'Appointment date is not available' });
    }

    const appointment = await _Appointment2.default.create({
      user_id: req.userId,
      provider_id,
      date,
    });

    /**
     * Notify appointment provider
     */
    const user = await _User2.default.findByPk(req.userId);
    const formatedDate = _datefns.format.call(void 0, hourStart, "'dia' dd 'de' MMMM', às' H:mm'h'", {
      locale: _pt2.default,
    });

    await _Notification2.default.create({
      content: `Novo agendamento de ${user.name} para ${formatedDate}`,
      user: provider_id,
    });
    return res.json(appointment);
  }

  async delete(req, res) {
    const appointment = await _Appointment2.default.findByPk(req.params.id, {
      include: [
        {
          model: _User2.default,
          as: 'provider',
          attributes: ['name', 'email'],
        },
        {
          model: _User2.default,
          as: 'user',
          attributes: ['name'],
        },
      ],
    });

    if (appointment.user_id !== req.userId) {
      return res.status(401).json({
        error: "You don't have permission to cancel this appointment.",
      });
    }

    const dateWithSub = _datefns.subHours.call(void 0, appointment.date, 2);

    if (_datefns.isBefore.call(void 0, dateWithSub, new Date())) {
      return res
        .status(401)
        .json({ error: 'You can only cancel appointments 2 hours in advance' });
    }

    appointment.canceled_at = new Date();
    await appointment.save();

    await _Queue2.default.add(_cancellationMail2.default.key, {
      appointment,
    });

    return res.json(appointment);
  }
}

exports. default = new AppointmentController();
