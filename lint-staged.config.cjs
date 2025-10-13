module.exports = {
  "*.{js,ts,tsx}": [
    "turbo run lint -- --no-warn-ignored",
    "prettier --write --ignore-unknown",
  ],
  "*.{json,md,css,scss}": ["prettier --write --ignore-unknown"],
};
