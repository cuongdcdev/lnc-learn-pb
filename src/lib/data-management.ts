import type { CollectionItem } from './dummy-data';

export const exportToJSON = (data: CollectionItem[], filename = 'lnc-collections.json') => {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportToCSV = (data: CollectionItem[], filename = 'lnc-collections.csv') => {
  if (!data?.length) return;

  const headers = ['ID', 'Date', 'Domain', 'Title', 'URL', 'Selected Text', 'Mastery Level'];
  const csvRows = [headers.join(',')];

  data.forEach(item => {
    const row = [
      item.id,
      new Date(item.timestamp).toISOString(),
      `"${item.domain}"`,
      `"${item.title.replace(/"/g, '""')}"`,
      `"${item.url}"`,
      `"${item.selectedText.replace(/"/g, '""')}"`,
      item.masteryLevel
    ];
    csvRows.push(row.join(','));
  });

  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
