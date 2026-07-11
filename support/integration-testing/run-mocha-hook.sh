#!/usr/bin/env bash

set -euo pipefail

cd /opt/redbox-portal

export RBPORTAL_MOCHA_TEST_PATHS=${RBPORTAL_MOCHA_TEST_PATHS:-$'test/integration/redcap/**/*.test.ts'}

exec bash /opt/redbox-portal/support/integration-testing/run-mocha-redbox.sh
