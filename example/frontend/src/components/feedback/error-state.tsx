interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="flex flex-col items-center justify-center gap-4 py-16"
    >
      <p
        className="text-[17px] text-[#1d1d1f] text-center max-w-xs"
        style={{ fontFamily: 'SF Pro Text, system-ui, -apple-system, sans-serif' }}
      >
        {message}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="px-[22px] py-[11px] bg-[#0066cc] text-white rounded-full text-[17px] font-normal active:scale-95 transition-transform focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
          style={{ fontFamily: 'SF Pro Text, system-ui, -apple-system, sans-serif' }}
        >
          Tentar novamente
        </button>
      )}
    </div>
  );
}
