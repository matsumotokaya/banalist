interface ExportButtonProps {
  onExport: () => void;
}

export const ExportButton = ({ onExport }: ExportButtonProps) => {
  return (
    <button
      onClick={onExport}
      className="w-full py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all font-semibold text-sm shadow-lg shadow-green-200 hover:shadow-xl hover:shadow-green-300 active:scale-[0.98] flex items-center justify-center gap-2"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      PNG をダウンロード
    </button>
  );
};
