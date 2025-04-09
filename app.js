pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js';

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
      const lines = content.items.map(item => item.str.trim()).filter(t => t.length > 0);

      // 名言候補だけをフィルタ（英語、日本語、出典の3行連続が多い）
      for (let j = 0; j <= lines.length - 3; j++) {
        const en = lines[j];
        const ja = lines[j + 1];
        const author = lines[j + 2];

        // 英語・日本語・著者らしい文字列を簡易フィルタで判定
        if (/[a-zA-Z]/.test(en) && /[ぁ-んァ-ン一-龯]/.test(ja) && /（.*?）/.test(author)) {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${`1月${dayCounter}日`}</td>
            <td>${ja}</td>
            <td>${en}</td>
            <td>${author}</td>
          `;
          tbody.appendChild(row);
          dayCounter++;
          j += 2; // 3行分進める
        }
      }
    }
  };
  reader.readAsArrayBuffer(file);
});
