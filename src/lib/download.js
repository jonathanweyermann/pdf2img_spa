// Cross-origin links ignore the `download` attribute, so fetch the image and
// save it from a blob to get a friendly file name. Falls back to opening it.
export const downloadFile = async (url, filename) => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`status ${response.status}`);
    const href = URL.createObjectURL(await response.blob());
    const link = document.createElement('a');
    link.href = href;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(href), 1000);
  } catch {
    window.open(url, '_blank', 'noopener');
  }
};

export const pageFileName = (uploadFileName, page) => `${uploadFileName}-page-${page}.jpg`;
