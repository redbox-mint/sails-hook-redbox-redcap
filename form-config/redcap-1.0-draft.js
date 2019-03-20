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
        value: 'redcap',
        type: 'h2'
      }
    },
    {
      class: 'RedcapLoginField',
      viewOnly: false,
      definition: {
        name: 'Login',
        loginLabel: 'Login',
        userLoginError:'Please include your UTS email address',
        usernameLabel: 'UTS email address',
        userPasswordError: 'Please include your REDCap Project API token',
        passwordLabel: 'REDCap Project API token for external applications',
        helpLoginLabel: 'To get your REDCap Project API token:',
        helpLoginLabelList: [
          'Log in to REDCap',
          'Create a project',
          'Select API, and create an API token for this project',
          'Copy the API oken',
          'Come back to this screen',
          'Enter your UTS email address',
          'Paste the API token you copied above into REDCap API token for external applications.'
        ],
        loginHelpImageAlt: 'REDCap help login',
        loginHelpImage: '/angular/redcap/assets/images/redcap-help-login.png',
        closeLabel: 'Close'
      }
    },
    {
      class: 'RedcapListField',
      viewOnly: false,
      definition: {
        name: 'List',
        linkedLabel: 'Linked with Stash',
        defaultNotebookLabel: 'Default Project'
      }
    },
    {
      class: 'RedcapLinkField',
      viewOnly: false,
      definition: {
        name: 'Link',
        processingLabel: 'Processing...',
        processingSuccess: 'Your workspace was linked successfully',
        processingFail: 'There was a problem linking your workspace, please try again later',
        processingNoPermission: 'You do not have rights to modify this item',
        closeLabel: 'Close',
      }
    },
    {
      class: "AnchorOrButton",
      viewOnly: false,
      definition: {
        name: "BackToPlan",
        label: 'Back to your Plan',
        value: '/@branding/@portal/record/edit/',
        cssClasses: 'btn btn-large btn-info',
        showPencil: false,
        controlType: 'anchor'
      },
      variableSubstitutionFields: ['value']
    }
  ]
};
