cp -f envs/production/.env .
amplify env checkout production
amplify publish --force
aws cloudfront create-invalidation --distribution-id E19Y4QEYP06PUI --paths "/*"
