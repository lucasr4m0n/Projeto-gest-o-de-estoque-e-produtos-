import Spinner from './Spinner.jsx';

/**
 * Tabela generica e reutilizavel.
 * @param {{key:string, header:string, render?:Function, className?:string}[]} columns
 * @param {Array} data
 * @param {boolean} loading
 * @param {string} emptyMessage
 * @param {Function} rowKey funcao que retorna a chave unica de cada linha
 */
export default function Table({
  columns,
  data = [],
  loading = false,
  emptyMessage = 'Nenhum registro encontrado.',
  rowKey = (row, index) => row.id ?? index,
}) {
  return (
    // RNF-F01: rolagem horizontal em telas menores.
    <div className="w-full overflow-x-auto rounded-lg border border-base-200">
      <table className="min-w-full divide-y divide-base-200 text-sm">
        <thead className="bg-base-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={`px-4 py-3 text-left font-semibold text-base-600 ${col.className || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-base-100 bg-white">
          {loading && (
            <tr>
              <td colSpan={columns.length} className="px-4 py-10 text-center">
                <Spinner />
              </td>
            </tr>
          )}

          {!loading && data.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-4 py-10 text-center text-base-400">
                {emptyMessage}
              </td>
            </tr>
          )}

          {!loading &&
            data.map((row, index) => (
              <tr key={rowKey(row, index)} className="hover:bg-base-50">
                {columns.map((col) => (
                  <td key={col.key} className={`px-4 py-3 text-base-800 ${col.className || ''}`}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
