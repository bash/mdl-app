#!/bin/bash

set -e

make clean

BUILD_MODE=release make -B

cd build

FILES=(
  js/app.js
  js/polyfills.js
  css/app.css
)

TEMPLATE=$(cat index.html)

for FILE in ${FILES[@]}; do
  EXTENSION="${FILE##*.}"
  FILENAME="${FILE%.*}"
  CHECKSUM=$(shasum "${FILE}" | awk '{print $1}' | cut -c1-10)
  NEW_FILE=${FILENAME}-${CHECKSUM}.${EXTENSION}

  TEMPLATE=$(echo "${TEMPLATE}" | sed "s#${FILE}#${NEW_FILE}#g")

  echo "$FILE -> $NEW_FILE"

  mv "$FILE" "$NEW_FILE"
done

echo "${TEMPLATE}" > index.html

cp -r ../fonts fonts

tar -zcvf mdl-app.tar.gz ./
mkdir -p ../dist
cp mdl-app.tar.gz ../dist/

