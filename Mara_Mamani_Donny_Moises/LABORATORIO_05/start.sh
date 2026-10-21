#!/bin/sh
set -e

nginx
exec node index.js
