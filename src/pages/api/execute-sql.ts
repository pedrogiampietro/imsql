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
    try {
      const result = await executeSql(req.body.sql);

      res.status(200).json(result);
    } catch (error) {
      console.error("Erro na execução do SQL", error);
      res.status(500).send("Erro na execução do SQL");
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
