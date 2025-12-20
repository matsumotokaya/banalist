import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface TextEditorProps {
  onAddText: (text: string) => void;
}

export const TextEditor = ({ onAddText }: TextEditorProps) => {
  const { t } = useTranslation('editor');
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
        {t('object.addText')}
      </label>
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={t('textInput.placeholder')}
          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
        <button
          type="submit"
          className="w-full py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all font-medium text-sm shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!inputText.trim()}
        >
          {t('textInput.add')}
        </button>
      </form>
    </div>
  );
};
