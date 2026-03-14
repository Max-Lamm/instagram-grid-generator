#!/usr/bin/env bash
set -e
npm run build
rsync -avz --delete dist/ maxlamm@hernmann.uberspace.de:~/html/tools.maxlamm.de/
