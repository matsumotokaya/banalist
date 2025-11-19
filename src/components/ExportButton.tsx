interface ExportButtonProps {
  onExport: () => void;
}

export const ExportButton = ({ onExport }: ExportButtonProps) => {
  return (
    <div className="mt-6">
      <button
        onClick={onExport}
        className="w-full px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold text-lg shadow-md hover:shadow-lg"
      >
        📥 PNG をダウンロード
      </button>
    </div>
  );
};
