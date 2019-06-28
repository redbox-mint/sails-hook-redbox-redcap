/**
 * redcap form
 */
module.exports = {
  name: 'redcap-1.0-draft',
  type: 'redcap',
  customAngularApp: {
    appName: 'redcap',
    appSelector: 'redcap-form'
  },
  skipValidationOnSave: true,
  editCssClasses: 'row col-md-12',
  viewCssClasses: 'row col-md-offset-1 col-md-10',
  messages: {
    'saving': ['@dmpt-form-saving'],
    'validationFail': ['@dmpt-form-validation-fail-prefix', '@dmpt-form-validation-fail-suffix'],
    'saveSuccess': ['@dmpt-form-save-success'],
    'saveError': ['@dmpt-form-save-error']
  },
  fields: [
    {
      class: 'Container',
      compClass: 'TextBlockComponent',
      viewOnly: false,
      definition: {
        name: 'title',
        value: 'RedCap',
        type: 'h2'
      }
    },
    {
      class: 'Container',
      compClass: 'TextBlockComponent',
      viewOnly: false,
      definition: {
        name: 'subtitle',
        value: 'Workspaces',
        type: 'h3'
      }
    },
    {
      class: 'RedcapTokenField',
      viewOnly: false,
      definition: {
        name: 'Token',
        tokenLabel: 'Project Token',
        tokenAddLabel: 'Add',
        tokenError:'Please include your REDCap Project API token',
        helpTokenLabel: 'To get your REDCap Project API token:',
        location: 'redcap.research.uts.edu.au',
        helpTokenLabelList: [
          'Log in to REDCap',
          'Create a project',
          'Select API, and create an API token for this project',
          'Copy the API token',
          'Come back to this screen',
          'Enter your UTS email address',
          'Paste the API token you copied above into REDCap API token for external applications.'
        ],
        helpTokenImageAlt: 'REDCap token help',
        helpTokenImage1: '/angular/redcap/assets/images/redcap-help123.png',
        helpTokenImage2: '/angular/redcap/assets/images/redcap-help4.png',
        helpTokenImage3: '/angular/redcap/assets/images/redcap-help567.png',
        linkLabel: 'Link to Plan'
      }
    }
  ]
};
