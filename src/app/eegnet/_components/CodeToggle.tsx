export default function CodeToggle({
  label,
  code,
}: {
  label: string;
  code: string;
}) {
  return (
    <details className="mb-4 group rounded-lg border border-neutral-200 bg-neutral-50 overflow-hidden">
      <summary className="cursor-pointer select-none px-4 py-2.5 text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors flex items-center gap-2">
        <svg
          className="w-3.5 h-3.5 flex-shrink-0 transition-transform group-open:rotate-90"
          viewBox="0 0 12 12"
          fill="currentColor"
        >
          <path d="M4.5 2l5 4-5 4V2z" />
        </svg>
        <span>View Source: {label}</span>
      </summary>
      <div className="border-t border-neutral-200">
        <pre className="px-4 py-3 overflow-x-auto text-xs leading-relaxed text-neutral-700 bg-white">
          <code>{code}</code>
        </pre>
      </div>
    </details>
  );
}
