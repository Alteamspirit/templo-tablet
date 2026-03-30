const fs = require('fs');
let content = fs.readFileSync('c:\\Users\\dlope\\Desktop\\Tablet Templo\\app.js', 'utf8');

const firebaseSnippet = `
    // ==========================================
    // Sincronización Realtime con Firebase
    // ==========================================
    const firebaseConfig = {
      apiKey: "AIzaSyA5ghS4kxQKX_b8VYelD5pAAwuE1pqgOe8",
      authDomain: "tablet-templo.firebaseapp.com",
      projectId: "tablet-templo",
      storageBucket: "tablet-templo.firebasestorage.app",
      messagingSenderId: "796706681996",
      appId: "1:796706681996:web:28efce21b0667e3a8937a9"
    };
    
    if (typeof firebase !== 'undefined' && !firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
        const db = firebase.database();

        window.saveToCloud = function(path, data, storageKey) {
            localStorage.setItem(storageKey, JSON.stringify(data));
            db.ref(path).set(data);
        };

        function setupFirebaseSync(path, localData, storageKey, onDataUpdate) {
            const ref = db.ref(path);
            ref.on('value', (snap) => {
                if (snap.exists() && snap.val() !== null) {
                    const data = snap.val();
                    localStorage.setItem(storageKey, JSON.stringify(data));
                    if (onDataUpdate) onDataUpdate(data);
                } else {
                    ref.set(localData);
                }
            });
        }

        setupFirebaseSync('rituales', MOCK_RITUALES, RITUALES_STORAGE_KEY, (data) => {
            MOCK_RITUALES = data;
            if (typeof renderAdminRituales === 'function') renderAdminRituales();
            if (typeof renderRituales === 'function') renderRituales();
        });

        setupFirebaseSync('talleresCatalogo', MOCK_TALLERES_CATALOGO, TALLERES_CATALOGO_KEY, (data) => {
            MOCK_TALLERES_CATALOGO = data;
            if (typeof renderAdminTalleresCatalogo === 'function') renderAdminTalleresCatalogo();
            if (typeof renderTalleresCatalogo === 'function') renderTalleresCatalogo();
        });

        setupFirebaseSync('talleresData', TALLERES_DATA, STORAGE_KEY, (data) => {
            TALLERES_DATA = data;
            if (!isDrawing && !isDragging && !isResizing) {
                renderTalleres();
            }
        });

        setupFirebaseSync('qrConfig', QR_DATA, QR_STORAGE_KEY, (data) => {
            QR_DATA = data;
            if (typeof renderQRGrid === 'function') renderQRGrid();
        });
    }

`;

// Replace bottom logic
content = content.replace("resetInactivity();\n});", "resetInactivity();\n" + firebaseSnippet + "\n});");

// Replace all sets
content = content.replace(/localStorage\.setItem\(RITUALES_STORAGE_KEY,\s*JSON\.stringify\(MOCK_RITUALES\)\);/g, "if(window.saveToCloud) window.saveToCloud('rituales', MOCK_RITUALES, RITUALES_STORAGE_KEY); else localStorage.setItem(RITUALES_STORAGE_KEY, JSON.stringify(MOCK_RITUALES));");

content = content.replace(/localStorage\.setItem\(TALLERES_CATALOGO_KEY,\s*JSON\.stringify\(MOCK_TALLERES_CATALOGO\)\);/g, "if(window.saveToCloud) window.saveToCloud('talleresCatalogo', MOCK_TALLERES_CATALOGO, TALLERES_CATALOGO_KEY); else localStorage.setItem(TALLERES_CATALOGO_KEY, JSON.stringify(MOCK_TALLERES_CATALOGO));");

content = content.replace(/localStorage\.setItem\(STORAGE_KEY,\s*JSON\.stringify\(TALLERES_DATA\)\);/g, "if(window.saveToCloud) window.saveToCloud('talleresData', TALLERES_DATA, STORAGE_KEY); else localStorage.setItem(STORAGE_KEY, JSON.stringify(TALLERES_DATA));");

content = content.replace(/localStorage\.setItem\(QR_STORAGE_KEY,\s*JSON\.stringify\(QR_DATA\)\);/g, "if(window.saveToCloud) window.saveToCloud('qrConfig', QR_DATA, QR_STORAGE_KEY); else localStorage.setItem(QR_STORAGE_KEY, JSON.stringify(QR_DATA));");

fs.writeFileSync('c:\\Users\\dlope\\Desktop\\Tablet Templo\\app.js', content, 'utf8');
console.log('App.js modified successfully with Firebase cloud sync.');
