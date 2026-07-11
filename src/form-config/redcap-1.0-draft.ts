import { FormConfigFrame } from '@researchdatabox/sails-ng-common';
const formConfig = {
  "name": "redcap-1.0-draft",
  "type": "redcap",
  "viewCssClasses": "redbox-form form rb-form-view",
  "editCssClasses": "redbox-form form rb-form-edit",
  "enabledValidationGroups": [
    "none"
  ],
  "validators": [],
  "validationGroups": {
    "all": {
      "description": "Validate all fields with validators.",
      "initialMembership": "all"
    },
    "none": {
      "description": "Validate none of the fields.",
      "initialMembership": "none"
    }
  },
  "componentDefinitions": [
    {
      "name": "title",
      "constraints": {
        "authorization": {
          "allowRoles": []
        },
        "allowModes": []
      },
      "component": {
        "class": "ContentComponent",
        "config": {
          "readonly": false,
          "visible": true,
          "editMode": true,
          "label": "title",
          "disabled": false,
          "autofocus": false,
          "showValidIndicator": false,
          "template": "<h2>{{content}}</h2>",
          "content": "REDCap"
        }
      },
      "layout": {
        "class": "DefaultLayout",
        "config": {
          "readonly": false,
          "visible": true,
          "editMode": true,
          "disabled": false,
          "autofocus": false,
          "showValidIndicator": false,
          "labelRequiredStr": "*",
          "cssClassesMap": {},
          "helpTextVisibleOnInit": false,
          "helpTextVisible": false
        }
      }
    },
    {
      "name": "subtitle",
      "constraints": {
        "authorization": {
          "allowRoles": []
        },
        "allowModes": []
      },
      "component": {
        "class": "ContentComponent",
        "config": {
          "readonly": false,
          "visible": true,
          "editMode": true,
          "label": "subtitle",
          "disabled": false,
          "autofocus": false,
          "showValidIndicator": false,
          "template": "<h3>{{content}}</h3>",
          "content": "Workspaces"
        }
      },
      "layout": {
        "class": "DefaultLayout",
        "config": {
          "readonly": false,
          "visible": true,
          "editMode": true,
          "disabled": false,
          "autofocus": false,
          "showValidIndicator": false,
          "labelRequiredStr": "*",
          "cssClassesMap": {},
          "helpTextVisibleOnInit": false,
          "helpTextVisible": false
        }
      }
    },
    {
      "name": "Token",
      "constraints": {
        "authorization": {
          "allowRoles": []
        },
        "allowModes": []
      },
      "component": {
        "class": "ContentComponent",
        "config": {
          "readonly": false,
          "visible": true,
          "editMode": true,
          "label": "Token",
          "disabled": false,
          "autofocus": false,
          "showValidIndicator": false,
          "content": "Not yet implemented in v5: v4ClassName \"RedcapTokenField\" v4CompClassName \"\" v4Name \"Token\". At path '[\"fields\",\"2\"]'."
        }
      },
      "layout": {
        "class": "DefaultLayout",
        "config": {
          "readonly": false,
          "visible": true,
          "editMode": true,
          "label": "Token",
          "disabled": false,
          "autofocus": false,
          "showValidIndicator": false,
          "labelRequiredStr": "*",
          "cssClassesMap": {},
          "helpTextVisibleOnInit": false,
          "helpTextVisible": false
        }
      }
    },
    {
      "name": "BackToPlan",
      "constraints": {
        "authorization": {
          "allowRoles": []
        },
        "allowModes": []
      },
      "component": {
        "class": "ContentComponent",
        "config": {
          "readonly": false,
          "visible": true,
          "editMode": true,
          "disabled": false,
          "autofocus": false,
          "showValidIndicator": false,
          "template": "<a href=\"{{concat \"/\" branding \"/\" portal \"/record/edit/\"}}\" class=\"{{content.cssClasses}}\">{{content.label}}</a>",
          "content": {
            "href": "/@branding/@portal/record/edit/",
            "cssClasses": "btn btn-large btn-info",
            "label": "Back to your Plan",
            "showPencil": false
          }
        }
      },
      "layout": {
        "class": "InlineLayout",
        "config": {
          "readonly": false,
          "visible": true,
          "editMode": true,
          "disabled": false,
          "autofocus": false,
          "showValidIndicator": false,
          "labelRequiredStr": "*",
          "cssClassesMap": {},
          "helpTextVisibleOnInit": false,
          "helpTextVisible": false
        }
      }
    },
    {
      "name": "validation_summary",
      "constraints": {
        "authorization": {
          "allowRoles": []
        },
        "allowModes": []
      },
      "component": {
        "class": "ValidationSummaryComponent"
      }
    }
  ],
  "debugValue": true,
  "attachmentFields": []
  ,"customAngularApp": { "appName": "redcap", "appSelector": "redcap-form" }
} as unknown as FormConfigFrame;
export default formConfig;
