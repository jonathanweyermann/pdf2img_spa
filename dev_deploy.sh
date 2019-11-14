cp -f envs/dev/.env .
amplify env checkout dev
amplify publish --force
