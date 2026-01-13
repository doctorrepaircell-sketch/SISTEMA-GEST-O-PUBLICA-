
import { Person } from "../types";

export const exportToCSV = (data: Person[], filename: string = 'relatorio_moradores.csv') => {
  const headers = [
    'Nome', 'Parentesco', 'CPF', 'RG', 'Nascimento', 'Status Civil', 
    'Bairro', 'Cidade', 'Estudando', 'Escola', 'Serie', 'Motivo Nao Estuda'
  ];

  const rows = data.map(p => [
    p.name,
    p.relationship,
    p.cpf,
    p.rg,
    p.birthDate,
    p.civilStatus || '',
    p.neighborhood || '',
    p.city || '',
    p.education?.isStudying ? 'Sim' : 'Não',
    p.education?.schoolName || '',
    p.education?.grade || '',
    p.education?.reasonNotStudying || ''
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToPDF = (data: Person[], institutionName: string, filename: string = 'relatorio_gestao_publica.pdf') => {
  const { jsPDF } = (window as any).jspdf;
  const doc = new jsPDF();

  // Cabeçalho Institucional
  doc.setFontSize(18);
  doc.setTextColor(30, 41, 59); // slate-800
  doc.text(institutionName.toUpperCase(), 14, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text("SISTEMA DE CADASTRO E GESTÃO PÚBLICA", 14, 28);
  doc.text(`Relatório Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 33);
  
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.line(14, 38, 196, 38);

  const tableColumn = ["Nome", "CPF", "Parentesco", "Idade", "Bairro", "Escolaridade"];
  const tableRows: any[] = [];

  const getAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  data.forEach(p => {
    const personData = [
      p.name,
      p.cpf,
      p.relationship,
      getAge(p.birthDate).toString(),
      p.neighborhood || '-',
      p.education?.isStudying ? `Estuda (${p.education.schoolName})` : "Não Estuda"
    ];
    tableRows.push(personData);
  });

  (doc as any).autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 45,
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255], fontStyle: 'bold' }, // blue-600
    alternateRowStyles: { fillColor: [248, 250, 252] }, // slate-50
  });

  doc.save(filename);
};
