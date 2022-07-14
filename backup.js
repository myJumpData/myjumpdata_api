const { MongoTools } = require("node-mongotools");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "./.env") });

const ENV_DATA = {
  DB_USER: process.env["DB_USER"],
  DB_PSWD: process.env["DB_PSWD"],
  DB_HOST: process.env["DB_HOST"],
  DB_PORT: process.env["DB_PORT"],
  DB_NAME: process.env["DB_NAME"],
};

if (ENV_DATA.DB_HOST === null || ENV_DATA.DB_HOST === "") {
  ENV_DATA.DB_HOST = "localhost";
}
if (ENV_DATA.DB_PORT === null || ENV_DATA.DB_PORT === "") {
  ENV_DATA.DB_PORT = "27017";
}

const CONNECT_STRING_DEFAULT = `mongodb://${ENV_DATA.DB_HOST}:${ENV_DATA.DB_PORT}`;

const mongoTools = new MongoTools();
const mtOptions = {
  uri: CONNECT_STRING_DEFAULT,
  username: ENV_DATA.DB_USER,
  password: ENV_DATA.DB_PSWD,
};
mongoTools
  .mongodump(mtOptions)
  .then((data) => {
    console.log(data);
  })
  .catch((e) => {
    console.log(e);
  });
