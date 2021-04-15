const mysql = require("mysql");

const openConnection = async () => {
  const connection = mysql.createConnection({
    host: "us-cdbr-east-03.cleardb.com",
    user: "ba199edb6114e2",
    password: "137c0af6",
    database: "heroku_bfd06642f8899d0",
  });
  return connection.connect((err) => {
    if (err) throw err;
    return connection;
  });
};

const addRows = async () => {
  openConnection()
    .then((result) => {
      console.log(result);
    })
    .catch((err) => {});
};

module.exports = {
  addRows,
};
