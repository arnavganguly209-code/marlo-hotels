import { getDb } from "@/lib/db";

export async function AdminModulePage({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold tracking-[0.28em] text-[#D9B46B] uppercase">
        Operations
      </p>
      <h1 className="font-display mt-2 text-3xl font-semibold tracking-[-0.02em] text-ivory md:text-4xl">
        {title}
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-cream-200/65">
        {description}
      </p>
      <div className="mt-8">{children}</div>
    </div>
  );
}

export function AdminTable({
  headers,
  rows,
  empty,
}: {
  headers: string[];
  rows: string[][];
  empty: string;
}) {
  if (!rows.length) {
    return (
      <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] px-6 py-16 text-center text-sm text-cream-200/55">
        {empty}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-white/[0.04] text-[10px] tracking-[0.18em] text-[#D9B46B] uppercase">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-4 py-3 font-semibold">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/8">
          {rows.map((row, index) => (
            <tr key={index} className="text-cream-200/80">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-4 py-3 whitespace-nowrap">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export { getDb };
