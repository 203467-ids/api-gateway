"use strict";

var _express = _interopRequireDefault(require("express"));

var _morgan = _interopRequireDefault(require("morgan"));

var _helmet = _interopRequireDefault(require("helmet"));

var _cookieParser = _interopRequireDefault(require("cookie-parser"));

var _expressHttpProxy = _interopRequireDefault(require("express-http-proxy"));

var _bodyParser = _interopRequireDefault(require("body-parser"));

var _server = require("./config/server.config");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(async () => {
  try {
    const {
      nameApplication,
      hostApplication,
      config,
      security,
      services
    } = await (0, _server.jsonConfig)();
    const app = (0, _express.default)();

    if (config.enabledMorgan) {
      app.use((0, _morgan.default)('dev'));
    }

    if (security.enabledHelmet) {
      app.use((0, _helmet.default)());
    }

    app.use(_express.default.urlencoded({
      extended: true
    }));
    app.use((0, _cookieParser.default)()); // Configurar body-parser para procesar todas las solicitudes

    app.use(_bodyParser.default.json());
    app.get('/', (_, res) => {
      return res.json({
        message: 'Running application'
      });
    }); // Configurar express-http-proxy para redirigir todas las solicitudes

    services.forEach(({
      nameRoute,
      url
    }) => {
      app.use(`/${nameRoute}`, (req, res, next) => {
        // Deshabilitar el análisis del cuerpo para solicitudes de carga de imágenes
        if (req.headers['content-type'] && req.headers['content-type'].startsWith('multipart/form-data')) {
          return (0, _expressHttpProxy.default)(url, {
            parseReqBody: false,
            timeout: 5000
          })(req, res, next);
        } // Permitir el análisis del cuerpo para otras solicitudes


        return (0, _expressHttpProxy.default)(url, {
          parseReqBody: true,
          timeout: 5000
        })(req, res, next);
      });
    });
    app.listen(config.port, () => {
      console.log(`Application ${nameApplication} is running on host ${hostApplication} on port ${config.port}`);
    });
  } catch (error) {
    console.log(error.message);
    process.exit();
  }
})();