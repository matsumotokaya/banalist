import { useState } from 'react';

interface TextEditorProps {
  onAddText: (text: string) => void;
}

export const TextEditor = ({ onAddText }: TextEditorProps) => {
  const [inputText, setInputText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onAddText(inputText);
      setInputText('');
    }
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-900 mb-3">
        テキスト追加
      </label>
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="テキストを入力..."
          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
        <button
          type="submit"
          className="w-full py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all font-medium text-sm shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!inputText.trim()}
        >
          追加
        </button>
      </form>
    </div>
  );
};
