/**
 * Excel Handler Module
 * Handles Excel file upload, sheet selection, and data processing
 * Requires SheetJS library (xlsx.full.min.js)
 */
(function() {
  'use strict';

  class ExcelHandler {
    constructor() {
      this.workbook = null;
      this.selectedSheetData = null;
      this.elements = {};
      this.init();
    }

    /**
     * Initialize the handler
     */
    init() {
      this.cacheElements();
      this.setupEventListeners();
    }

    /**
     * Cache DOM elements
     */
    cacheElements() {
      this.elements = {
        dropzone: document.getElementById('dropzone'),
        fileInput: document.getElementById('fileInput'),
        sheetSelector: document.getElementById('sheetSelector'),
        sheetSelect: document.getElementById('sheetSelect'),
        processBtn: document.getElementById('processSheet'),
        excelDataDiv: document.getElementById('excelData'),
        dataPreview: document.getElementById('dataPreview')
      };

      // Validate all elements exist
      Object.entries(this.elements).forEach(([key, element]) => {
        if (!element) {
          console.warn(`[ExcelHandler] Element '${key}' not found`);
        }
      });
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
      const { dropzone, fileInput, processBtn } = this.elements;

      if (dropzone) {
        dropzone.addEventListener('click', () => fileInput?.click());
        dropzone.addEventListener('dragover', (e) => this.handleDragOver(e));
        dropzone.addEventListener('dragleave', () => this.handleDragLeave());
        dropzone.addEventListener('drop', (e) => this.handleDrop(e));
      }

      if (fileInput) {
        fileInput.addEventListener('change', (e) => this.handleFileInput(e));
      }

      if (processBtn) {
        processBtn.addEventListener('click', () => this.processSelectedSheet());
      }
    }

    /**
     * Handle drag over event
     */
    handleDragOver(e) {
      e.preventDefault();
      this.elements.dropzone?.classList.add('dragover');
    }

    /**
     * Handle drag leave event
     */
    handleDragLeave() {
      this.elements.dropzone?.classList.remove('dragover');
    }

    /**
     * Handle drop event
     */
    handleDrop(e) {
      e.preventDefault();
      this.elements.dropzone?.classList.remove('dragover');

      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        this.handleFile(files[0]);
      }
    }

    /**
     * Handle file input change
     */
    handleFileInput(e) {
      const files = e.target?.files;
      if (files && files.length > 0) {
        this.handleFile(files[0]);
      }
    }

    /**
     * Validate file type
     * @param {File} file - File to validate
     * @returns {boolean} True if valid
     */
    isValidExcelFile(file) {
      const validTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];
      
      return validTypes.includes(file.type) || /\.(xls|xlsx)$/i.test(file.name);
    }

    /**
     * Handle file upload
     * @param {File} file - Uploaded file
     */
    handleFile(file) {
      if (!this.isValidExcelFile(file)) {
        alert('Selecteer een geldig Excel bestand (.xls of .xlsx)');
        return;
      }

      this.showLoadingState();

      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          this.workbook = XLSX.read(data, { type: 'array' });
          
          this.showSuccessState(file.name);
          this.displaySheetSelector();
          
        } catch (error) {
          console.error('[ExcelHandler] Error reading Excel file:', error);
          alert('Fout bij het lezen van het Excel bestand');
          this.reset();
        }
      };

      reader.onerror = () => {
        alert('Fout bij het lezen van het bestand');
        this.reset();
      };

      reader.readAsArrayBuffer(file);
    }

    /**
     * Show loading state
     */
    showLoadingState() {
      if (this.elements.dropzone) {
        this.elements.dropzone.innerHTML = '<p>Bestand wordt geladen...</p>';
      }
    }

    /**
     * Show success state
     * @param {string} fileName - Name of uploaded file
     */
    showSuccessState(fileName) {
      if (this.elements.dropzone) {
        this.elements.dropzone.innerHTML = `
          <i class="fas fa-check-circle" style="color: green;"></i>
          <p><strong>${fileName}</strong> succesvol geladen</p>
        `;
      }
    }

    /**
     * Display sheet selector dropdown
     */
    displaySheetSelector() {
      if (!this.workbook || !this.elements.sheetSelect) return;

      this.elements.sheetSelect.innerHTML = '';
      
      this.workbook.SheetNames.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        this.elements.sheetSelect.appendChild(option);
      });

      if (this.elements.sheetSelector) {
        this.elements.sheetSelector.style.display = 'block';
      }
    }

    /**
     * Process the selected sheet
     */
    processSelectedSheet() {
      if (!this.workbook || !this.elements.sheetSelect) return;

      const sheetName = this.elements.sheetSelect.value;
      const worksheet = this.workbook.Sheets[sheetName];
      
      if (!worksheet) {
        console.error('[ExcelHandler] Sheet not found:', sheetName);
        return;
      }

      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      this.selectedSheetData = jsonData;
      
      this.displayData(jsonData, sheetName);
    }

    /**
     * Display data preview
     * @param {Array} data - 2D array of sheet data
     * @param {string} sheetName - Name of the sheet
     */
    displayData(data, sheetName) {
      if (!this.elements.dataPreview) return;

      if (!data || data.length === 0) {
        this.elements.dataPreview.innerHTML = '<p>Geen data gevonden in dit tabblad</p>';
        return;
      }

      const maxPreviewRows = 10;
      let html = `<h5>Tabblad: ${sheetName}</h5><table>`;

      // Header row
      if (data[0]) {
        html += '<tr>';
        data[0].forEach(cell => {
          html += `<th>${this.escapeHtml(cell || '')}</th>`;
        });
        html += '</tr>';
      }

      // Data rows
      const rowsToShow = Math.min(data.length, maxPreviewRows + 1);
      for (let i = 1; i < rowsToShow; i++) {
        html += '<tr>';
        data[i].forEach(cell => {
          html += `<td>${this.escapeHtml(cell || '')}</td>`;
        });
        html += '</tr>';
      }

      // Show remaining rows count
      if (data.length > maxPreviewRows + 1) {
        const remaining = data.length - maxPreviewRows - 1;
        html += `<tr><td colspan="${data[0].length}"><em>... en ${remaining} meer rijen</em></td></tr>`;
      }

      html += '</table>';
      this.elements.dataPreview.innerHTML = html;

      if (this.elements.excelDataDiv) {
        this.elements.excelDataDiv.style.display = 'block';
      }

      console.log('[ExcelHandler] Excel data loaded:', this.selectedSheetData.length, 'rows');
    }

    /**
     * Escape HTML to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
      const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      };
      return String(text).replace(/[&<>"']/g, m => map[m]);
    }

    /**
     * Reset the handler to initial state
     */
    reset() {
      if (this.elements.dropzone) {
        this.elements.dropzone.innerHTML = `
          <i class="fas fa-file-excel"></i>
          <p>Sleep een Excel bestand hierheen</p>
          <p class="dropzone-hint">of klik om te selecteren</p>
        `;
      }

      if (this.elements.sheetSelector) {
        this.elements.sheetSelector.style.display = 'none';
      }

      if (this.elements.excelDataDiv) {
        this.elements.excelDataDiv.style.display = 'none';
      }

      if (this.elements.fileInput) {
        this.elements.fileInput.value = '';
      }

      this.workbook = null;
      this.selectedSheetData = null;
    }

    /**
     * Get the current sheet data
     * @returns {Array|null} Current sheet data or null
     */
    getData() {
      return this.selectedSheetData;
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.excelHandler = new ExcelHandler();
    });
  } else {
    window.excelHandler = new ExcelHandler();
  }
})();