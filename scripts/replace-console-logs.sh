#!/bin/bash
find app -name "*.ts" -o -name "*.tsx" | while read file; do
  # Replace console.log with logger.info
  sed -i 's/console\.log(/logger.info(/g' "$file"
  # Replace console.error with logger.error
  sed -i 's/console\.error(/logger.error(/g' "$file"
  # Replace console.warn with logger.warn
  sed -i 's/console\.warn(/logger.warn(/g' "$file"
done
