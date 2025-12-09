#!/bin/bash

# Fix files with duplicate logger imports
FILES=(
  "app/routes/app.analytics.tsx"
  "app/routes/app.settings.tsx"
  "app/routes/app.sales-assistant.tsx"
  "app/routes/app.sales-assistant-simple.tsx"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Fixing $file"
    # Remove lines 2 and 4 which have the wrong logger imports
    sed -i '2d;2d' "$file"
  fi
done

echo "Fixed duplicate imports!"
