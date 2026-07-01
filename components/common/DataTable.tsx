'use client';

import { ReactNode } from 'react';
import { Search } from 'lucide-react';

interface Column<T> {
  header: string;
  accessorKey: keyof T | ((row: T) => ReactNode);
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}

export default function DataTable<T>({ data, columns, loading, emptyMessage = 'No data found', onRowClick }: DataTableProps<T>) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
      {loading ? (
        <div className="px-6 py-8 text-center text-slate-500">Loading...</div>
      ) : data.length === 0 ? (
        <div className="px-6 py-8 text-center text-slate-500">{emptyMessage}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                {columns.map((col, idx) => (
                  <th key={idx} className={`px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider ${col.className || ''}`}>
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={`hover:bg-emerald-50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className={`px-6 py-4 ${col.className || ''}`}>
                      {typeof col.accessorKey === 'function' ? col.accessorKey(row) : String(row[col.accessorKey] ?? '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}