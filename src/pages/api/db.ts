import oracledb from "oracledb";
import "dotenv/config";

let pool: any;

const dbConfig = {
  user: "dbamv",
  password: "dbamv",
  type: "oracle",
  host: "10.0.101.10",
  connectString:
    "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=10.0.101.10)(PORT=1521))(CONNECT_DATA=(SERVER=dbteste)(SERVICE_NAME=dbteste)))",
};

export async function getPool() {
  if (!pool) {
    try {
      pool = await oracledb.createPool(dbConfig);
      console.log("Pool de conexões criado");
    } catch (err) {
      console.error("Erro ao criar o pool de conexões", err);
      throw err;
    }
  }
  return pool;
}

export async function executeSql(sql, binds = {}) {
  const connectionPool = await getPool();
  let connection;

  try {
    connection = await connectionPool.getConnection();
    const options = { outFormat: oracledb.OUT_FORMAT_OBJECT }; // Opções, incluindo formato de saída
    const result = await connection.execute(sql, binds, options); // Usa parâmetros vazios por padrão
    return result;
  } catch (err) {
    console.error("Erro ao executar SQL", err);
    throw err;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Erro ao fechar a conexão", err);
      }
    }
  }
}
