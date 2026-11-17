export async function exportNodeToImage(node: HTMLElement, filename = 'equipos_perritos_locos.png') {
  // html2canvas-pro es pesada (render de CSS a canvas): se carga solo al exportar.
  const [{ default: html2canvas }, { saveAs }] = await Promise.all([
    import('html2canvas-pro'),
    import('file-saver'),
  ]);

  const canvas = await html2canvas(node, {
    backgroundColor: '#04120c',
    scale: 2,
    useCORS: true,
  });
  canvas.toBlob((blob) => {
    if (blob) saveAs(blob, filename);
  }, 'image/png');
}
