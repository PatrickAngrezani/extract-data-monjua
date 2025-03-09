import * as dotenv from "dotenv";
import oracledb from "oracledb";

dotenv.config({ path: __dirname + "/../.env" });
const user = process.env.DB_USER;
console.log({ user });

const dbConfig = {
  user: process.env.DB_USER as string,
  password: process.env.DB_PASSWORD as string,
  connectString: `${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_SERVICE}`,
};

async function connectDB() {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    console.log("Connection established");

    const result = await connection.execute("SELECT SYSDATE FROM DUAL");
    console.log("Data no Oracle:", result.rows);
  } catch (error) {
    console.error("Erro ao conectar ao Oracle:", error);
  } finally {
    if (connection) {
      try {
        await connection.close();
        console.log("Conexão fechada.");
      } catch (err) {
        console.error("Erro ao fechar a conexão:", err);
      }
    }
  }
}

connectDB();

export default connectDB();
