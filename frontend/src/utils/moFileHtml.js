// Chức năng: Mở nội dung HTML trong tab mới.
export function moHtmlTrongTabMoi(html) {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  window.open(url, '_blank', 'noopener,noreferrer');
  window.setTimeout(() => URL.revokeObjectURL(url), 30000);
}
