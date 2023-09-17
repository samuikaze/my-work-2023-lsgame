# Generate secret key here.
SECRET_KEY=$(echo $(uuidgen | sed 's/[-]//g')$(openssl rand -hex 20) | base64 -w 0)

# Replace to `environment.prod.ts` file which is located the same with this shell script.
sed -i "s/secretKey: \"\",/secretKey: \"$SECRET_KEY\",/g" "./environment.prod.ts"

# Move this file to correct path.
mv ./environment.prod.ts ../src/evnironments/environment.ts
