export function LoadingState() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Carregando dados do clima"
      className="flex flex-col items-center justify-center gap-4 py-16"
    >
      <div className="w-10 h-10 rounded-full border-2 border-[#e0e0e0] border-t-[#0066cc] animate-spin" />
      <p className="text-[17px] text-[#7a7a7a] font-normal" style={{ fontFamily: 'SF Pro Text, system-ui, -apple-system, sans-serif' }}>
        Carregando...
      </p>
    </div>
  );
}
