// CDN経由でPDF.jsワーカーを読み込む（GitHub PagesでもOK）
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
        const maybeEn = lines[j];
        const maybeJa = lines[j + 1];
        const maybeAuthor = lines[j + 2];

        // 出典行が「（西暦～西暦・○○の○○）」形式かどうかで判定
        const authorPattern = /（[0-9\-B.C.～年・（）]+）/;

        if (authorPattern.test(maybeAuthor) &&
            /[a-zA-Z]/.test(maybeEn) &&
            /[ぁ-んァ-ン一-龯]/.test(maybeJa)) {

          const row = document.createElement('tr');
          row.innerHTML = `
            <td>1月${String(dayCounter).padStart(2, '0')}日</td>
            <td>${maybeJa}</td>
            <td>${maybeEn}</td>
            <td>${maybeAuthor}</td>
          `;
          tbody.appendChild(row);
          console.log(`✅ 名言抽出: ${maybeJa} / ${maybeEn} / ${maybeAuthor}`);
          dayCounter++;
          j += 2; // 3行分スキップ
        }
      }
    }

    console.log(`✅ 全処理完了。抽出件数: ${dayCounter - 1}`);
  };
  reader.readAsArrayBuffer(file);
});
