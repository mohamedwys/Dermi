#!/bin/bash

# Fix wrong logger import paths in routes
find app/routes -name "*.tsx" -type f | while read file; do
  # Replace wrong path with correct one
  sed -i 's|from "./lib/logger.server"|from "../lib/logger.server"|g' "$file"
done

echo "Fixed logger import paths!"
