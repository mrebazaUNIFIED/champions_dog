import { POSITION_LABELS, SKILL_LABELS, type SelectionResult } from '../../types';

export async function exportSelectionToPdf(result: SelectionResult, filename = 'seleccion_perritos_locos.pdf') {
  // jsPDF + jspdf-autotable se cargan solo al exportar, no van en el bundle inicial de la página.
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(6, 26, 18);
  doc.rect(0, 0, pageWidth, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('4.º CAMPEONATO PERRITOS LOCOS', pageWidth / 2, 13, { align: 'center' });
  doc.setFontSize(11);
  doc.text('SELECCIÓN OFICIAL DE EQUIPOS', pageWidth / 2, 21, { align: 'center' });

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generado: ${new Date(result.generatedAt).toLocaleString('es-AR')}`, 14, 36);

  let cursorY = 42;

  result.teams.forEach((team) => {
    const stats = result.stats.find((s) => s.teamId === team.id);

    if (cursorY > 250) {
      doc.addPage();
      cursorY = 20;
    }

    doc.setFillColor(...hexToRgb(team.color));
    doc.rect(14, cursorY, 4, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(team.name, 21, cursorY + 5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(
      `Puntaje total: ${stats?.totalScore ?? 0}   ·   Promedio: ${(stats?.averageScore ?? 0).toFixed(1)}`,
      pageWidth - 14,
      cursorY + 5,
      { align: 'right' },
    );

    autoTable(doc, {
      startY: cursorY + 9,
      head: [['Jugador', 'Posición', 'Nivel', 'Puntos']],
      body: team.players.map((p) => [
        p.player.fullName,
        POSITION_LABELS[p.assignedPosition],
        `${p.player.skillLevel} · ${SKILL_LABELS[p.player.skillLevel]}`,
        String(p.score),
      ]),
      theme: 'striped',
      headStyles: { fillColor: hexToRgb(team.color) },
      styles: { fontSize: 8, cellPadding: 2 },
      margin: { left: 14, right: 14 },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cursorY = (doc as any).lastAutoTable.finalY + 8;
  });

  if (cursorY > 240) {
    doc.addPage();
    cursorY = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Resumen comparativo', 14, cursorY + 4);

  autoTable(doc, {
    startY: cursorY + 8,
    head: [['Equipo', 'Puntaje total', 'Promedio']],
    body: result.stats.map((s) => {
      const team = result.teams.find((t) => t.id === s.teamId);
      return [team?.name ?? '', String(s.totalScore), s.averageScore.toFixed(1)];
    }),
    theme: 'grid',
    styles: { fontSize: 9 },
    margin: { left: 14, right: 14 },
  });

  doc.save(filename);
}

function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.replace('#', '');
  const bigint = parseInt(normalized, 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}
