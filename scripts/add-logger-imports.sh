#!/bin/bash

# Files that need logger import (server-side files)
SERVER_FILES=(
  "app/lib/polaris-i18n.ts"
  "app/lib/rate-limit.server.ts"
  "app/lib/security-headers.server.ts"
  "app/lib/webhook-verification.server.ts"
  "app/routes/app.analytics.tsx"
  "app/routes/app.settings.tsx"
  "app/routes/app.sales-assistant.tsx"
  "app/routes/app.sales-assistant-simple.tsx"
)

for file in "${SERVER_FILES[@]}"; do
  if [ -f "$file" ]; then
    # Check if logger import already exists
    if ! grep -q "import.*logger.*from.*logger.server" "$file"; then
      echo "Adding logger import to $file"
      # Add import after the first import block
      sed -i '1,/^import/s/^\(import.*\)$/\1\nimport { logger } from ".\/lib\/logger.server";/' "$file" 2>/dev/null || \
      sed -i '1,/^import/s/^\(import.*\)$/\1\nimport { logger } from "..\/lib\/logger.server";/' "$file" 2>/dev/null
    fi
  fi
done

echo "Logger imports added!"
