ARG REDBOX_BASE_IMAGE=qcifengineering/redbox-portal:develop-pdfgen

FROM ${REDBOX_BASE_IMAGE} AS builder

USER root

COPY sails-hook-redbox-redcap /opt/sails-hook-redbox-redcap
COPY redbox-portal/packages/redbox-core /opt/redbox-portal/packages/redbox-core
COPY redbox-portal/packages/sails-ng-common /opt/redbox-portal/packages/sails-ng-common
COPY redbox-portal/packages/redbox-dev-tools /opt/redbox-portal/packages/redbox-dev-tools
COPY redbox-portal/packages/redbox-hook-dev /opt/redbox-portal/packages/redbox-hook-dev

RUN --mount=type=cache,target=/root/.npm \
  cd /opt/sails-hook-redbox-redcap \
  && npm install --include=dev --ignore-scripts --legacy-peer-deps \
  && npm --prefix angular install --include=dev --ignore-scripts \
  && npm run compile \
  && npm run build:angular \
  && cd /opt/redbox-portal \
  && npm install --legacy-peer-deps --ignore-scripts /opt/sails-hook-redbox-redcap \
  && cp -a /opt/sails-hook-redbox-redcap/node_modules/@researchdatabox/redbox-dev-tools/dist packages/redbox-dev-tools/dist \
  && mkdir -p /opt/redbox-portal/language-defaults \
  && if [ -d /opt/sails-hook-redbox-redcap/language-defaults ]; then cp -a /opt/sails-hook-redbox-redcap/language-defaults/. /opt/redbox-portal/language-defaults/; fi

FROM ${REDBOX_BASE_IMAGE} AS sails-hook-redbox-redcap
USER root

COPY --from=builder --chown=node:node --chmod='u=rwx,g=rx,o=rx' /opt/redbox-portal /opt/redbox-portal

USER node
