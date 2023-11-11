import { NextApiRequest, NextApiResponse } from "next";

import { executeSql } from "../db";
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

  const { tableName } = req.query;

  try {
    const query = `SELECT column_name FROM user_tab_columns WHERE table_name = :tableName`;
    const binds = { tableName: tableName.toUpperCase() }; // Converte o nome da tabela para maiúsculas
    const result = await executeSql(query, binds);
    const columns = result.rows.map((row) => row[0]);
    console.log("Resultados da consulta para colunas:", result.rows);

    res.json({ columns: result.rows.map((row) => row.COLUMN_NAME) });
  } catch (error) {
    console.error("Erro ao obter colunas da tabela:", tableName, error);
    res.status(500).send("Erro interno do servidor");
  }
}
