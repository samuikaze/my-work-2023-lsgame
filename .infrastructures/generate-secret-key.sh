#!/bin/ash

# You can process your environment values here if you don't want it expose to public repository
# Or the value is randomed completely.

# Define this script absolute path
SCRIPT_DIR=$(dirname "$(readlink -f "$0")")

# Generate secret key here.
# SECRET_KEY=$(echo $(uuidgen | sed 's/[-]//g')$(openssl rand -hex 20) | base64 -w 0)

# Replace to `environment.prod.ts` file which is located the same with this shell script.
# sed -i "s/secretKey: \"\",/secretKey: \"$SECRET_KEY\",/g" "$SCRIPT_DIR/environment.prod.ts"

# Move this file to correct path.
mv $SCRIPT_DIR/environment.prod.ts ${SCRIPT_DIR%/*}/src/environments/environment.ts
