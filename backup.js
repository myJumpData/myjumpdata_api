const { MongoTools } = require("node-mongotools");
const { CONNECT_STRING_DEFAULT, ENV_DATA } = require("./src/consts/db");

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
