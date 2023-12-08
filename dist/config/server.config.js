"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.jsonConfig = void 0;

var _path = require("path");

var _fs = require("fs");

var _jsYaml = require("js-yaml");

const jsonConfig = async () => {
  try {
    const pathFile = (0, _path.resolve)(process.cwd(), 'config.yml');
    const readYaml = await _fs.promises.readFile(pathFile, 'utf8');
    const config = (0, _jsYaml.safeLoad)(readYaml, {
      json: true
    });

    if (!config.services) {
      throw new Error();
    }

    return setSettings(config);
  } catch (error) {
    throw new Error('Check if there is a config.yml file and if there is a configuration of the services');
  }
};

exports.jsonConfig = jsonConfig;

const setSettings = ({
  nameApplication,
  hostApplication,
  config,
  security,
  services
}) => {
  const setName = () => {
    if (nameApplication) {
      return nameApplication;
    }

    return process.env.npm_package_name || '';
  };

  const setBoolean = (parentProperty, property) => {
    if (parentProperty === undefined || parentProperty === null) {
      return true;
    }

    if (parentProperty[property] === undefined || parentProperty[property] === null) {
      return true;
    }

    return parentProperty[property];
  };

  return {
    nameApplication: setName(),
    hostApplication: hostApplication || '',
    config: {
      enabledMorgan: setBoolean(config, 'enabledMorgan'),
      port: config && config.port || 3333
    },
    security: {
      enabledHelmet: setBoolean(security, 'enabledHelmet'),
      enabledJSON: setBoolean(security, 'enabledJSON')
    },
    services
  };
};