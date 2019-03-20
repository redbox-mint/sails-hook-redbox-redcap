const config = {
  host: 'redcap.research.uts.edu.au',
  path: '/api/'
};

const redcap = require ('redcap') ('EDE0B1F3AA10D82FDE5BC17A21B345B3', config);

module.exports = {

  exportProject: function () {
    const projects = redcap.projects.export(function(err, res) {
          // error containts oprtional errors
          if (err) {
              // handle error
          }
          else {
              // res is return value
              console.log (res);
          }
        });
    return projects;
  }
};
