#!/bin/ash

# Generate secret key here.
SECRET_KEY=$(echo $(uuidgen | sed 's/[-]//g')$(openssl rand -hex 20) | base64 -w 0)
SCRIPT_DIR=$(dirname "$(readlink -f "$0")")

# Replace to `environment.prod.ts` file which is located the same with this shell script.
sed -i "s/secretKey: \"\",/secretKey: \"$SECRET_KEY\",/g" "$SCRIPT_DIR/environment.prod.ts"

# Move this file to correct path.
mv $SCRIPT_DIR/environment.prod.ts ${SCRIPT_DIR%/*}/../src/evnironments/environment.ts
