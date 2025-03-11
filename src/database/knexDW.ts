import knex from "knex";
import config from "../config/config.js";

const knexDW = knex({
  client: "mssql",
  connection: {
    host: config.dbHostDW,
    port: Number(config.dbPortDW),
    database: config.dbNameDW,
    user: config.dbUserDW,
    password: config.dbPasswordDW,
    options: {
      encrypt: false,
      enableArithAbort: true,
      trustServerCertificate: true,
    },
  },
  pool: { min: 0, max: 10 },
  debug: Boolean(config.debug),
  acquireConnectionTimeout: 500000,
  wrapIdentifier: (value, origImpl) => origImpl(value.toUpperCase()),
});

export default knexDW;
