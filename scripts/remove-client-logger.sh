#!/bin/bash

# Client-side files where logger should be removed entirely
CLIENT_FILES=(
  "app/components/PolarisLanguageSwitcher.tsx"
  "app/components/Testimonials.tsx"
  "app/lib/sentry.client.ts"
  "app/i18n/resources.ts"
)

for file in "${CLIENT_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Removing logger calls from $file"
    # Remove lines with logger.info, logger.error, logger.warn, logger.debug
    sed -i '/logger\.\(info\|error\|warn\|debug\)/d' "$file"
  fi
done

echo "Client-side logger calls removed!"
