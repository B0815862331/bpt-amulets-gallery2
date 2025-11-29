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
    }
};
