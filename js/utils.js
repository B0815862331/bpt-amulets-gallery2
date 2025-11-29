// Utility Functions
const utils = {
    // สร้าง ID แบบสุ่ม
    generateId: function() {
        return 'id_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
    },

    // ฟอร์แมตวันที่
    formatDate: function(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    // ดึงชื่อไฟล์จาก URL
    getFilenameFromURL: function(url) {
        try {
            const urlObj = new URL(url);
            const pathname = urlObj.pathname;
            return pathname.substring(pathname.lastIndexOf('/') + 1) || 'รูปภาพจาก URL';
        } catch (_) {
            return 'รูปภาพจาก URL';
        }
    },

    // ตรวจสอบว่าเป็น URL ที่ถูกต้อง
    isValidURL: function(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    },

    // Download JSON data
    exportToJSON: function(data, filename = 'amulets-data.json') {
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    },

    // อ่านไฟล์ JSON
    readJSONFile: function(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const data = JSON.parse(e.target.result);
                    resolve(data);
                } catch (error) {
                    reject(new Error('ไฟล์ JSON ไม่ถูกต้อง'));
                }
            };
            reader.onerror = function() {
                reject(new Error('ไม่สามารถอ่านไฟล์ได้'));
            };
            reader.readAsText(file);
        });
    },

    // จำกัดข้อความ
    truncateText: function(text, maxLength = 50) {
        if (text.length <= maxLength) return text;
        return text.substr(0, maxLength) + '...';
    },

    // สร้าง element HTML
    createElement: function(tag, className, innerHTML = '') {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (innerHTML) element.innerHTML = innerHTML;
        return element;
    },

    // แสดง loading
    showLoading: function(message = 'กำลังโหลด...') {
        const loading = this.createElement('div', 'loading-overlay');
        loading.innerHTML = `
            <div class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i>
                <p>${message}</p>
            </div>
        `;
        document.body.appendChild(loading);
        return loading;
    },

    // ซ่อน loading
    hideLoading: function(loadingElement) {
        if (loadingElement && loadingElement.parentNode) {
            loadingElement.parentNode.removeChild(loadingElement);
        }
    }
};
