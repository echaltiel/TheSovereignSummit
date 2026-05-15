#!/usr/bin/env bash
# encode-speakers.sh
# Bulk-encode speaker headshots: center-crop to square, resize to 200x200, WebP @ q78.
#
# Setup (macOS):
#   brew install imagemagick webp
#
# Usage:
#   1. Drop original headshots (any size, any format) into ./originals/
#      Name them by speaker slug: saylor.jpg, dorsey.png, alden.jpeg, etc.
#      The slug must match the list below — these are the filenames the website expects.
#   2. Run: ./encode-speakers.sh
#   3. Output lands in ./images/speakers/ as <slug>.webp
#   4. Commit ./images/speakers/*.webp to your repo. Don't commit ./originals/.

set -euo pipefail

# Speaker slugs the website expects (matches src="/images/speakers/<slug>.webp")
SLUGS=(
  # Tier 1 (headliners)
  saylor dorsey back wood
  # Tier 2 (featured)
  alden booth gladstein long brunell mccormack marcus stark
  livera lewis boyapati song rizzo leclair cross bailey-d
  # Tier 3 (full lineup)
  leishman turner youngelman knowles patel burnett kelly
  halliburton cole tanguma callahan foxley
)

INPUT_DIR="./originals"
OUTPUT_DIR="./images/speakers"
SIZE=200
QUALITY=78

# Sanity checks
command -v magick >/dev/null 2>&1 || { echo "ERROR: 'magick' not found. Install with: brew install imagemagick"; exit 1; }
command -v cwebp >/dev/null 2>&1 || { echo "ERROR: 'cwebp' not found. Install with: brew install webp"; exit 1; }
[ -d "$INPUT_DIR" ] || { echo "ERROR: '$INPUT_DIR' folder not found. Create it and drop your headshots in."; exit 1; }

mkdir -p "$OUTPUT_DIR"

found=0
missing=0
total_bytes=0

for slug in "${SLUGS[@]}"; do
  # Find any input file matching this slug (jpg, jpeg, png, webp, heic)
  input=""
  for ext in jpg jpeg png webp heic JPG JPEG PNG WEBP HEIC; do
    if [ -f "$INPUT_DIR/$slug.$ext" ]; then
      input="$INPUT_DIR/$slug.$ext"
      break
    fi
  done

  if [ -z "$input" ]; then
    echo "  [skip] $slug — no source file in $INPUT_DIR/"
    missing=$((missing+1))
    continue
  fi

  output="$OUTPUT_DIR/$slug.webp"

  # Center-crop to square, resize to SIZE×SIZE, pipe to cwebp
  # -resize "${SIZE}x${SIZE}^" + -extent makes a clean centered square crop
  magick "$input" \
    -auto-orient \
    -resize "${SIZE}x${SIZE}^" \
    -gravity center \
    -extent "${SIZE}x${SIZE}" \
    -strip \
    "png:-" | cwebp -quiet -q $QUALITY -o "$output" -- -

  bytes=$(wc -c < "$output" | tr -d ' ')
  total_bytes=$((total_bytes + bytes))
  kb=$(echo "scale=1; $bytes/1024" | bc)
  echo "  [ok]   $slug → $output (${kb} KB)"
  found=$((found+1))
done

echo ""
echo "Encoded: $found"
echo "Missing: $missing"
total_kb=$(echo "scale=1; $total_bytes/1024" | bc)
echo "Total size: ${total_kb} KB"
echo ""
echo "Done. Files are in $OUTPUT_DIR/"
