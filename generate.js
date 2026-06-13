// 1. Buat elemen input file (tersembunyi)
const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.accept = '.csv';
fileInput.style.display = 'none';

// 2. Buat tombol "Generate" (Inline-Block, Melayang di Bawah)
const tombolGenerate = document.createElement('button');
tombolGenerate.innerText = 'Generate';

Object.assign(tombolGenerate.style, {
    display: 'inline-block',
    position: 'fixed',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#ff3141',
    color: 'white',
    border: 'none',
    padding: '14px 28px',
    fontSize: '16px',
    fontWeight: 'bold',
    borderRadius: '25px',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
    zIndex: '1000',
    transition: 'all 0.3s ease'
});

tombolGenerate.addEventListener('mouseover', () => tombolGenerate.style.backgroundColor = '#0056b3');
tombolGenerate.addEventListener('mouseout', () => tombolGenerate.style.backgroundColor = '#007BFF');
tombolGenerate.addEventListener('click', () => fileInput.click());

// 3. Logika Membaca CSV, Merge Data, dan Simpan ke File
fileInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    
    reader.onload = function(e) {
        const teksCSV = e.target.result;
        const dataJSONDariCSV = parseCSVAkurat(teksCSV);
        
        // Ambil data gambar dari DOM saat tombol CSV di-upload
        const images = document.querySelectorAll('.ItemCard__image img');
        const srcList = Array.from(images).map(img => ({ Gambar: img.src }));

        // Proses Merge berdasarkan indeks
        const dataHasilMerge = dataJSONDariCSV.map((itemCSV, indeks) => {
            const dataGambar = srcList[indeks] ? srcList[indeks] : { Gambar: "" };
            return {
                ...itemCSV,
                ...dataGambar
            };
        });
        
        // --- FITUR TERAKHIR: SIMPAN DAN DOWNLOAD SEBAGAI FILE .JSON ---
        const namaFileBaru = file.name.replace('.csv', '_output.json');
        unduhFileJSON(dataHasilMerge, namaFileBaru);
        
        console.log("Hasil gabungan JSON berhasil diunduh:", dataHasilMerge);
    };

    reader.readAsText(file);
});

// 4. Fungsi Parser CSV Akurat (Mengabaikan koma di dalam tanda kutip)
function parseCSVAkurat(text) {
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l);
    if (lines.length === 0) return [];

    const regexPemisah = /(?!\s|$)\s*(?:'([^']*)'|"([^"]*)"|([^, '"\s\t]*(?:\s+[^, '"\s\t]+)*))\s*(?:,|$)/g;

    const headers = [];
    let matchHeader;
    while ((matchHeader = regexPemisah.exec(lines[0])) !== null) {
        headers.push((matchHeader[1] || matchHeader[2] || matchHeader[3] || "").trim());
    }

    regexPemisah.lastIndex = 0;

    const hasil = lines.slice(1).map(line => {
        const rowData = [];
        let matchData;
        
        while ((matchData = regexPemisah.exec(line)) !== null) {
            let value = (matchData[1] || matchData[2] || matchData[3] || "").trim();
            rowData.push(value);
        }
        
        regexPemisah.lastIndex = 0;

        const obj = {};
        headers.forEach((header, index) => {
            obj[header] = rowData[index] !== undefined ? rowData[index] : null;
        });
        return obj;
    });

    return hasil;
}

// 5. Fungsi Helper untuk Mengunduh File JSON Otomatis
function unduhFileJSON(dataObjek, namaFile) {
    // Ubah objek javascript menjadi teks string JSON rapi (indentasi 2 spasi)
    const stringJSON = JSON.stringify(dataObjek, null, 2);
    
    // Buat objek Blob berupa data JSON
    const blob = new Blob([stringJSON], { type: 'application/json' });
    
    // Buat link samaran untuk memicu download browser
    const linkDownload = document.createElement('a');
    linkDownload.href = URL.createObjectURL(blob);
    linkDownload.download = namaFile;
    
    // Picu klik pada link, lalu hapus elemen dari memori
    document.body.appendChild(linkDownload);
    linkDownload.click();
    document.body.removeChild(linkDownload);
}

// 6. Masukkan elemen ke halaman web
document.body.appendChild(fileInput);
document.body.appendChild(tombolGenerate);
