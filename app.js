// CDNでワーカーを明示（重要）
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js';

console.log('✅ app.js loaded');

document.getElementById('pdf-upload').addEventListener('change', async (e) => {
  console.log('📤 PDFアップロード開始');

  const file = e.target.files[0];
  if (!file) {
    console.log('⚠️ ファイルが選択されていません');
    return;
  }

  const reader = new FileReader();
  reader.onload = async function () {
    console.log('📖 PDF読み込み中…');

    const typedArray = new Uint8Array(this.result);
    const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
    console.log(`📄 PDFページ数: ${pdf.numPages}`);

    const tbody = document.querySelector('#result-table tbody');
    tbody.innerHTML = '';
    let dayCounter = 1;

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const lines = content.items.map(item => item.str.trim()).filter(t => t.length > 0);

      console.log(`📃 Page ${i} 抽出行数: ${lines.length}`);

      for (let j = 0; j <= lines.length - 3; j++) {
        const en = lines[j];
        const ja = lines[j + 1];
        const author = lines[j + 2];

        if (/[a-zA-Z]/.test(en) && /[ぁ-んァ-ン一-龯]/.test(ja) && /（.*?）/.test(author)) {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>1月${dayCounter}日</td>
            <td>${ja}</td>
            <td>${en}</td>
            <td>${author}</td>
          `;
          tbody.appendChild(row);
          console.log(`✅ 名言セット追加: ${ja} / ${en}`);
          dayCounter++;
          j += 2;
        }
      }
    }
  };
  reader.readAsArrayBuffer(file);
});
