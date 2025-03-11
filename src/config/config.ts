import * as dotenv from "dotenv";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: `${__dirname}/../../.env` });

export default {
    dbHostDW: process.env.DW_DB_HOST,
    dbPortDW: process.env.DW_DB_PORT,
    dbNameDW: process.env.DW_DB_NAME,
    dbUserDW: process.env.DW_DB_USER,
    dbPasswordDW: process.env.DW_DB_PASSWORD,
    debug: true,
}