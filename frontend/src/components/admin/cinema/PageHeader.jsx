import React from "react";
import { Info } from "lucide-react";

export default function PageHeader({ title, subtitle, successMsg, error }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">{title}</h1>
          <p className="text-zinc-400 mt-1">{subtitle}</p>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl flex items-center gap-2">
          <Info size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-xl flex items-center gap-2">
          <Info size={18} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
