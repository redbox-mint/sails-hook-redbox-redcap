const RedcapService = require('../services/RedcapService');

module.exports = {
  exportProject: function (req, res, next) {

    const info = RedcapService.exportProject();
    return info;
  }
};
