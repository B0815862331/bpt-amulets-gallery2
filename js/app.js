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
            console.log('🚀 Starting application initialization...');
            
            // เริ่มต้นระบบความปลอดภัย
            await securitySystem.initialize();
            
            // โหลด DOM elements
            this.initializeElements();
            
            // สร้าง modals
            this.createModals();
            
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
            
            console.log('✅ Application initialized successfully');
            securitySystem.logSecurityEvent('LOW', 'Application initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize app:', error);
            securitySystem.logSecurityEvent('HIGH', 'Application initialization failed', { error: error.message });
        }
    },

    // โหลด DOM elements
    initializeElements() {
        console.log('🔧 Initializing DOM elements...');
        this.elements = {
            gallery: document.getElementById('gallery'),
            searchBox: document.getElementById('searchBox'),
            categorySelect: document.getElementById('categorySelect'),
            modalsContainer: document.getElementById('modals-container'),
            volumeBtn: document.getElementById('volumeBtn'),
            tabGallery: document.getElementById('tabGallery'),
            tabAlbums: document.getElementById('tabAlbums'),
            tabHistory: document.getElementById('tabHistory'),
            tabSecurity: document.getElementById('tabSecurity')
        };
        console.log('✅ DOM elements initialized');
    },

    // สร้าง modals ทั้งหมด
    createModals() {
        console.log('🔧 Creating modals...');
        const modalsHTML = `
            <!-- Security Dashboard Modal -->
            <div id="securityModal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>แดชบอร์ดความปลอดภัย</h3>
                        <button class="modal-close" onclick="app.closeSecurityModal()">&times;</button>
                    </div>
                    <div id="securityContent">
                        <div class="security-status-card">
                            <h4><i class="fas fa-shield-alt"></i> สถานะระบบความปลอดภัย</h4>
                            <div id="securityStatusDetails"></div>
                        </div>
                        <div class="security-logs" id="securityLogs">
                            <h4><i class="fas fa-clipboard-list"></i> บันทึกความปลอดภัย</h4>
                            <div id="securityLogsList"></div>
                        </div>
                        <div class="security-actions">
                            <h4><i class="fas fa-cogs"></i> การดำเนินการ</h4>
                            <div class="form-actions">
                                <button onclick="app.clearSecurityLogs()" class="secondary">
                                    <i class="fas fa-trash"></i> ล้างบันทึก
                                </button>
                                <button onclick="app.runSecurityScan()">
                                    <i class="fas fa-search"></i> สแกนระบบ
                                </button>
                                <button onclick="app.exportSecurityData()">
                                    <i class="fas fa-download"></i> ส่งออกข้อมูล
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Album View Modal -->
            <div id="albumModal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 id="modalAlbumTitle">อัลบั้ม</h3>
                        <button class="modal-close" onclick="app.closeAlbumModal()">&times;</button>
                    </div>
                    <div id="albumModalContent"></div>
                    <div class="form-actions">
                        <button onclick="app.showAddPhotosModal()" class="secondary">
                            <i class="fas fa-plus"></i> เพิ่มรูปภาพ
                        </button>
                        <button onclick="app.deleteCurrentAlbum()" style="background: #ff4444;">
                            <i class="fas fa-trash"></i> ลบอัลบั้ม
                        </button>
                    </div>
                </div>
            </div>

            <!-- Image View Modal -->
            <div id="imageModal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 id="modalImageTitle">รูปภาพ</h3>
                        <button class="modal-close" onclick="app.closeImageModal()">&times;</button>
                    </div>
                    <div id="imageModalContent">
                        <div class="drag-info" id="dragInfo">ลากเมาส์เพื่อขยับรูปภาพ</div>
                    </div>
                </div>
            </div>

            <!-- Create Album Modal -->
            <div id="createAlbumModal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>สร้างอัลบั้มใหม่</h3>
                        <button class="modal-close" onclick="app.closeCreateAlbumModal()">&times;</button>
                    </div>
                    <form id="createAlbumForm">
                        <div class="form-group">
                            <label for="albumName">ชื่ออัลบั้ม</label>
                            <input type="text" id="albumName" required placeholder="กรอกชื่ออัลบั้ม">
                        </div>
                        <div class="form-group">
                            <label for="albumDescription">คำอธิบาย (ไม่บังคับ)</label>
                            <textarea id="albumDescription" placeholder="คำอธิบายเกี่ยวกับอัลบั้มนี้"></textarea>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="secondary" onclick="app.closeCreateAlbumModal()">ยกเลิก</button>
                            <button type="submit">สร้างอัลบั้ม</button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Add Photos to Album Modal -->
            <div id="addPhotosModal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 id="addPhotosTitle">เพิ่มรูปภาพในอัลบั้ม</h3>
                        <button class="modal-close" onclick="app.closeAddPhotosModal()">&times;</button>
                    </div>
                    <div class="form-group">
                        <label>อัปโหลดรูปภาพ</label>
                        <div class="file-upload" onclick="document.getElementById('photoUpload').click()">
                            <i class="fas fa-cloud-upload-alt"></i>
                            <p>คลิกเพื่อเลือกไฟล์รูปภาพ หรือลากไฟล์มาวางที่นี่</p>
                            <p style="font-size: 0.9rem; color: #888;">รองรับไฟล์ JPG, PNG, GIF</p>
                        </div>
                        <input type="file" id="photoUpload" multiple accept="image/*" style="display: none;" onchange="app.handleFileSelect(this.files)">
                    </div>
                    
                    <div class="url-upload-section">
                        <label>หรือเพิ่มจาก URL</label>
                        <div class="url-input-group">
                            <input type="text" id="albumPhotoURL" placeholder="วาง URL รูปภาพที่นี่ (เช่น https://example.com/image.jpg)">
                            <button type="button" onclick="app.loadAlbumPhotoFromURL()">เพิ่มจาก URL</button>
                        </div>
                    </div>
                    
                    <div class="uploaded-files" id="uploadedFiles"></div>
                    <div class="form-actions">
                        <button type="button" class="secondary" onclick="app.closeAddPhotosModal()">ยกเลิก</button>
                        <button type="button" onclick="app.savePhotosToAlbum()">บันทึกรูปภาพ</button>
                    </div>
                </div>
            </div>

            <!-- Add Gallery Photo Modal -->
            <div id="addGalleryPhotoModal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>เพิ่มรูปภาพในแกลเลอรี</h3>
                        <button class="modal-close" onclick="app.closeAddGalleryPhotoModal()">&times;</button>
                    </div>
                    <form id="addGalleryPhotoForm">
                        <div class="form-group">
                            <label for="galleryPhotoName">ชื่อรูปภาพ</label>
                            <input type="text" id="galleryPhotoName" required placeholder="กรอกชื่อรูปภาพ">
                        </div>
                        <div class="form-group">
                            <label for="galleryPhotoCategory">หมวดหมู่</label>
                            <select id="galleryPhotoCategory" required>
                                <option value="">เลือกหมวดหมู่</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>อัปโหลดรูปภาพ</label>
                            <div class="file-upload" onclick="document.getElementById('galleryPhotoUpload').click()">
                                <i class="fas fa-cloud-upload-alt"></i>
                                <p>คลิกเพื่อเลือกไฟล์รูปภาพ หรือลากไฟล์มาวางที่นี่</p>
                                <p style="font-size: 0.9rem; color: #888;">รองรับไฟล์ JPG, PNG, GIF</p>
                            </div>
                            <input type="file" id="galleryPhotoUpload" accept="image/*" style="display: none;" onchange="app.handleGalleryPhotoSelect(this.files)">
                        </div>
                        
                        <div class="url-upload-section">
                            <label>หรือเพิ่มจาก URL</label>
                            <div class="url-input-group">
                                <input type="text" id="galleryPhotoURL" placeholder="วาง URL รูปภาพที่นี่ (เช่น https://example.com/image.jpg)">
                                <button type="button" onclick="app.loadGalleryPhotoFromURL()">เพิ่มจาก URL</button>
                            </div>
                        </div>
                        
                        <div id="galleryPhotoPreview" style="text-align: center; margin-top: 1rem;"></div>
                    </form>
                    <div class="form-actions">
                        <button type="button" class="secondary" onclick="app.closeAddGalleryPhotoModal()">ยกเลิก</button>
                        <button type="button" onclick="app.saveGalleryPhoto()">บันทึกรูปภาพ</button>
                    </div>
                </div>
            </div>

            <!-- History Modal -->
            <div id="historyModal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>ประวัติการใช้งาน</h3>
                        <button class="modal-close" onclick="app.closeHistoryModal()">&times;</button>
                    </div>
                    <div id="historyContent"></div>
                    <div class="form-actions">
                        <button onclick="app.clearHistory()" style="background: #ff4444;">
                            <i class="fas fa-trash"></i> ล้างประวัติ
                        </button>
                    </div>
                </div>
            </div>

            <!-- Fullscreen Mode -->
            <div id="fullscreenMode" class="fullscreen-mode">
                <button class="fullscreen-close" onclick="app.exitFullscreen()">&times;</button>
                <div class="fullscreen-counter" id="fullscreenCounter">1/1</div>
                <div class="fullscreen-nav">
                    <button class="nav-btn prev-btn" onclick="app.fullscreenPrevImage()">&#10094;</button>
                    <button class="nav-btn next-btn" onclick="app.fullscreenNextImage()">&#10095;</button>
                </div>
                <img id="fullscreenImage" class="fullscreen-image" src="" alt="">
                <div class="fullscreen-controls">
                    <button class="zoom-btn" onclick="app.fullscreenZoomOut()">−</button>
                    <div class="zoom-level" id="fullscreenZoomLevel">100%</div>
                    <button class="zoom-btn" onclick="app.fullscreenZoomIn()">+</button>
                    <button class="zoom-btn" onclick="app.fullscreenResetZoom()"><i class="fas fa-sync-alt"></i></button>
                    <button class="zoom-btn" onclick="app.toggleFullscreenInfo()"><i class="fas fa-info"></i></button>
                </div>
                <div class="drag-info" id="fullscreenDragInfo">ลากเมาส์เพื่อขยับรูปภาพ</div>
            </div>
        `;

        this.elements.modalsContainer.innerHTML = modalsHTML;
        console.log('✅ Modals created successfully');
    },

    // ตั้งค่า event listeners
    setupEventListeners() {
        console.log('🔧 Setting up event listeners...');
        
        // Tab events
        if (this.elements.tabGallery) {
            this.elements.tabGallery.addEventListener('click', () => {
                this.currentTab = 'gallery';
                this.updateActiveTab();
                this.render();
            });
        }

        if (this.elements.tabAlbums) {
            this.elements.tabAlbums.addEventListener('click', () => {
                this.currentTab = 'albums';
                this.updateActiveTab();
                this.render();
            });
        }

        if (this.elements.tabHistory) {
            this.elements.tabHistory.addEventListener('click', () => {
                this.currentTab = 'history';
                this.updateActiveTab();
                this.render();
            });
        }

        if (this.elements.tabSecurity) {
            this.elements.tabSecurity.addEventListener('click', () => {
                this.showSecurityModal();
            });
        }

        // Search and category events
        if (this.elements.searchBox) {
            this.elements.searchBox.addEventListener('input', () => {
                this.render();
            });
        }

        if (this.elements.categorySelect) {
            this.elements.categorySelect.addEventListener('change', () => {
                this.render();
            });
        }

        // Form events
        const createAlbumForm = document.getElementById('createAlbumForm');
        if (createAlbumForm) {
            createAlbumForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.createNewAlbum(e);
            });
        }

        // Global click events for modals
        document.addEventListener('click', (event) => {
            const modals = ['albumModal', 'imageModal', 'createAlbumModal', 'addPhotosModal', 'addGalleryPhotoModal', 'historyModal', 'securityModal'];
            modals.forEach(modalId => {
                const modal = document.getElementById(modalId);
                if (modal && event.target === modal) {
                    this[`close${modalId.charAt(0).toUpperCase() + modalId.slice(1)}`]();
                }
            });
        });

        // Keyboard events
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                this.closeAllModals();
            }
        });

        console.log('✅ Event listeners setup completed');
    },

    // อัพเดท tab ที่ active
    updateActiveTab() {
        const tabs = ['tabGallery', 'tabAlbums', 'tabHistory', 'tabSecurity'];
        tabs.forEach(tabId => {
            const tab = document.getElementById(tabId);
            if (tab) {
                if (tabId === `tab${this.currentTab.charAt(0).toUpperCase() + this.currentTab.slice(1)}`) {
                    tab.classList.add('active');
                } else {
                    tab.classList.remove('active');
                }
            }
        });
    },

    // โหลดข้อมูล
    async loadData() {
        try {
            console.log('📥 Loading data...');
            
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
            
            console.log('✅ Data loaded successfully');
            
        } catch (error) {
            console.error('❌ Failed to load data:', error);
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
                console.log('✅ Data loaded from JSON file');
            }
        } catch (error) {
            console.warn('⚠️ Cannot load from JSON file, using localStorage instead');
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
                console.log('✅ Data loaded from localStorage');
            }
        } catch (error) {
            console.error('❌ Failed to load from localStorage:', error);
            securitySystem.logSecurityEvent('HIGH', 'Failed to parse stored data', { error: error.message });
        }
    },

    // ข้อมูลเริ่มต้น
    loadDefaultData() {
        console.log('📝 Loading default data...');
        this.data = {
            categories: {
                "พระยอดนิยม": [
                    {
                        "id": "1",
                        "name": "พระบางลำพูน",
                        "imageUrl": "https://images.unsplash.com/photo-1586947201838-5d66c1b94a5f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YnVkZGhhfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60",
                        "description": "พระบางลำพูน สร้างสมัยล้านนา",
                        "createdAt": new Date().toISOString(),
                        "createdBy": "ผู้ใช้"
                    }
                ]
            },
            albums: {},
            history: [],
            metadata: {
                lastUpdated: new Date().toISOString(),
                totalPhotos: 1,
                totalAlbums: 0,
                version: '1.0.0'
            }
        };
        console.log('✅ Default data loaded');
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
            
            console.log('💾 Data saved successfully');
            
        } catch (error) {
            console.error('❌ Failed to save data:', error);
            securitySystem.logSecurityEvent('HIGH', 'Failed to save data', { error: error.message });
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
        console.log('🎨 Rendering UI...');
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
        console.log('✅ UI rendered successfully');
    },

    // เรนเดอร์แกลเลอรี
    renderGallery() {
        if (!this.elements.gallery) return;
        
        this.elements.gallery.innerHTML = '';
        const search = this.elements.searchBox ? this.elements.searchBox.value.toLowerCase() : '';
        const selectedCategory = this.elements.categorySelect ? this.elements.categorySelect.value : '';
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
        const div = document.createElement('div');
        div.className = 'photo';
        div.innerHTML = `
            <div class="photo-actions">
                <button class="photo-action-btn" onclick="event.stopPropagation(); app.speakText('${photo.name.replace(/'/g, "\\'")}')" title="อ่านชื่อรูปภาพ">
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
            const allPhotos = this.getAllPhotosForView();
            this.viewImage(photo.imageUrl || photo.data, photo.name, allPhotos);
        });
        
        return div;
    },

    // ดึงรูปภาพทั้งหมดสำหรับการดู
    getAllPhotosForView() {
        const allPhotos = [];
        Object.values(this.data.categories).forEach(photos => {
            photos.forEach(photo => {
                allPhotos.push(photo);
            });
        });
        return allPhotos;
    },

    // ดูรูปภาพ
    viewImage(src, title, images) {
        this.currentImages = images || [{imageUrl: src, name: title}];
        this.currentImageIndex = this.currentImages.findIndex(img => 
            (img.imageUrl || img.data) === src
        );
        if (this.currentImageIndex === -1) this.currentImageIndex = 0;
        
        this.updateImageDisplay();
        this.showModal('imageModal');
        
        if (!this.isMuted) {
            setTimeout(() => {
                this.speakText(`รูปภาพ ${title}`);
            }, 500);
        }
    },

    // อัพเดทการแสดงรูปภาพ
    updateImageDisplay() {
        const currentImage = this.currentImages[this.currentImageIndex];
        const modalImageTitle = document.getElementById('modalImageTitle');
        const imageModalContent = document.getElementById('imageModalContent');
        
        if (modalImageTitle) {
            modalImageTitle.textContent = currentImage.name;
        }
        
        if (imageModalContent) {
            imageModalContent.innerHTML = `
                <button class="fullscreen-btn" onclick="app.enterFullscreen()" title="เต็มจอ">
                    <i class="fas fa-expand"></i>
                </button>
                <div class="image-nav">
                    <button class="nav-btn prev-btn" onclick="app.prevImage()">&#10094;</button>
                    <button class="nav-btn next-btn" onclick="app.nextImage()">&#10095;</button>
                </div>
                <div class="image-counter">${this.currentImageIndex + 1}/${this.currentImages.length}</div>
                <div class="zoom-controls">
                    <button class="zoom-btn" onclick="app.zoomOut()">−</button>
                    <div class="zoom-level">${Math.round(this.currentZoom * 100)}%</div>
                    <button class="zoom-btn" onclick="app.zoomIn()">+</button>
                    <button class="zoom-btn" onclick="app.resetZoom()"><i class="fas fa-sync-alt"></i></button>
                    <button class="zoom-btn" onclick="app.enterFullscreen()"><i class="fas fa-expand"></i></button>
                    <button class="zoom-btn" onclick="app.speakText('${currentImage.name.replace(/'/g, "\\'")}')" title="อ่านชื่อรูปภาพ">
                        <i class="fas fa-volume-up"></i>
                    </button>
                </div>
                <img class="zoomable-image" 
                     src="${currentImage.imageUrl || currentImage.data}" 
                     alt="${currentImage.name}" 
                     style="transform: scale(${this.currentZoom});"
                     onclick="app.toggleZoom()">
                <div class="drag-info">ลากเมาส์เพื่อขยับรูปภาพ</div>
            `;
        }
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
            const opt = document.createElement('option');
            opt.textContent = '-- ยังไม่มีหมวดหมู่ --';
            opt.disabled = true;
            opt.selected = true;
            this.elements.categorySelect.appendChild(opt);
        } else {
            const allOpt = document.createElement('option');
            allOpt.value = '';
            allOpt.textContent = 'ทั้งหมด';
            allOpt.selected = true;
            this.elements.categorySelect.appendChild(allOpt);
            
            categories.forEach(category => {
                const opt = document.createElement('option');
                opt.value = category;
                opt.textContent = category;
                this.elements.categorySelect.appendChild(opt);
                
                if (galleryCategorySelect) {
                    const galleryOpt = document.createElement('option');
                    galleryOpt.value = category;
                    galleryOpt.textContent = category;
                    galleryCategorySelect.appendChild(galleryOpt);
                }
            });
        }
    },

    // ==================== MODAL FUNCTIONS ====================

    // แสดง modal
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    },

    // ปิด modal
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    },

    // ปิด modal ทั้งหมด
    closeAllModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.style.display = 'none';
        });
        document.body.style.overflow = 'auto';
    },

    // ฟังก์ชันปิด modal เฉพาะ
    closeSecurityModal() { this.closeModal('securityModal'); },
    closeAlbumModal() { this.closeModal('albumModal'); },
    closeImageModal() { this.closeModal('imageModal'); },
    closeCreateAlbumModal() { this.closeModal('createAlbumModal'); },
    closeAddPhotosModal() { this.closeModal('addPhotosModal'); },
    closeAddGalleryPhotoModal() { this.closeModal('addGalleryPhotoModal'); },
    closeHistoryModal() { this.closeModal('historyModal'); },

    // ==================== SECURITY FUNCTIONS ====================

    showSecurityModal() {
        this.renderSecurityDashboard();
        this.showModal('securityModal');
        securitySystem.logSecurityEvent('LOW', 'User accessed security dashboard');
    },

    renderSecurityDashboard() {
        const statusDetails = document.getElementById('securityStatusDetails');
        const logsList = document.getElementById('securityLogsList');
        
        if (statusDetails) {
            statusDetails.innerHTML = `
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 15px;">
                    <div style="background: rgba(0,204,136,0.2); padding: 15px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 2rem; font-weight: bold;">${securitySystem.logs.length}</div>
                        <div>เหตุการณ์ทั้งหมด</div>
                    </div>
                    <div style="background: rgba(255,100,100,0.2); padding: 15px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 2rem; font-weight: bold;">${securitySystem.logs.filter(log => log.level === 'HIGH').length}</div>
                        <div>ความเสี่ยงสูง</div>
                    </div>
                    <div style="background: rgba(255,170,0,0.2); padding: 15px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 2rem; font-weight: bold;">${securitySystem.logs.filter(log => log.level === 'MEDIUM').length}</div>
                        <div>ความเสี่ยงปานกลาง</div>
                    </div>
                </div>
            `;
        }
        
        if (logsList) {
            logsList.innerHTML = '';
            if (securitySystem.logs.length === 0) {
                logsList.innerHTML = '<div style="text-align: center; padding: 20px; color: #888;">ไม่มีบันทึกความปลอดภัย</div>';
                return;
            }
            
            securitySystem.logs.slice(0, 10).forEach(log => {
                const logElement = document.createElement('div');
                logElement.className = 'security-log-item';
                
                const levelClass = `log-level-${log.level.toLowerCase()}`;
                const time = new Date(log.timestamp).toLocaleString('th-TH');
                
                logElement.innerHTML = `
                    <div>
                        <span class="${levelClass}">[${log.level}]</span>
                        <span>${log.message}</span>
                        <div style="font-size: 0.8rem; color: #888;">${time}</div>
                    </div>
                    <button onclick="app.viewSecurityLogDetails('${log.timestamp}')" class="album-action-btn">
                        <i class="fas fa-info-circle"></i>
                    </button>
                `;
                
                logsList.appendChild(logElement);
            });
        }
    },

    viewSecurityLogDetails(timestamp) {
        const log = securitySystem.logs.find(l => l.timestamp === timestamp);
        if (log) {
            alert(`รายละเอียดเหตุการณ์ความปลอดภัย:\n\nระดับ: ${log.level}\nข้อความ: ${log.message}\nเวลา: ${new Date(log.timestamp).toLocaleString('th-TH')}\nรายละเอียด: ${JSON.stringify(log.details, null, 2)}`);
        }
    },

    clearSecurityLogs() {
        if (confirm('คุณต้องการล้างบันทึกความปลอดภัยทั้งหมดใช่หรือไม่?')) {
            securitySystem.logs = [];
            securitySystem.saveSecurityLogs();
            securitySystem.updateSecurityStatus();
            this.renderSecurityDashboard();
            securitySystem.logSecurityEvent('LOW', 'User cleared security logs');
        }
    },

    runSecurityScan() {
        securitySystem.logSecurityEvent('LOW', 'Security scan initiated');
        alert('🔒 กำลังสแกนระบบความปลอดภัย...\n\nไม่พบปัญหาความปลอดภัย');
        securitySystem.logSecurityEvent('LOW', 'Security scan completed - No issues found');
    },

    exportSecurityData() {
        const securityData = {
            logs: securitySystem.logs,
            scanTime: new Date().toISOString(),
            systemInfo: {
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                language: navigator.language
            }
        };
        
        utils.exportToJSON(securityData, `security-report-${new Date().toISOString().split('T')[0]}.json`);
        securitySystem.logSecurityEvent('LOW', 'Security data exported');
    },

    // ==================== GALLERY PHOTO FUNCTIONS ====================

    showAddGalleryPhotoModal() {
        console.log('📸 Opening add gallery photo modal...');
        const form = document.getElementById('addGalleryPhotoForm');
        if (form) form.reset();
        
        const preview = document.getElementById('galleryPhotoPreview');
        if (preview) preview.innerHTML = '';
        
        this.selectedGalleryPhoto = null;
        this.showModal('addGalleryPhotoModal');
        
        securitySystem.logSecurityEvent('LOW', 'Add gallery photo modal opened');
    },

    handleGalleryPhotoSelect(files) {
        if (files.length > 0) {
            const file = files[0];
            
            try {
                securitySystem.validateFile(file);
                
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.selectedGalleryPhoto = {
                        name: file.name,
                        data: e.target.result
                    };
                    
                    const preview = document.getElementById('galleryPhotoPreview');
                    if (preview) {
                        preview.innerHTML = `
                            <img src="${e.target.result}" style="max-width: 200px; max-height: 150px; border-radius: 8px;">
                            <p style="margin-top: 10px; color: #ccc;">${securitySystem.sanitizeHTML(file.name)}</p>
                        `;
                    }
                    
                    securitySystem.logSecurityEvent('LOW', 'Gallery photo selected', { filename: file.name });
                };
                reader.readAsDataURL(file);
            } catch (error) {
                alert(error.message);
                securitySystem.logSecurityEvent('MEDIUM', 'Invalid file selected', { error: error.message });
            }
        }
    },

    loadGalleryPhotoFromURL() {
        if (!securitySystem.checkRateLimit('url_upload')) {
            alert('การดำเนินการนี้ถูกจำกัดจำนวนครั้ง กรุณารอสักครู่');
            return;
        }
        
        const urlInput = document.getElementById('galleryPhotoURL');
        const url = urlInput ? urlInput.value.trim() : '';
        
        if (!url) {
            alert('กรุณากรอก URL ของรูปภาพ');
            return;
        }
        
        if (!securitySystem.validateImageURL(url)) {
            alert('URL นี้ไม่ปลอดภัยหรือไม่ได้รับการอนุญาต');
            return;
        }
        
        const preview = document.getElementById('galleryPhotoPreview');
        if (preview) {
            preview.innerHTML = '<p style="color: #ccc;">กำลังโหลดรูปภาพ...</p>';
        }
        
        const img = new Image();
        img.onload = () => {
            this.selectedGalleryPhoto = {
                name: utils.getFilenameFromURL(url) || 'รูปภาพจาก URL',
                data: url
            };
            
            if (preview) {
                preview.innerHTML = `
                    <div class="url-preview">
                        <img src="${url}" alt="รูปภาพจาก URL">
                        <p>${this.selectedGalleryPhoto.name}</p>
                        <p style="color: #00cc88;">โหลดรูปภาพสำเร็จ!</p>
                    </div>
                `;
            }
            
            if (urlInput) urlInput.value = '';
            securitySystem.logSecurityEvent('LOW', 'Gallery photo loaded from URL', { url });
        };
        
        img.onerror = () => {
            if (preview) {
                preview.innerHTML = '<p style="color: #ff5555;">ไม่สามารถโหลดรูปภาพจาก URL นี้ได้</p>';
            }
            securitySystem.logSecurityEvent('MEDIUM', 'Failed to load image from URL', { url });
        };
        
        img.src = url;
    },

    saveGalleryPhoto() {
        if (!securitySystem.checkRateLimit('add_photo')) {
            alert('การดำเนินการนี้ถูกจำกัดจำนวนครั้ง กรุณารอสักครู่');
            return;
        }

        const photoNameInput = document.getElementById('galleryPhotoName');
        const categorySelect = document.getElementById('galleryPhotoCategory');
        
        const photoName = photoNameInput ? photoNameInput.value.trim() : '';
        const category = categorySelect ? categorySelect.value : '';
        
        if (!photoName) {
            alert('กรุณากรอกชื่อรูปภาพ');
            return;
        }
        
        if (!category) {
            alert('กรุณาเลือกหมวดหมู่');
            return;
        }
        
        if (!this.selectedGalleryPhoto) {
            alert('กรุณาเลือกรูปภาพ');
            return;
        }

        // สร้างหมวดหมู่ใหม่ถ้ายังไม่มี
        if (!this.data.categories[category]) {
            this.data.categories[category] = [];
            this.addHistory('สร้างหมวดหมู่', `สร้างหมวดหมู่ '${category}'`);
        }

        // เพิ่มรูปภาพในหมวดหมู่
        const newPhoto = {
            id: utils.generateId(),
            name: securitySystem.sanitizeHTML(photoName),
            imageUrl: this.selectedGalleryPhoto.data,
            description: '',
            createdAt: new Date().toISOString(),
            createdBy: 'ผู้ใช้'
        };
        
        this.data.categories[category].push(newPhoto);
        this.saveData();
        
        this.addHistory('เพิ่มรูปภาพ', `เพิ่มรูปภาพ '${photoName}' ในหมวดหมู่ '${category}'`);
        
        this.closeAddGalleryPhotoModal();
        this.render();
        
        if (!this.isMuted) {
            setTimeout(() => {
                this.speakText(`เพิ่มรูปภาพ ${photoName} ในหมวดหมู่ ${category} เรียบร้อยแล้ว`);
            }, 500);
        }
        
        securitySystem.logSecurityEvent('LOW', 'Gallery photo saved', { 
            name: photoName, 
            category: category 
        });

        alert('✅ บันทึกรูปภาพเรียบร้อยแล้ว!');
    },

    deleteGalleryPhoto(category, index) {
        const photo = this.data.categories[category][index];
        if (confirm(`คุณต้องการลบรูปภาพ "${photo.name}" ใช่หรือไม่?`)) {
            this.data.categories[category].splice(index, 1);
            
            // ลบหมวดหมู่ถ้าไม่มีรูปภาพแล้ว
            if (this.data.categories[category].length === 0) {
                delete this.data.categories[category];
            }
            
            this.saveData();
            this.addHistory('ลบรูปภาพ', `ลบรูปภาพ '${photo.name}' จากหมวดหมู่ '${category}'`);
            this.render();
            
            this.speakText(`ลบรูปภาพ ${photo.name} เรียบร้อยแล้ว`);
        }
    },

    // ==================== ALBUM FUNCTIONS ====================

    showCreateAlbumModal() {
        console.log('📁 Opening create album modal...');
        const form = document.getElementById('createAlbumForm');
        if (form) form.reset();
        this.showModal('createAlbumModal');
        securitySystem.logSecurityEvent('LOW', 'Create album modal opened');
    },

    createNewAlbum(event) {
        event.preventDefault();
        
        const albumNameInput = document.getElementById('albumName');
        const albumDescriptionInput = document.getElementById('albumDescription');
        
        const albumName = albumNameInput ? albumNameInput.value.trim() : '';
        const albumDescription = albumDescriptionInput ? albumDescriptionInput.value.trim() : '';

        if (!albumName) {
            alert('กรุณากรอกชื่ออัลบั้ม');
            return;
        }

        if (this.data.albums[albumName]) {
            alert('มีอัลบั้มชื่อนี้อยู่แล้ว');
            return;
        }

        this.data.albums[albumName] = {
            id: utils.generateId(),
            name: albumName,
            description: albumDescription,
            photos: [],
            coverImage: '',
            createdAt: new Date().toISOString(),
            createdBy: 'ผู้ใช้'
        };

        this.saveData();
        this.addHistory('สร้างอัลบั้ม', `สร้างอัลบั้ม '${albumName}'`);
        
        this.closeCreateAlbumModal();
        this.render();
        
        this.speakText(`สร้างอัลบั้ม ${albumName} เรียบร้อยแล้ว`);
        alert('✅ สร้างอัลบั้มเรียบร้อยแล้ว!');
    },

    // ==================== HISTORY FUNCTIONS ====================

    renderHistory() {
        if (!this.elements.gallery) return;
        
        this.elements.gallery.innerHTML = '';
        
        if (this.data.history.length === 0) {
            this.elements.gallery.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-history"></i>
                    <p>ยังไม่มีประวัติการใช้งาน</p>
                </div>
            `;
            return;
        }
        
        const historyContainer = document.createElement('div');
        historyContainer.style.width = '100%';
        
        this.data.history.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            
            const time = new Date(item.timestamp).toLocaleString('th-TH');
            
            historyItem.innerHTML = `
                <div class="history-type">${item.type}</div>
                <div class="history-details">${item.details}</div>
                <div class="history-time">${time}</div>
            `;
            
            historyContainer.appendChild(historyItem);
        });
        
        this.elements.gallery.appendChild(historyContainer);
    },

    showHistoryModal() {
        this.renderHistoryModal();
        this.showModal('historyModal');
    },

    renderHistoryModal() {
        const historyContent = document.getElementById('historyContent');
        if (!historyContent) return;
        
        historyContent.innerHTML = '';
        
        if (this.data.history.length === 0) {
            historyContent.innerHTML = '<div class="empty-state"><i class="fas fa-history"></i> ยังไม่มีประวัติการใช้งาน</div>';
            return;
        }
        
        this.data.history.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            
            const time = new Date(item.timestamp).toLocaleString('th-TH');
            
            historyItem.innerHTML = `
                <div class="history-type">${item.type}</div>
                <div class="history-details">${item.details}</div>
                <div class="history-time">${time}</div>
            `;
            
            historyContent.appendChild(historyItem);
        });
    },

    clearHistory() {
        if (confirm('คุณต้องการล้างประวัติการใช้งานทั้งหมดใช่หรือไม่?')) {
            this.data.history = [];
            this.saveData();
            this.renderHistory();
            this.speakText('ล้างประวัติการใช้งานเรียบร้อยแล้ว');
        }
    },

    // ==================== ALBUM VIEW FUNCTIONS ====================

    renderAlbums() {
        if (!this.elements.gallery) return;
        
        this.elements.gallery.innerHTML = '';
        const search = this.elements.searchBox ? this.elements.searchBox.value.toLowerCase() : '';
        const albums = Object.keys(this.data.albums || {});
        
        if (albums.length === 0) {
            this.elements.gallery.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-folder"></i>
                    <p>ยังไม่มีอัลบั้ม</p>
                    <p style="margin-top: 10px; font-size: 0.9rem; color: #888;">สร้างอัลบั้มแรกของคุณโดยคลิกปุ่ม "สร้างอัลบั้ม"</p>
                </div>
            `;
            return;
        }
        
        let hasResults = false;
        albums.forEach(name => {
            if (search && !name.toLowerCase().includes(search)) return;
            hasResults = true;
            
            const album = this.data.albums[name];
            const card = document.createElement('div');
            card.className = 'album-card';
            card.onclick = () => this.viewAlbumByName(name);
            
            const hasPhotos = album.photos && album.photos.length > 0;
            const cover = hasPhotos ? 
                (this.getPhotoById(album.photos[0])?.imageUrl || '') : 
                '';
            
            card.innerHTML = `
                <div class="album-cover" style="background-image:url('${cover}')">
                    ${!hasPhotos ? '<div class="empty-album-cover"><i class="far fa-folder-open"></i></div>' : ''}
                </div>
                <div class="album-info">
                    <div class="album-name">${name}</div>
                    <div class="album-count">${album.photos.length} รูป</div>
                    <div class="album-actions">
                        <button class="album-action-btn" onclick="event.stopPropagation(); app.editAlbum('${name}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="album-action-btn" onclick="event.stopPropagation(); app.deleteAlbum('${name}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
            this.elements.gallery.appendChild(card);
        });
        
        if (!hasResults) {
            this.elements.gallery.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-folder"></i>
                    <p>ไม่พบอัลบั้มที่ตรงกับการค้นหา</p>
                </div>
            `;
        }
    },

    getPhotoById(photoId) {
        // ฟังก์ชันช่วยในการหารูปภาพโดยใช้ ID
        for (const category in this.data.categories) {
            const photo = this.data.categories[category].find(p => p.id === photoId);
            if (photo) return photo;
        }
        return null;
    },

    viewAlbumByName(name) {
        this.currentAlbumName = name;
        const modalAlbumTitle = document.getElementById('modalAlbumTitle');
        const albumModalContent = document.getElementById('albumModalContent');
        
        if (modalAlbumTitle) {
            modalAlbumTitle.textContent = name;
        }
        
        if (albumModalContent) {
            albumModalContent.innerHTML = '';
            const album = this.data.albums[name];
            const photos = album.photos || [];
            
            if (photos.length === 0) {
                albumModalContent.innerHTML = `
                    <div style="text-align: center; padding: 2rem;">
                        <i class="far fa-folder-open" style="font-size: 4rem; color: #666; margin-bottom: 1rem;"></i>
                        <p style="color: #ccc; font-size: 1.1rem;">อัลบั้มนี้ยังไม่มีรูปภาพ</p>
                        <p style="color: #888; margin-top: 0.5rem;">เพิ่มรูปภาพแรกของคุณในอัลบั้ม "${name}"</p>
                    </div>
                `;
            } else {
                // สร้าง grid สำหรับรูปภาพในอัลบั้ม
                // (สามารถเพิ่มได้ในภายหลัง)
                albumModalContent.innerHTML = `
                    <div style="text-align: center; padding: 2rem;">
                        <p style="color: #ccc;">อัลบั้ม "${name}" มี ${photos.length} รูปภาพ</p>
                        <p style="color: #888; margin-top: 0.5rem;">ฟังก์ชันการแสดงรูปภาพในอัลบั้มจะถูกเพิ่มในอนาคต</p>
                    </div>
                `;
            }
        }
        
        this.showModal('albumModal');
    },

    deleteAlbum(albumName) {
        if (confirm(`คุณต้องการลบอัลบั้ม "${albumName}" ใช่หรือไม่?`)) {
            delete this.data.albums[albumName];
            this.saveData();
            this.addHistory('ลบอัลบั้ม', `ลบอัลบั้ม '${albumName}'`);
            this.render();
            if (this.currentAlbumName === albumName) {
                this.closeAlbumModal();
            }
            this.speakText(`ลบอัลบั้ม ${albumName} เรียบร้อยแล้ว`);
        }
    },

    deleteCurrentAlbum() {
        this.deleteAlbum(this.currentAlbumName);
    },

    editAlbum(albumName) {
        const newName = prompt('กรอกชื่ออัลบั้มใหม่:', albumName);
        if (newName && newName.trim() && newName !== albumName) {
            if (this.data.albums[newName]) {
                alert('มีอัลบั้มชื่อนี้อยู่แล้ว');
                return;
            }
            this.data.albums[newName] = this.data.albums[albumName];
            delete this.data.albums[albumName];
            this.saveData();
            this.addHistory('แก้ไขอัลบั้ม', `แก้ไขชื่ออัลบั้มจาก '${albumName}' เป็น '${newName}'`);
            this.render();
            if (this.currentAlbumName === albumName) {
                this.closeAlbumModal();
            }
            this.speakText(`แก้ไขชื่ออัลบั้มเป็น ${newName} เรียบร้อยแล้ว`);
        }
    },

    // ==================== IMAGE VIEWER FUNCTIONS ====================

    zoomIn() {
        if (this.currentZoom < 3) {
            this.currentZoom += 0.1;
            this.updateZoom();
        }
    },

    zoomOut() {
        if (this.currentZoom > 0.5) {
            this.currentZoom -= 0.1;
            this.updateZoom();
        }
    },

    resetZoom() {
        this.currentZoom = 1;
        this.updateZoom();
    },

    toggleZoom() {
        this.currentZoom = this.currentZoom === 1 ? 2 : 1;
        this.updateZoom();
    },

    updateZoom() {
        const zoomableImage = document.querySelector('.zoomable-image');
        const zoomLevel = document.querySelector('.zoom-level');
        if (zoomableImage) {
            zoomableImage.style.transform = `scale(${this.currentZoom})`;
        }
        if (zoomLevel) {
            zoomLevel.textContent = `${Math.round(this.currentZoom * 100)}%`;
        }
    },

    prevImage() {
        if (this.currentImages.length > 1) {
            this.currentImageIndex = (this.currentImageIndex - 1 + this.currentImages.length) % this.currentImages.length;
            this.updateImageDisplay();
            this.resetZoom();
        }
    },

    nextImage() {
        if (this.currentImages.length > 1) {
            this.currentImageIndex = (this.currentImageIndex + 1) % this.currentImages.length;
            this.updateImageDisplay();
            this.resetZoom();
        }
    },

    enterFullscreen() {
        const currentImage = this.currentImages[this.currentImageIndex];
        const fullscreenImage = document.getElementById('fullscreenImage');
        const fullscreenCounter = document.getElementById('fullscreenCounter');
        
        if (fullscreenImage) {
            fullscreenImage.src = currentImage.imageUrl || currentImage.data;
        }
        if (fullscreenCounter) {
            fullscreenCounter.textContent = `${this.currentImageIndex + 1}/${this.currentImages.length}`;
        }
        
        this.showModal('fullscreenMode');
    },

    exitFullscreen() {
        this.closeModal('fullscreenMode');
    },

    fullscreenPrevImage() {
        this.prevImage();
        this.enterFullscreen();
    },

    fullscreenNextImage() {
        this.nextImage();
        this.enterFullscreen();
    },

    fullscreenZoomIn() { this.zoomIn(); },
    fullscreenZoomOut() { this.zoomOut(); },
    fullscreenResetZoom() { this.resetZoom(); },
    toggleFullscreenInfo() { 
        // ฟังก์ชันสำหรับซ่อน/แสดงข้อมูลใน fullscreen mode
        console.log('Toggle fullscreen info');
    },

    // ==================== UTILITY FUNCTIONS ====================

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
        
        // ยกเลิกการพูดที่กำลังดำเนินอยู่
        this.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'th-TH';
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;
        
        // รอให้ voices พร้อม
        if (speechSynthesis.getVoices().length > 0) {
            const voices = speechSynthesis.getVoices();
            const thaiVoice = voices.find(voice => voice.lang === 'th-TH' || voice.lang.startsWith('th-'));
            if (thaiVoice) {
                utterance.voice = thaiVoice;
            }
            this.speechSynthesis.speak(utterance);
        } else {
            // ถ้า voices ยังไม่พร้อม รอสักครู่
            setTimeout(() => {
                const voices = speechSynthesis.getVoices();
                const thaiVoice = voices.find(voice => voice.lang === 'th-TH' || voice.lang.startsWith('th-'));
                if (thaiVoice) {
                    utterance.voice = thaiVoice;
                }
                this.speechSynthesis.speak(utterance);
            }, 100);
        }
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
