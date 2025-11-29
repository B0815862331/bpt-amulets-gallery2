// Main Application
const app = {
    // ตัวแปร global
    data: {
        categories: {},
        albums: {},
        history: [],
        metadata: {}
    },
    
    currentTab: 'gallery',
    currentImages: [],
    currentImageIndex: 0,
    currentZoom: 1,
    currentAlbumName: '',
    selectedFiles: [],
    selectedGalleryPhoto: null,
    isMuted: false,
    speechSynthesis: window.speechSynthesis,

    // DOM Elements
    elements: {},

    // เริ่มต้นแอปพลิเคชัน
    async initialize() {
        try {
            // เริ่มต้นระบบความปลอดภัย
            await securitySystem.initialize();
            
            // โหลด DOM elements
            this.initializeElements();
            
            // โหลดข้อมูล
            await this.loadData();
            
            // เรนเดอร์ UI
            this.render();
            
            // ตั้งค่า event listeners
            this.setupEventListeners();
            
            // เล่นเสียงต้อนรับ
            setTimeout(() => {
                this.playWelcomeMessage();
            }, 1000);
            
            securitySystem.logSecurityEvent('LOW', 'Application initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize app:', error);
            securitySystem.logSecurityEvent('HIGH', 'Application initialization failed', { error: error.message });
        }
    },

    // โหลด DOM elements
    initializeElements() {
        this.elements = {
            gallery: document.getElementById('gallery'),
            searchBox: document.getElementById('searchBox'),
            categorySelect: document.getElementById('categorySelect'),
            modalsContainer: document.getElementById('modals-container'),
            volumeBtn: document.getElementById('volumeBtn')
        };
    },

    // โหลดข้อมูล
    async loadData() {
        try {
            // พยายามโหลดจาก JSON ไฟล์ก่อน
            await this.loadFromJSON();
            
            // ถ้าไม่มีข้อมูล ให้ใช้ข้อมูลจาก localStorage
            if (Object.keys(this.data.categories).length === 0) {
                this.loadFromLocalStorage();
            }
            
            // ถ้ายังไม่มีข้อมูล ให้ใช้ข้อมูลเริ่มต้น
            if (Object.keys(this.data.categories).length === 0) {
                this.loadDefaultData();
            }
            
        } catch (error) {
            console.error('Failed to load data:', error);
            this.loadFromLocalStorage();
        }
    },

    // โหลดจาก JSON ไฟล์
    async loadFromJSON() {
        try {
            const response = await fetch('data/amulets.json');
            if (response.ok) {
                const jsonData = await response.json();
                this.data = { ...this.data, ...jsonData };
                securitySystem.logSecurityEvent('LOW', 'Data loaded from JSON file');
            }
        } catch (error) {
            console.warn('Cannot load from JSON file, using localStorage instead');
            throw error;
        }
    },

    // โหลดจาก localStorage
    loadFromLocalStorage() {
        try {
            const savedData = localStorage.getItem('bptAmuletsData');
            if (savedData) {
                this.data = JSON.parse(savedData);
                securitySystem.logSecurityEvent('LOW', 'Data loaded from localStorage');
            }
        } catch (error) {
            securitySystem.logSecurityEvent('HIGH', 'Failed to parse stored data', { error: error.message });
        }
    },

    // ข้อมูลเริ่มต้น
    loadDefaultData() {
        this.data = {
            categories: {},
            albums: {},
            history: [],
            metadata: {
                lastUpdated: new Date().toISOString(),
                totalPhotos: 0,
                totalAlbums: 0,
                version: '1.0.0'
            }
        };
    },

    // บันทึกข้อมูล
    saveData() {
        try {
            // อัปเดต metadata
            this.data.metadata.lastUpdated = new Date().toISOString();
            this.data.metadata.totalPhotos = this.getTotalPhotos();
            this.data.metadata.totalAlbums = Object.keys(this.data.albums).length;
            
            // บันทึกลง localStorage
            localStorage.setItem('bptAmuletsData', JSON.stringify(this.data));
            
            // Export to JSON file (สำหรับดาวน์โหลด)
            this.exportDataToJSON();
            
        } catch (error) {
            securitySystem.logSecurityEvent('HIGH', 'Failed to save data', { error: error.message });
        }
    },

    // ส่งออกข้อมูลเป็น JSON
    exportDataToJSON() {
        try {
            utils.exportToJSON(this.data, `amulets-backup-${new Date().toISOString().split('T')[0]}.json`);
            securitySystem.logSecurityEvent('LOW', 'Data exported to JSON');
        } catch (error) {
            console.error('Export failed:', error);
        }
    },

    // นับจำนวนรูปภาพทั้งหมด
    getTotalPhotos() {
        let total = 0;
        Object.values(this.data.categories).forEach(photos => {
            total += photos.length;
        });
        return total;
    },

    // เรนเดอร์ UI หลัก
    render() {
        this.loadCategories();
        
        switch (this.currentTab) {
            case 'gallery':
                this.renderGallery();
                break;
            case 'albums':
                this.renderAlbums();
                break;
            case 'history':
                this.renderHistory();
                break;
        }
    },

    // เรนเดอร์แกลเลอรี
    renderGallery() {
        if (!this.elements.gallery) return;
        
        this.elements.gallery.innerHTML = '';
        const search = this.elements.searchBox.value.toLowerCase();
        const selectedCategory = this.elements.categorySelect.value;
        const categories = selectedCategory ? [selectedCategory] : Object.keys(this.data.categories || {});
        
        let hasResults = false;
        
        categories.forEach(category => {
            (this.data.categories[category] || []).forEach((photo, index) => {
                if (search && !photo.name.toLowerCase().includes(search) && !category.toLowerCase().includes(search)) return;
                hasResults = true;
                
                const photoElement = this.createPhotoElement(photo, category, index);
                this.elements.gallery.appendChild(photoElement);
            });
        });
        
        if (!hasResults) {
            this.elements.gallery.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-image"></i>
                    <p>ไม่พบรูปภาพที่ตรงกับการค้นหา</p>
                </div>
            `;
        }
    },

    // สร้าง element รูปภาพ
    createPhotoElement(photo, category, index) {
        const div = utils.createElement('div', 'photo');
        div.innerHTML = `
            <div class="photo-actions">
                <button class="photo-action-btn" onclick="event.stopPropagation(); app.speakText('${photo.name}')" title="อ่านชื่อรูปภาพ">
                    <i class="fas fa-volume-up"></i>
                </button>
                <button class="photo-action-btn delete" onclick="event.stopPropagation(); app.deleteGalleryPhoto('${category}', ${index})" title="ลบรูปภาพ">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <img src="${photo.imageUrl || photo.data}" alt="${photo.name}" loading="lazy">
            <div class="photo-name">${securitySystem.sanitizeHTML(photo.name)}</div>
        `;
        
        div.addEventListener('click', () => {
            const allPhotos = this.getAllPhotosForView(category, search);
            this.viewImage(photo.imageUrl || photo.data, photo.name, allPhotos);
        });
        
        return div;
    },

    // โหลดหมวดหมู่
    loadCategories() {
        if (!this.elements.categorySelect) return;
        
        this.elements.categorySelect.innerHTML = '';
        const galleryCategorySelect = document.getElementById('galleryPhotoCategory');
        if (galleryCategorySelect) {
            galleryCategorySelect.innerHTML = '<option value="">เลือกหมวดหมู่</option>';
        }
        
        const categories = Object.keys(this.data.categories || {});
        
        if (categories.length === 0) {
            const opt = utils.createElement('option');
            opt.textContent = '-- ยังไม่มีหมวดหมู่ --';
            opt.disabled = true;
            opt.selected = true;
            this.elements.categorySelect.appendChild(opt);
        } else {
            const allOpt = utils.createElement('option');
            allOpt.value = '';
            allOpt.textContent = 'ทั้งหมด';
            allOpt.selected = true;
            this.elements.categorySelect.appendChild(allOpt);
            
            categories.forEach(category => {
                const opt = utils.createElement('option');
                opt.value = category;
                opt.textContent = category;
                this.elements.categorySelect.appendChild(opt);
                
                if (galleryCategorySelect) {
                    const galleryOpt = utils.createElement('option');
                    galleryOpt.value = category;
                    galleryOpt.textContent = category;
                    galleryCategorySelect.appendChild(galleryOpt);
                }
            });
        }
    },

    // เพิ่มฟังก์ชันการทำงานต่างๆ ต่อไปนี้...
    // [เหลืออีกประมาณ 200 บรรทัดของฟังก์ชันต่างๆ]
    
    // ตัวอย่างฟังก์ชันเพิ่มรูปภาพ
    async addGalleryPhoto(photoData) {
        if (!securitySystem.checkRateLimit('add_photo')) {
            throw new Error('การดำเนินการนี้ถูกจำกัดจำนวนครั้ง กรุณารอสักครู่');
        }

        const { name, category, imageUrl, description } = photoData;
        
        // สร้างหมวดหมู่ใหม่ถ้ายังไม่มี
        if (!this.data.categories[category]) {
            this.data.categories[category] = [];
            this.addHistory('สร้างหมวดหมู่', `สร้างหมวดหมู่ '${category}'`);
        }

        // สร้างรูปภาพใหม่
        const newPhoto = {
            id: utils.generateId(),
            name: securitySystem.sanitizeHTML(name),
            imageUrl: imageUrl,
            description: securitySystem.sanitizeHTML(description || ''),
            createdAt: new Date().toISOString(),
            createdBy: 'ผู้ใช้'
        };
        
        this.data.categories[category].push(newPhoto);
        this.saveData();
        
        this.addHistory('เพิ่มรูปภาพ', `เพิ่มรูปภาพ '${name}' ในหมวดหมู่ '${category}'`);
        
        // อ่านชื่อรูปภาพออกเสียง
        if (!this.isMuted) {
            setTimeout(() => {
                this.speakText(`เพิ่มรูปภาพ ${name} ในหมวดหมู่ ${category} เรียบร้อยแล้ว`);
            }, 500);
        }
        
        securitySystem.logSecurityEvent('LOW', 'Gallery photo added', { 
            name: name, 
            category: category 
        });

        return newPhoto;
    },

    // เพิ่มประวัติ
    addHistory(type, details) {
        const historyItem = {
            id: utils.generateId(),
            type: type,
            details: details,
            timestamp: new Date().toISOString()
        };
        
        this.data.history.unshift(historyItem);
        
        // จำกัดจำนวนประวัติ
        if (this.data.history.length > 50) {
            this.data.history = this.data.history.slice(0, 50);
        }
        
        this.saveData();
        securitySystem.logSecurityEvent('LOW', `User action: ${type}`, { details });
    },

    // ระบบเสียง
    playWelcomeMessage() {
        if (this.isMuted) return;
        this.speakText("ยินดีต้อนรับสู่แหล่งแหล่งการเรียนรู้พระเครื่องแดนสยาม");
    },

    speakText(text) {
        if (this.isMuted || !this.speechSynthesis) return;
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'th-TH';
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;
        
        const voices = this.speechSynthesis.getVoices();
        const thaiVoice = voices.find(voice => voice.lang === 'th-TH' || voice.lang.startsWith('th-'));
        if (thaiVoice) {
            utterance.voice = thaiVoice;
        }
        
        this.speechSynthesis.speak(utterance);
    },

    toggleVolume() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            this.elements.volumeBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
            this.elements.volumeBtn.classList.add('muted');
            this.speechSynthesis.cancel();
        } else {
            this.elements.volumeBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
            this.elements.volumeBtn.classList.remove('muted');
        }
        securitySystem.logSecurityEvent('LOW', `Audio ${this.isMuted ? 'muted' : 'unmuted'}`);
    }
};

// ทำให้ฟังก์ชันสามารถเรียกใช้จาก HTML ได้
window.app = app;
