import React, { useState } from "react";
import axios from "axios";
import DataTable from "../components/DataTable";

const SqlExecutor = () => {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);

  const handleQueryChange = (event) => {
    setQuery(event.target.value);
  };

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
      <textarea
        value={query}
        onChange={handleQueryChange}
        placeholder="Write your SQL query here"
        rows={4}
        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
