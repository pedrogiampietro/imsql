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

  if (req.method === "GET") {
    try {
      const tablesQuery = "SELECT table_name FROM user_tables";
      const tablesResult = await executeSql(tablesQuery);
      const tables = tablesResult.rows.map((row) => row.TABLE_NAME);
      console.log("Tabelas mapeadas:", tables);

      const columnsQuery = "SELECT column_name FROM user_tab_columns";
      const columnsResult = await executeSql(columnsQuery);
      const columns = columnsResult.rows.map((row) => row.COLUMN_NAME);
      console.log("Colunas mapeadas:", columns);

      res.status(200).json({ tables, columns });
    } catch (error) {
      console.error("Erro ao obter metadados do banco de dados:", error);
      res.status(500).send("Erro interno do servidor");
    }
  } else if (req.method === "POST") {
    try {
      // Implement your logic for POST request here
      // For example, you might want to execute a SQL command received in the request body
      const result = await executeSql(req.body.sql);
      res.status(200).json(result);
    } catch (error) {
      console.error("Error executing SQL command:", error);
      res.status(500).send("Internal server error");
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Método ${req.method} Não Permitido`);
  }
}
