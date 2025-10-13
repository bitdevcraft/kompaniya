/* eslint-disable perfectionist/sort-objects */
// eslint-disable-next-line no-undef
module.exports = {
  apps: [
    {
      name: "rest-express",
      cwd: "./apps/rest-express",
      script: "node",
      args: "dist/index.js",
      env: {
        NODE_ENV: "development",
        PORT: 5000,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 5000,
      },
    },
  ],
};
