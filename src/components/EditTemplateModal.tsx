import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { TemplateRecord } from '../types/template';

interface EditTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: TemplateRecord | null;
  onSave: (params: {
    name: string;
    planType: 'free' | 'premium';
  }) => Promise<void>;
  onDelete: () => Promise<void>;
}

export function EditTemplateModal({
  isOpen,
  onClose,
  template,
  onSave,
  onDelete,
}: EditTemplateModalProps) {
  const { t } = useTranslation('modal');
  const [name, setName] = useState('');
  const [planType, setPlanType] = useState<'free' | 'premium'>('free');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Reset form when template changes
  useEffect(() => {
    if (template) {
      setName(template.name);
      setPlanType(template.planType || 'free');
      setShowDeleteConfirm(false);
    }
  }, [template]);

  const handleSave = async () => {
    if (!name.trim()) {
      alert(t('editTemplate.errors.nameEmpty'));
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        name: name.trim(),
        planType,
      });
      onClose();
    } catch (error) {
      console.error('Failed to save template:', error);
      alert(t('editTemplate.errors.saveFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete();
      onClose();
    } catch (error) {
      console.error('Failed to delete template:', error);
      alert(t('editTemplate.errors.deleteFailed'));
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (!isOpen || !template) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">{t('editTemplate.title')}</h2>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('editTemplate.templateName')}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder={t('editTemplate.templateNamePlaceholder')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('editTemplate.planType')}</label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="planType"
                  value="free"
                  checked={planType === 'free'}
                  onChange={(e) => setPlanType(e.target.value as 'free' | 'premium')}
                  className="mr-2"
                />
                <span className="text-sm">{t('editTemplate.free')}</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="planType"
                  value="premium"
                  checked={planType === 'premium'}
                  onChange={(e) => setPlanType(e.target.value as 'free' | 'premium')}
                  className="mr-2"
                />
                <span className="text-sm">{t('editTemplate.premium')}</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('editTemplate.size')}</label>
            <p className="text-sm text-gray-600">
              {template.width} × {template.height}
            </p>
          </div>
        </div>

        <div className="flex gap-3 mb-4">
          <button
            onClick={onClose}
            disabled={isSaving || isDeleting}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {t('editTemplate.cancel')}
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || isDeleting}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {isSaving ? t('editTemplate.saving') : t('editTemplate.save')}
          </button>
        </div>

        {/* Delete section */}
        <div className="border-t border-gray-200 pt-4">
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isSaving || isDeleting}
              className="w-full px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              {t('editTemplate.deleteTemplate')}
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-red-600 font-medium text-center">
                {t('editTemplate.deleteConfirm')}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {t('editTemplate.cancel')}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {isDeleting ? t('editTemplate.deleting') : t('editTemplate.delete')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
