pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdf.worker.min.js';

document.getElementById('pdf-upload').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async function () {
    const typedArray = new Uint8Array(this.result);
    const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
    const tbody = document.querySelector('#result-table tbody');
    tbody.innerHTML = '';

    let dayCounter = 1;

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const texts = content.items.map(item => item.str.trim()).filter(t => t.length > 0);

      const last6 = texts.slice(-6);
      if (last6.length < 6) continue; // skip if incomplete

      const days = [
        { ja: last6[1], en: last6[0], author: last6[2] },
        { ja: last6[4], en: last6[3], author: last6[5] }
      ];

      for (const day of days) {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${`1月${dayCounter}日`}</td>
          <td>${day.ja}</td>
          <td>${day.en}</td>
          <td>${day.author}</td>
        `;
        tbody.appendChild(row);
        dayCounter++;
      }
    }
  };
  reader.readAsArrayBuffer(file);
});
