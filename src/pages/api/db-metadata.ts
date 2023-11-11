import { NextApiRequest, NextApiResponse } from "next";
import { executeSql } from "./db";
import Cors from "cors";

const cors = Cors({});

function runMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  fn: (
    req: NextApiRequest,
    res: NextApiResponse,
    next: (result: any) => void
  ) => void
) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await runMiddleware(req, res, cors);

  if (req.method === "POST") {
    // Lida com solicitações POST
    try {
      const { sql } = req.body; // Assume que o SQL é passado no corpo da solicitação
      const result = await executeSql(sql);
      res.status(200).json(result);
    } catch (error) {
      console.error("Erro ao executar a consulta SQL:", error);
      res.status(500).send("Erro interno do servidor");
    }
  } else if (req.method === "GET") {
    // Lida com solicitações GET (metadados do banco de dados)
    try {
      const tablesQuery = "SELECT table_name FROM user_tables";
      const tablesResult = await executeSql(tablesQuery);
      console.log("Primeira linha das tabelas:", tablesResult.rows[0]);
      const tables = tablesResult.rows.map((row) => row.TABLE_NAME || row[0]);

      const columnsQuery = "SELECT column_name FROM user_tab_columns";
      const columnsResult = await executeSql(columnsQuery);
      console.log("Primeira linha das colunas:", columnsResult.rows[0]);
      const columns = columnsResult.rows.map(
        (row) => row.COLUMN_NAME || row[0]
      );

      res.status(200).json({ tables, columns });
    } catch (error) {
      console.error("Erro ao obter metadados do banco de dados:", error);
      res.status(500).send("Erro interno do servidor");
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Método ${req.method} Não Permitido`);
  }
}
