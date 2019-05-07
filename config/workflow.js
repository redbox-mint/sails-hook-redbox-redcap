module.exports.workflow = {
  "redcap": {
    "draft": {
      config: {
        workflow: {
          stage: 'draft',
          stageLabel: 'Draft',
        },
        authorization: {
          viewRoles: ['Admin', 'Librarians'],
          editRoles: ['Admin', 'Librarians']
        },
        form: 'redcap-1.0-draft'
      },
      starting: true
    }
  }
}
