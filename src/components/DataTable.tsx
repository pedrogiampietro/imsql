import React from "react";

const DataTable = ({ metaData, rows }) => {
  if (!metaData || !rows) {
    return null;
  }

  return (
    <table className="min-w-full leading-normal">
      <thead>
        <tr className="border-b">
          {metaData.map((col, index) => (
            <th
              key={index}
              className="px-5 py-3 bg-gray-800 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider"
            >
              {col.name}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={rowIndex} className="hover:bg-gray-200">
            {row.map((cell, cellIndex) => (
              <td
                key={cellIndex}
                className="px-5 py-2 border-b border-gray-200 bg-white text-sm"
              >
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default DataTable;
