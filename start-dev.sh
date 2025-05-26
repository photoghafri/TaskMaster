#!/bin/bash

# Set required environment variables
export NEXT_TELEMETRY_DISABLED=1
export NEXT_DISABLE_SOURCEMAPS=1
export NODE_OPTIONS="--no-warnings"

# Run the development server
npx next dev 