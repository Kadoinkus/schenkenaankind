export default function DataTable({ title, columns, rows, footer }) {
  return (
    <div className="data-table">
      <div className="data-table__header">
        <h3>{title}</h3>
      </div>
      <div className="data-table__scroll">
        <table>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key} className={column.tone ? `tone-${column.tone}` : ""}>
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={row.id || rowIndex}>
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`${column.tone ? `tone-${column.tone}` : ""} ${
                      row[`${column.key}Emphasis`] ? "is-emphasis" : ""
                    }`.trim()}
                  >
                    {row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {footer ? <div className="data-table__footer">{footer}</div> : null}
    </div>
  );
}
