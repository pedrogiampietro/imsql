import React, { useState, useEffect } from "react";
import axios from "axios";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/ext-language_tools";
import "ace-builds/src-noconflict/mode-sql";
import "ace-builds/src-noconflict/theme-monokai";

import DataTable from "../components/DataTable";

const SqlExecutor = () => {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [dbMetaData, setDbMetaData] = useState({ tables: [], columns: [] });
  const [aliasMapping, setAliasMapping] = useState({});

  useEffect(() => {
    const cachedMetadata = localStorage.getItem("dbMetadata");
    if (cachedMetadata) {
      setDbMetaData(JSON.parse(cachedMetadata));
    } else {
      fetchMetaData();
    }
  }, []);

  const fetchMetaData = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/db-metadata");
      console.log("Metadados recebidos:", response.data);
      setDbMetaData({
        tables: response.data.tables,
        columns: response.data.columns,
      });
      localStorage.setItem("dbMetadata", JSON.stringify(response.data));
    } catch (error) {
      console.error("Error fetching database metadata:", error);
    }
  };

  const fetchColumnsForTable = async (tableName) => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/columns/${tableName}`
      );
      console.log("Resposta da API para colunas:", response.data.columns);
      return response.data.columns;
    } catch (error) {
      console.error("Error fetching columns for table:", tableName, error);
      return [];
    }
  };

  const getCompletionsForPrefix = async (editor, session, pos, callback) => {
    const queryUpToCursor = session
      .getValue()
      .substring(0, session.doc.positionToIndex(pos));
    console.log("Consulta até o cursor:", queryUpToCursor);

    const lastToken = queryUpToCursor.trim().split(/\s+/).pop();
    if (lastToken && lastToken.includes(".")) {
      console.log("Sugerindo colunas");
      const tableNameOrAlias = lastToken.split(".")[0];
      const actualTableName =
        aliasMapping[tableNameOrAlias.toLowerCase()] || tableNameOrAlias;
      if (actualTableName) {
        console.log("Buscando colunas para a tabela:", actualTableName);
        const columns = await fetchColumnsForTable(actualTableName);
        console.log("Colunas retornadas para autocompletar:", columns);
        callback(
          null,
          columns.map((c) => ({ caption: c, value: c, meta: "column" }))
        );
        return;
      }
    }

    if (queryUpToCursor.toUpperCase().includes("FROM ")) {
      console.log("Sugerindo tabelas");
      callback(
        null,
        dbMetaData.tables.map((t) => ({ caption: t, value: t, meta: "table" }))
      );
    }
  };

  const handleQueryChange = (newValue) => {
    setQuery(newValue);
    updateAliasMapping(newValue); // Atualiza o mapeamento de apelidos
  };

  const updateAliasMapping = (newQuery) => {
    const fromRegex = /from\s+(\S+)\s*(\S*)/i;
    const match = newQuery.match(fromRegex);
    if (match && match[2] && match[1] !== match[2]) {
      setAliasMapping({ ...aliasMapping, [match[2]]: match[1] });
    }
  };

  const customCompleter = {
    getCompletions: function (editor, session, pos, prefix, callback) {
      getCompletionsForPrefix(editor, session, pos, callback);
    },
  };

  useEffect(() => {
    ace.require("ace/ext/language_tools").addCompleter(customCompleter);
  }, [dbMetaData]);

  const executeQuery = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/execute-sql",
        { sql: query }
      );
      setResult(response.data);
    } catch (error) {
      console.error("Error executing query:", error);
      setResult({ error: "Error executing query. See console for details." });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <AceEditor
        mode="sql"
        theme="monokai"
        onChange={handleQueryChange}
        name="queryEditor"
        editorProps={{ $blockScrolling: true }}
        value={query}
        width="100%"
        setOptions={{
          enableBasicAutocompletion: true,
          enableLiveAutocompletion: true,
          enableSnippets: true,
        }}
      />
      <button
        onClick={executeQuery}
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
      >
        Execute Query
      </button>
      {result && (
        <div className="mt-4">
          {result.error ? (
            <pre className="text-red-500">{result.error}</pre>
          ) : (
            <DataTable metaData={result.metaData} rows={result.rows} />
          )}
        </div>
      )}
    </div>
  );
};

export default SqlExecutor;
