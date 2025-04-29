// ui/table.js
import React from "react";

export function Table({ children, className }) {
  return (
    <div className="w-full overflow-auto">
      <table className={`w-full caption-bottom text-sm ${className || ""}`}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children, className }) {
  return <thead className={className}>{children}</thead>;
}

export function TableBody({ children, className }) {
  return <tbody className={`border-t ${className || ""}`}>{children}</tbody>;
}

export function TableRow({ children, className }) {
  return (
    <tr className={`border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted ${className || ""}`}>
      {children}
    </tr>
  );
}

export function TableHead({ children, className }) {
  return (
    <th className={`h-12 px-4 text-left align-middle font-medium text-muted-foreground ${className || ""}`}>
      {children}
    </th>
  );
}

export function TableCell({ children, className }) {
  return <td className={`p-4 align-middle ${className || ""}`}>{children}</td>;
}
