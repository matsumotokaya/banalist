export type ExportMethod = 'share-files' | 'blob-download' | 'dataurl-fallback';

export interface ExportImageResult {
  method: ExportMethod;
  inAppBrowser: boolean;
  isIOS: boolean;
}

const IN_APP_BROWSER_PATTERN = /(Instagram|FBAN|FBAV|Line|MicroMessenger|wv)/i;

const isIOSDevice = () => {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) || (ua.includes('Macintosh') && 'ontouchend' in document);
};

const isInAppBrowser = () => {
  if (typeof window === 'undefined') return false;
  return IN_APP_BROWSER_PATTERN.test(window.navigator.userAgent);
};

const sanitizeFileName = (fileName: string) => {
  const cleaned = fileName.replace(/[\\/:*?"<>|]+/g, '-').trim();
  return cleaned.length > 0 ? cleaned : 'banner.png';
};

const triggerDownload = (href: string, fileName: string) => {
  try {
    const link = document.createElement('a');
    link.href = href;
    link.download = sanitizeFileName(fileName);
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  } catch {
    return false;
  }
};

const dataUrlToBlob = async (dataURL: string) => {
  const response = await fetch(dataURL);
  return response.blob();
};

export const exportImageFromDataUrl = async (dataURL: string, fileName: string): Promise<ExportImageResult> => {
  const inAppBrowser = isInAppBrowser();
  const isIOS = isIOSDevice();

  const blob = await dataUrlToBlob(dataURL);
  const safeFileName = sanitizeFileName(fileName);
  const file = new File([blob], safeFileName, { type: blob.type || 'image/png' });

  const shareNavigator = window.navigator as Navigator & {
    share?: (data?: ShareData) => Promise<void>;
    canShare?: (data?: ShareData) => boolean;
  };

  const canShareFile =
    typeof shareNavigator.share === 'function' &&
    typeof shareNavigator.canShare === 'function' &&
    shareNavigator.canShare({ files: [file] });

  if (canShareFile) {
    await shareNavigator.share({
      files: [file],
      title: safeFileName,
    });
    return {
      method: 'share-files',
      inAppBrowser,
      isIOS,
    };
  }

  const blobUrl = URL.createObjectURL(blob);
  const blobDownloadTriggered = triggerDownload(blobUrl, safeFileName);
  window.setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);

  if (blobDownloadTriggered) {
    return {
      method: 'blob-download',
      inAppBrowser,
      isIOS,
    };
  }

  triggerDownload(dataURL, safeFileName);
  return {
    method: 'dataurl-fallback',
    inAppBrowser,
    isIOS,
  };
};