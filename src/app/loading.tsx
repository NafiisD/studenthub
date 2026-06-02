export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        {/* Animated Double Spinner */}
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 rounded-full border-4 border-slate-800"></div>
          <div className="absolute inset-0 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-4 border-indigo-500 border-b-transparent animate-spin-reverse" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        </div>
        
        {/* Loading Text */}
        <div className="flex items-center gap-1 text-cyan-400 font-semibold text-sm animate-pulse">
          Memuat Halaman
          <span className="flex gap-0.5">
            <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
            <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
            <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
          </span>
        </div>
      </div>
    </div>
  );
}
