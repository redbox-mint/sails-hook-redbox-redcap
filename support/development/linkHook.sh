#! /bin/bash
cd /opt/sailshook;
yarn link;
cd /opt/redbox-portal;
if [ ! -d "node_modules/@uts-eresearch/sails-hook-redbox-redcap" ]; then
    yarn add  "file:/opt/sailshook";
fi
yarn link "@uts-eresearch/sails-hook-redbox-redcap";
node app.js
