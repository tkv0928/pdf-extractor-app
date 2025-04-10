// ✅ CDN経由でPDF.jsのワーカーを指定（GitHub Pages対応）
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

    const output = document.getElementById('output');
    if (!output) {
      console.error("❌ <div id='output'> が見つかりません！");
      return;
    }

    output.innerHTML = ''; // 出力エリアを初期化

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const lines = content.items.map(item => item.str.trim()).filter(t => t.length > 0);

      console.log(`📃 Page ${i} 抽出行数: ${lines.length}`);

      const pageBlock = document.createElement('div');
      const header = document.createElement('h3');
      header.textContent = `📄 Page ${i}`;
      const pre = document.createElement('pre');
      pre.textContent = lines.join('\n');

      pageBlock.appendChild(header);
      pageBlock.appendChild(pre);
      output.appendChild(pageBlock);
    }

    console.log('✅ すべてのページのテキストを抽出・表示しました');
  };

  reader.readAsArrayBuffer(file);
});
