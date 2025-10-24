// Excel Handler - Requires SheetJS library
let excelData = null;
let selectedSheet = null;

document.addEventListener('DOMContentLoaded', () => {
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('fileInput');
    const sheetSelector = document.getElementById('sheetSelector');
    const sheetSelect = document.getElementById('sheetSelect');
    const processBtn = document.getElementById('processSheet');
    const excelDataDiv = document.getElementById('excelData');
    const dataPreview = document.getElementById('dataPreview');

    // Click to select file
    dropzone.addEventListener('click', () => {
        fileInput.click();
    });

    // Drag and drop events
    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
    });

    dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('dragover');
    });

    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    });

    // File input change
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    // Process selected sheet
    processBtn.addEventListener('click', () => {
        const selectedSheetName = sheetSelect.value;
        processExcelSheet(selectedSheetName);
    });

    function handleFile(file) {
        const validTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];

        if (!validTypes.includes(file.type) && !file.name.match(/\.(xls|xlsx)$/)) {
            alert('Selecteer een geldig Excel bestand (.xls of .xlsx)');
            return;
        }

        dropzone.innerHTML = '<p>Bestand wordt geladen...</p>';

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });

                excelData = workbook;
                displaySheetSelector(workbook.SheetNames);

                dropzone.innerHTML = `
                    <i class="fas fa-check-circle" style="color: green;"></i>
                    <p><strong>${file.name}</strong> succesvol geladen</p>
                `;
            } catch (error) {
                console.error('Error reading Excel file:', error);
                alert('Fout bij het lezen van het Excel bestand');
                resetDropzone();
            }
        };

        reader.onerror = () => {
            alert('Fout bij het lezen van het bestand');
            resetDropzone();
        };

        reader.readAsArrayBuffer(file);
    }

    function displaySheetSelector(sheetNames) {
        sheetSelect.innerHTML = '';
        sheetNames.forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            sheetSelect.appendChild(option);
        });

        sheetSelector.style.display = 'block';
    }

    function processExcelSheet(sheetName) {
        if (!excelData) return;

        const worksheet = excelData.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        displayData(jsonData, sheetName);
    }

    function displayData(data, sheetName) {
        if (data.length === 0) {
            dataPreview.innerHTML = '<p>Geen data gevonden in dit tabblad</p>';
            return;
        }

        let html = `<h5>Tabblad: ${sheetName}</h5>`;
        html += '<table>';

        // Header row
        if (data.length > 0) {
            html += '<tr>';
            data[0].forEach(cell => {
                html += `<th>${cell || ''}</th>`;
            });
            html += '</tr>';
        }

        // Data rows (show max 10 rows as preview)
        const maxRows = Math.min(data.length, 11);
        for (let i = 1; i < maxRows; i++) {
            html += '<tr>';
            data[i].forEach(cell => {
                html += `<td>${cell || ''}</td>`;
            });
            html += '</tr>';
        }

        if (data.length > 11) {
            html += `<tr><td colspan="${data[0].length}"><em>... en ${data.length - 11} meer rijen</em></td></tr>`;
        }

        html += '</table>';
        dataPreview.innerHTML = html;
        excelDataDiv.style.display = 'block';

        // Store the data for further processing
        selectedSheet = data;
        console.log('Excel data:', selectedSheet);
    }

    function resetDropzone() {
        dropzone.innerHTML = `
            <i class="fas fa-file-excel"></i>
            <p>Sleep een Excel bestand hierheen</p>
            <p class="dropzone-hint">of klik om te selecteren</p>
        `;
        sheetSelector.style.display = 'none';
        excelDataDiv.style.display = 'none';
        excelData = null;
        selectedSheet = null;
    }
});