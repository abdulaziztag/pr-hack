"use client";
import * as React from "react";

export default function EventsPage() {
  const [rows, setRows] = React.useState<any[]>([]);
  React.useEffect(() => {
    refresh();
    const id = setInterval(refresh, 2000);
    return () => clearInterval(id);
  }, []);
  function refresh() {
    fetch("/admin/events")
      .then((r) => r.json())
      .then(setRows)
      .catch(() => {
        // Fail silently
      });
  }
  return (
    <main className="p-4">
      <h1 className="mb-3 text-lg font-semibold">Events (demo)</h1>
      <div className="overflow-auto rounded border">
        <table className="min-w-[760px] text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="px-2 py-1 text-left">ts</th>
              <th className="px-2 py-1 text-left">session</th>
              <th className="px-2 py-1 text-left">name</th>
              <th className="px-2 py-1 text-left">meta</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="even:bg-muted/40">
                <td className="px-2 py-1">
                  {new Date(r.ts).toLocaleTimeString()}
                </td>
                <td className="px-2 py-1">{r.session}</td>
                <td className="px-2 py-1">{r.name}</td>
                <td className="px-2 py-1">
                  {r.meta ? JSON.stringify(r.meta) : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

