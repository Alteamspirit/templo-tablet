// Actualizar reloj y fecha
function updateClock() {
    const timeDisplay = document.getElementById('time-display');
    const dateDisplay = document.getElementById('date-display');
    
    if (!timeDisplay || !dateDisplay) return;

    const now = new Date();
    
    // Formatear hora (ej: 10:45 AM)
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; 
    timeDisplay.textContent = `${hours}:${minutes} ${ampm}`;
    
    // Formatear fecha (ej: Lunes, 24 de Mayo)
    const opcionesFecha = { weekday: 'long', day: 'numeric', month: 'long' };
    const fechaFormateada = now.toLocaleDateString('es-ES', opcionesFecha);
    // Capitalizar la primera letra
    dateDisplay.textContent = fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1);
}

// Mostrar notificación elegante (Toast)
function showToast(message) {
    // Si ya hay un toast, removerlo
    const existingToast = document.getElementById('custom-toast');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.id = 'custom-toast';
    // Estilos Tailwind para un toast elegante
    toast.className = 'fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-slate-900 border border-slate-700 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 transition-all duration-300 opacity-0 translate-y-4 z-50';
    
    toast.innerHTML = `
        <span class="material-symbols-outlined text-primary">info</span>
        <span class="font-medium tracking-wide text-sm">${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    // Animación de entrada
    setTimeout(() => {
        toast.classList.remove('opacity-0', 'translate-y-4');
        toast.classList.add('opacity-100', 'translate-y-0');
    }, 10);
    
    // Remover después de 3.5 segundos
    setTimeout(() => {
        toast.classList.remove('opacity-100', 'translate-y-0');
        toast.classList.add('opacity-0', 'translate-y-4');
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', () => {
    // Configurar y actualizar el reloj
    updateClock();
    setInterval(updateClock, 60000); // Actualizar cada minuto

    // Helper: Convertir enlaces de Drive/Dropbox a enlaces directos de imagen
    const getDirectImgLink = (url) => {
        if (!url || typeof url !== 'string') return url;
        // Limpiar espacios y comillas accidentales (muy común al copiar/pegar)
        let trimUrl = url.trim().replace(/^["']|["']$/g, '').trim();
        
        // Google Drive
        if (trimUrl.includes('drive.google.com')) {
            let id = '';
            if (trimUrl.includes('id=')) {
                id = trimUrl.split('id=')[1].split('&')[0];
            } else if (trimUrl.includes('/d/')) {
                id = trimUrl.split('/d/')[1].split('/')[0];
            }
            if (id) return `https://lh3.googleusercontent.com/d/${id}`;
        }
        
        // Dropbox
        if (trimUrl.includes('dropbox.com')) {
            return trimUrl.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace('?dl=0', '');
        }
        
        return trimUrl;
    };

    // --- CONFIGURACIÓN Y DATOS (Centralizado al inicio) ---
    const SHEET_ID = "1ApJeSkf-ZCRUrNXDAHZqDXd7foPXlkiG30PDp6VyEJ0";
    const RITUALES_STORAGE_KEY = 'templo_rituales_config';
    const STORAGE_KEY = 'templo_talleres_config';
    const HOME_QR_STORAGE_KEY = 'templo_home_qrs_config';
    const SCHEDULE_IMG_STORAGE_KEY = 'templo_schedule_img_config';
    const INACTIVITY_LIMIT = 60000; // 1 minuto
    const CYCLE_INTERVAL = 15000;
    
    let TABS_MULTIMEDIA = [
        { name: "Fondos", gid: "940405146" }
    ];

    let HOME_QR_DATA = JSON.parse(localStorage.getItem(HOME_QR_STORAGE_KEY)) || {
        ios: "https://apps.apple.com/es/app/id6444007889",
        android: "https://play.google.com/store/apps/details?id=es.iconecta.zenestetic"
    };

    let SCHEDULE_IMG_URL = localStorage.getItem(SCHEDULE_IMG_STORAGE_KEY) || "agenda/Marzo 26.jpeg";

    const CATEGORY_BANNERS = {
        "HOLISTIC AYURVEDA": "https://eltemplobyzenestetic.es/wp-content/uploads/2025/12/HOLISTIC-SHIRODHARA-819x1024.png",
        "KIZUNA": "https://eltemplobyzenestetic.es/wp-content/uploads/2025/12/DUO-KITO-819x1024.png",
        "KAO ZEN": "https://eltemplobyzenestetic.es/wp-content/uploads/2025/12/KAO-CAMINO-ZEN-819x1024.png",
        "KEISACOS": "https://eltemplobyzenestetic.es/wp-content/uploads/2025/12/KEISACO-ASHI-819x1024.png",
        "SAMSKARA": "https://eltemplobyzenestetic.es/wp-content/uploads/2025/12/SAMSKARA-KIKAI-819x1024.png",
        "NAGARE": "https://eltemplobyzenestetic.es/wp-content/uploads/2025/12/NAGARE-MADERO-PRANA-819x1024.png"
    };

    let MOCK_RITUALES = JSON.parse(localStorage.getItem(RITUALES_STORAGE_KEY)) || [
      { id: 1, categoria: "HOLISTIC AYURVEDA", titulo: "HOLISTIC BASHPA SWEDHANA", descripcion: "Una sauna ayurvédica que purifica, relaja y renueva de forma suave y sin agobios.", duracion: "90 min", precio: "180,00€", imagen: "https://eltemplobyzenestetic.es/wp-content/uploads/2025/12/HOLISTIC-BASHPA-SWEDHANA.png" },
      { id: 2, categoria: "HOLISTIC AYURVEDA", titulo: "HOLISTIC KATI VASTI", descripcion: "Un tratamiento focalizado en espalda y puntos energéticos, con envolturas que aportan calor o frescor.", duracion: "75 min", precio: "115,00€", imagen: "https://eltemplobyzenestetic.es/wp-content/uploads/2025/12/HOLISTIC-KATI-VASTI.png" },
      { id: 3, categoria: "HOLISTIC AYURVEDA", titulo: "HOLISTIC SHIRODHARA", descripcion: "Un ritual de calma profunda donde un hilo continuo de aceite tibio cae sobre la frente.", duracion: "45 min", precio: "110,00€", imagen: "https://eltemplobyzenestetic.es/wp-content/uploads/2025/12/HOLISTIC-SHIRODHARA-1.png" },
      { id: 4, categoria: "HOLISTIC AYURVEDA", titulo: "HOLISTIC ABHYANGA", descripcion: "El masaje ayurvédico tradicional con aceites calientes y movimientos envolventes.", duracion: "60 min", precio: "125,00€", imagen: "https://eltemplobyzenestetic.es/wp-content/uploads/2025/12/HOLISTIC-ABHYANGA.png" },
      { id: 5, categoria: "HOLISTIC AYURVEDA", titulo: "HOLISTIC HARMONY", descripcion: "Un ritual ayurvédico centrado en la respiración y la energía.", duracion: "75 min", precio: "125,00€", imagen: "https://eltemplobyzenestetic.es/wp-content/uploads/2025/12/HOLISTIC-HARMONY.png" },
      { id: 6, categoria: "KIZUNA", titulo: "KIZUNA SANZEN NIRVANA", descripcion: "Una experiencia grupal con actividad, masaje y brunch para celebrar y conectar.", duracion: "180 min", precio: "140,00€", imagen: "https://eltemplobyzenestetic.es/wp-content/uploads/2025/12/KIZUNA-SANZEN-NIRVANA.png" },
      { id: 7, categoria: "KIZUNA", titulo: "KIZUNA SANZEN KOAN", descripcion: "Un ritual grupal con masaje y brunch para vivir bienestar y conexión juntas.", duracion: "180 min", precio: "125,00€", imagen: "https://eltemplobyzenestetic.es/wp-content/uploads/2025/12/KIZUNA-SANZEN-KOAN.png" },
      { id: 8, categoria: "KIZUNA", titulo: "KIZUNA DUO HIKARI", descripcion: "Un dúo centrado en los pies para liberar tensiones y encontrar ligereza juntos.", duracion: "60 min", precio: "130,00€", imagen: "https://eltemplobyzenestetic.es/wp-content/uploads/2025/12/DUO-HIKARI.png" },
      { id: 9, categoria: "KIZUNA", titulo: "KIZUNA DUO KOKORO", descripcion: "Un dúo que libera tensión facial y mental para recuperar calma y vitalidad.", duracion: "45 min", precio: "130,00€", imagen: "https://eltemplobyzenestetic.es/wp-content/uploads/2025/12/DUO-KOKORO.png" },
      { id: 10, categoria: "KIZUNA", titulo: "KIZUNA DUO KITO", descripcion: "Un dúo terapéutico con ventosas/pindas para liberar tensión y reconectar.", duracion: "60 min", precio: "148,00€", imagen: "https://eltemplobyzenestetic.es/wp-content/uploads/2025/12/DUO-KITO-1.png" },
      { id: 11, categoria: "KIZUNA", titulo: "KIZUNA DUO TEMPLO", descripcion: "Un masaje dúo personalizado para soltar estrés y compartir calma profunda.", duracion: "75 min", precio: "240,00€", imagen: "https://eltemplobyzenestetic.es/wp-content/uploads/2025/12/DUO-TEMPLO.png" },
      { id: 12, categoria: "KIZUNA", titulo: "KIZUNA DUO CALMA", descripcion: "Un dúo sensorial que lleva a ambos a una calma profunda y equilibrada.", duracion: "90 min", precio: "280,00€", imagen: "https://eltemplobyzenestetic.es/wp-content/uploads/2025/12/DUO-CALMA.png" },
      { id: 13, categoria: "KIZUNA", titulo: "KIZUNA DUO LOVE", descripcion: "Un dúo de conexión profunda con masaje, baño y brunch para vivir bienestar juntos.", duracion: "105 min", precio: "390,00€", imagen: "https://eltemplobyzenestetic.es/wp-content/uploads/2025/12/DUO-LOVE.png" },
      { id: 14, categoria: "KAO ZEN", titulo: "KAO DETOX ESPALDA", descripcion: "Una detox profunda para una espalda limpia, suave y equilibrada.", duracion: "60 min", precio: "75,00€", imagen: "https://eltemplobyzenestetic.es/wp-content/uploads/2025/12/KAO-DETOX-ESPALDA.png" },
      { id: 15, categoria: "KAO ZEN", titulo: "KAO KOBILAIV", descripcion: "Un lifting manual intenso que esculpe, oxigena y revitaliza tu piel al instante.", duracion: "60 min", precio: "78,00€", imagen: "https://eltemplobyzenestetic.es/wp-content/uploads/2025/12/KAO-KOBILAIV.png" },
      { id: 16, categoria: "KAO ZEN", titulo: "KAO CAMINO ZEN", descripcion: "Un ritual sensorial que nutre, equilibra y transforma tu piel con ingredientes de la tierra.", duracion: "75 min", precio: "90,00€", imagen: "https://eltemplobyzenestetic.es/wp-content/uploads/2025/12/KAO-CAMINO-ZEN-1.png" },
      { id: 17, categoria: "KAO ZEN", titulo: "KAO MIZU", descripcion: "Una higiene profunda que limpia, oxigena y devuelve el equilibrio natural de tu piel.", duracion: "90 min", precio: "95,00€", imagen: "https://eltemplobyzenestetic.es/wp-content/uploads/2025/12/KAO-ARMONIA-DETOX-ZEN-_.webp" },
      { id: 18, categoria: "KAO ZEN", titulo: "KAO BIHADA", descripcion: "Rellena arrugas y renueva tu piel con un chute potente de colágeno y AH.", duracion: "60 min", precio: "110,00€", imagen: "https://eltemplobyzenestetic.es/wp-content/uploads/2025/12/KAO-ENERGY-ZEN.png" },
      { id: 19, categoria: "KAO ZEN", titulo: "KAO ARASHI", descripcion: "Energía marina para una piel más luminosa, fresca y revitalizada desde la primera sesión.", duracion: "60 min", precio: "100,00€", imagen: "https://eltemplobyzenestetic.es/wp-content/uploads/2025/12/KAO-SPIRULINE-GREEN.png" },
      { id: 20, categoria: "KAO ZEN", titulo: "KAO TAO MEN", descripcion: "Un ritual masculino que hidrata, revitaliza y libera tensión con resultados visibles.", duracion: "60 min", precio: "90,00€", imagen: "https://eltemplobyzenestetic.es/wp-content/uploads/2025/12/KAO-TAO-MEN.png" },
      { id: 21, categoria: "KAO ZEN", titulo: "KAO KAIZEN SKIN", descripcion: "Un express que alimenta tu piel con lo que realmente necesita y le devuelve confort.", duracion: "60 min", precio: "90,00€", imagen: "https://eltemplobyzenestetic.es/wp-content/uploads/2025/12/KAO-KAIZEN-SKIN.png" },
      { id: 22, categoria: "KAO ZEN", titulo: "KAO CALMA ZEN", descripcion: "Un ritual que equilibra y transforma tu piel respetándola al máximo.", duracion: "75 min", precio: "120,00€", imagen: "https://eltemplobyzenestetic.es/wp-content/uploads/2025/12/KAO-CALMA-ZEN.png" },
      { id: 23, categoria: "KAO ZEN", titulo: "KAO SHINSEI", descripcion: "Rejuvenece tu piel desde dentro con firmeza, hidratación y luminosidad.", duracion: "75 min", precio: "120,00€", imagen: "https://eltemplobyzenestetic.es/wp-content/uploads/2025/12/KAO-SHINSEI.png" },
      { id: 24, categoria: "KAO ZEN", titulo: "KAO INDIBA", descripcion: "Tecnología y cuidado consciente para una piel más firme, luminosa y regenerada.", duracion: "60 min", precio: "75,00€", imagen: "https://eltemplobyzenestetic.es/wp-content/uploads/2025/12/KAO-INDIBA.png" },
      { id: 25, categoria: "KEISACOS", titulo: "KEISACO HIKARI", descripcion: "Un ritual de pies que libera tensión, equilibra la energía y relaja todo el cuerpo.", duracion: "45 min", precio: "69,00€", imagen: "https://eltemplobyzenestetic.es/wp-content/uploads/2025/12/KEISACO-HIKARI.png" },
      { id: 26, categoria: "KEISACOS", titulo: "KEISACO KOKORO", descripcion: "Un ritual facial que libera tensión mental y devuelve calma y vitalidad.", duracion: "45 min", precio: "69,00€", imagen: "https://eltemplobyzenestetic.es/wp-content/uploads/2025/12/KEISACO-KOKORO.png" },
      { id: 27, categoria: "KEISACOS", titulo: "KEISACO ASHI", descripcion: "Un masaje profundo que alivia pesadez y revitaliza las piernas.", duracion: "45 min", precio: "69,00€", imagen: "https://eltemplobyzenestetic.es/wp-content/uploads/2025/12/KEISACO-ASHI-2.png" },
      { id: 28, categoria: "KEISACOS", titulo: "KEISACO ESPALDA SANA", descripcion: "Indiba + manos para liberar tensiones profundas y regenerar la espalda.", duracion: "60 min", precio: "78,00€", imagen: "https://eltemplobyzenestetic.es/wp-content/uploads/2025/12/KEISACO-ESPALDA-SANA.png" },
      { id: 29, categoria: "KEISACOS", titulo: "KEISACO KITO", descripcion: "Un descontracturante profundo con ventosas/pindas y manos para liberar bloqueos.", duracion: "60 min", precio: "78,00€", imagen: "https://eltemplobyzenestetic.es/wp-content/uploads/2025/12/KEISACO-KITO.png" },
      { id: 30, categoria: "KEISACOS", titulo: "KEISACO NAGOMI", descripcion: "Un masaje profundo de espalda que libera tensiones y devuelve ligereza.", duracion: "45 min", precio: "69,00€", imagen: "https://eltemplobyzenestetic.es/wp-content/uploads/2025/12/KEISACO-NAGOMI.png" },
      { id: 31, categoria: "SAMSKARA", titulo: "SAMSKARA PRENATAL", descripcion: "Un masaje para la mamá que libera tensión y conecta a mamá y bebé.", duracion: "75 min", precio: "120,00€", imagen: "https://eltemplobyzenestetic.es/wp-content/uploads/2025/12/SAMSKARA-PRENATAL.png" },
      { id: 32, categoria: "SAMSKARA", titulo: "SAMSKARA SPA PRENATAL", descripcion: "Un ritual para la mamá con masaje y baño para aliviar, conectar y sentir calma.", duracion: "90 min", precio: "180,00€", imagen: "https://eltemplobyzenestetic.es/wp-content/uploads/2025/12/SAMSKARA-SPA-PRENATAL.png" },
      { id: 33, categoria: "SAMSKARA", titulo: "SAMSKARA SPA KASHAMA", descripcion: "Un ritual con baño y masaje que relaja, libera y conecta contigo profundamente.", duracion: "90 min", precio: "180,00€", imagen: "https://eltemplobyzenestetic.es/wp-content/uploads/2025/12/SAMSKARA-SPA-KASHAMA.png" },
      { id: 34, categoria: "SAMSKARA", titulo: "SAMSKARA YATRA SPA", descripcion: "Un viaje sensorial con exfoliación, masaje y baño inspirado en dos destinos.", duracion: "120 min", precio: "225,00€", imagen: "https://eltemplobyzenestetic.es/wp-content/uploads/2025/12/SAMSKARA-YARA-SPA.png" },
      { id: 35, categoria: "SAMSKARA", titulo: "SAMSKARA TEMZEN", descripcion: "Un masaje profundo para espalda y piernas que libera tensión y renueva energía.", duracion: "60 min", precio: "130,00€", imagen: "https://eltemplobyzenestetic.es/wp-content/uploads/2025/12/SAMSKARA-TEMZEN.png" },
      { id: 36, categoria: "SAMSKARA", titulo: "SAMSKARA KIKAI ENERGY", descripcion: "Un ritual vibracional que libera tensión y equilibra tu energía desde el sonido.", duracion: "75 min", precio: "125,00€", imagen: "https://eltemplobyzenestetic.es/wp-content/uploads/2025/12/SAMSKARA-KIKAI-1.png" },
      { id: 37, categoria: "SAMSKARA", titulo: "SAMSKARA SAREI ZEN", descripcion: "Un masaje a 4 manos que te sumerge en una paz absoluta.", duracion: "75 min", precio: "190,00€", imagen: "https://eltemplobyzenestetic.es/wp-content/uploads/2025/12/SAMSKARA-SAREI-ZEN.png" },
      { id: 38, categoria: "SAMSKARA", titulo: "SAMSKARA KASHAMA", descripcion: "Un masaje inspirado en técnicas japonesas para calmar y equilibrar todo tu ser.", duracion: "75 min", precio: "125,00€", imagen: "https://eltemplobyzenestetic.es/wp-content/uploads/2025/12/SAMSKARA-KASHAMA.png" },
      { id: 39, categoria: "SAMSKARA", titulo: "SAMSKARA LOMI LOMI", descripcion: "Un ritual fluido y rítmico inspirado en el mar y Hawai.", duracion: "75 min", precio: "125,00€", imagen: "https://eltemplobyzenestetic.es/wp-content/uploads/2025/12/SAMSKARA-LOMI-LOMI.png" },
      { id: 40, categoria: "SAMSKARA", titulo: "SAMSKARA CALMA", descripcion: "Un ritual que te envuelve en una relajación absoluta y paz mental.", duracion: "60 min", precio: "85,00€", imagen: "https://eltemplobyzenestetic.es/wp-content/uploads/2025/12/SAMSKARA-CALMA.png" },
      { id: 41, categoria: "SAMSKARA", titulo: "SAMSKARA GARSHANA", descripcion: "Cepillado en seco + hidratación aromática para renovar, activar y suavizar la piel.", duracion: "60 min", precio: "80,00€", imagen: "https://eltemplobyzenestetic.es/wp-content/uploads/2025/12/SAMSKARA-GARSHANA.png" },
      { id: 42, categoria: "SAMSKARA", titulo: "SAMSKARA ZENNA", descripcion: "Exfoliación + baño hidratante para una piel suave, luminosa y nutrida.", duracion: "60 min", precio: "90,00€", imagen: "https://eltemplobyzenestetic.es/wp-content/uploads/2025/12/SAMSKARA-ZENNA.png" },
      { id: 43, categoria: "SAMSKARA", titulo: "SAMSKARA THALASO TEMPLO", descripcion: "Ritual corporal + facial con algas y cuarzo rosa para revitalizar.", duracion: "120 min", precio: "230,00€", imagen: "https://eltemplobyzenestetic.es/wp-content/uploads/2025/12/SAMSKARA-THALASO-TEMPLO.png" },
      { id: 44, categoria: "SAMSKARA", titulo: "SAMSKARA THALASO BODY", descripcion: "Exfoliación marina y masaje para renovar y relajar profundamente.", duracion: "90 min", precio: "150,00€", imagen: "https://eltemplobyzenestetic.es/wp-content/uploads/2025/12/SAMSKARA-THALASO-BODY.png" },
      { id: 45, categoria: "SAMSKARA", titulo: "SAMSKARA VENUS", descripcion: "Un tratamiento facial + corporal que renueva, nutre y revitaliza todo tu cuerpo.", duracion: "90 min", precio: "190,00€", imagen: "https://eltemplobyzenestetic.es/wp-content/uploads/2025/12/SAMSKARA-VENUS.png" },
      { id: 46, categoria: "NAGARE", titulo: "NAGARE DRENAJE BRASILEÑO", descripcion: "Un drenaje manual potente que elimina líquidos, reduce volumen y mejora la silueta.", duracion: "75 min", precio: "130,00€", imagen: "https://eltemplobyzenestetic.es/wp-content/uploads/2025/12/NAGARE-DRENAJE-BRASILENO.png" },
      { id: 47, categoria: "NAGARE", titulo: "NAGARE MADERO PRANA", descripcion: "Maderoterapia que remodela, drena y reafirma para una silueta equilibrada.", duracion: "90 min", precio: "95,00€", imagen: "https://eltemplobyzenestetic.es/wp-content/uploads/2025/12/NAGARE-MADERO-PRANA-1.png" },
      { id: 48, categoria: "NAGARE", titulo: "NAGARE INDIBA", descripcion: "Tecnología y cuidado para remodelar, reafirmar y regenerar tu cuerpo.", duracion: "60 min", precio: "80,00€", imagen: "https://eltemplobyzenestetic.es/wp-content/uploads/2025/12/NAGARE-INDIBA.png" },
      { id: 49, categoria: "NAGARE", titulo: "NAGARE MADERO SUTRA", descripcion: "Maderoterapia focalizada para trabajar zonas específicas con resultados visibles.", duracion: "75 min", precio: "75,00€", imagen: "https://eltemplobyzenestetic.es/wp-content/uploads/2025/12/NAGARE-MADERO-SUTRA.png" },
      { id: 50, categoria: "NAGARE", titulo: "NAGARE PRESO", descripcion: "Presoterapia avanzada para mejorar la circulación y sentir ligereza inmediata.", duracion: "75 min", precio: "60,00€", imagen: "https://eltemplobyzenestetic.es/wp-content/uploads/2025/12/NAGARE-PRESO.png" },
      { id: 51, categoria: "NAGARE", titulo: "NAGARE COLD BODY", descripcion: "Vendas frías y técnica manual para reafirmar, drena r y refrescar el cuerpo.", duracion: "45 min", precio: "60,00€", imagen: "https://eltemplobyzenestetic.es/wp-content/uploads/2025/12/NAGARE-COLD-BODY.png" },
      { id: 52, categoria: "NAGARE", titulo: "NAGARE DETOX", descripcion: "Un masaje manual que activa el sistema linfático, deshincha y purifica el cuerpo.", duracion: "60 min", precio: "75,00€", imagen: "https://eltemplobyzenestetic.es/wp-content/uploads/2025/12/NAGARE-DETOX.png" }
    ];

    let BELLEZA_DATA = [
      { id: 'b1', categoria: "CUIDADO DE MANOS", titulo: "RITUAL SHAMA MANOS", descripcion: "Manos que reflejan tu esencia, cuidadas con el alma en una experiencia de desconexión profunda.", duracion: "50 min", precio: "55,00€", imagen: "https://zenestetic.com/wp-content/uploads/2025/08/SHAMA-MANOS-1024x1024.png" },
      { id: 'b2', categoria: "CUIDADO DE MANOS", titulo: "BELLEZA SEMIPERMANENTE", descripcion: "Esmaltado de larga duración con productos de alta calidad para un acabado impecable y duradero.", duracion: "45 min", precio: "26,00€", imagen: "https://zenestetic.com/wp-content/uploads/2024/09/ESMALTADO-SEMIPERMANENTE-1024x1024.png" },
      { id: 'b3', categoria: "CUIDADO DE MANOS", titulo: "BELLEZA DE MANOS", descripcion: "Tratamiento completo de cuidado y embellecimiento de uñas y piel para lucir unas manos perfectas.", duracion: "30 min", precio: "18,00€", imagen: "https://zenestetic.com/wp-content/uploads/2024/09/BELLEZA-DE-MANOS-1024x1024.png" },
      { id: 'b4', categoria: "CUIDADO DE PIES", titulo: "RITUAL SHAMA PIES", descripcion: "Un viaje de ligereza. Reconecta con la tierra a través de un tratamiento profundo y relajante.", duracion: "60 min", precio: "65,00€", imagen: "https://zenestetic.com/wp-content/uploads/2025/08/SHAMA-PIES-1024x1024.png" },
      { id: 'b5', categoria: "CUIDADO DE PIES", titulo: "BELLEZA DE PIES", descripcion: "Cuidado básico y estético para que tus pies descansen, se regeneren y luzcan impecables.", duracion: "45 min", precio: "30,00€", imagen: "https://zenestetic.com/wp-content/uploads/2024/09/BELLEZA-DE-PIES-1-1024x1024.png" },
      { id: 'b6', categoria: "CUIDADO DE PIES", titulo: "BELLEZA SEMIPERMANENTE PIES", descripcion: "Durabilidad y brillo para tus pies con esmaltado semipermanente de máxima calidad.", duracion: "50 min", precio: "36,00€", imagen: "https://zenestetic.com/wp-content/uploads/2025/08/SEMIPERMANENTE-PIES-1024x1024.png" },
      { id: 'b7', categoria: "DEPILACIÓN", titulo: "DISEÑO DE CEJAS", descripcion: "Estudio de visajismo personalizado para realzar tu mirada de forma natural y equilibrada.", duracion: "20 min", precio: "15,00€", imagen: "https://zenestetic.com/wp-content/uploads/2025/08/PESTANAS-1024x1024.png" },
      { id: 'b8', categoria: "DEPILACIÓN", titulo: "LÁSER DIODO CUERPO COMPLETO", descripcion: "Tecnología avanzada para la eliminación progresiva del vello de forma segura y eficaz.", duracion: "60 min", precio: "150,00€", imagen: "https://zenestetic.com/wp-content/uploads/2025/08/LASER-1024x1024.png" },
      { id: 'b9', categoria: "BELLEZA & MIRADA", titulo: "LIFTING DE PESTAÑAS", descripcion: "Tratamiento para curvar y alargar tus propias pestañas de forma natural desde la raíz.", duracion: "45 min", precio: "45,00€", imagen: "https://zenestetic.com/wp-content/uploads/2025/08/PESTANAS-1024x1024.png" },
      // --- MICROPIGMENTACIÓN (REEMPLAZO GENÉRICO POR 9 ESPECIALIZADOS) ---
      { id: 'm1', categoria: "MICROPIGMENTACIÓN", titulo: "MICRO EYELINER", descripcion: "Intensifica tu mirada con un eyeliner permanente que realza la forma natural de tus ojos con trazos sutiles.", duracion: "90 min", precio: "250,00€", imagen: "https://zenestetic.com/wp-content/uploads/2025/07/OJOS-229x300.png" },
      { id: 'm2', categoria: "MICROPIGMENTACIÓN", titulo: "MICRO LABIOS", descripcion: "Realzamos la forma, el color y el volumen de tus labios, corrigiendo asimetrías con un acabado natural.", duracion: "120 min", precio: "400,00€", imagen: "https://zenestetic.com/wp-content/uploads/2025/07/LABIOS-229x300.png" },
      { id: 'm3', categoria: "MICROPIGMENTACIÓN", titulo: "MICRO CEJAS", descripcion: "Diseño natural y simétrico con un acabado hiperrealista que realza tu esencia.", duracion: "120 min", precio: "350,00€", imagen: "https://zenestetic.com/wp-content/uploads/2025/07/CEJAS-229x300.png" },
      { id: 'm4', categoria: "MICROPIGMENTACIÓN", titulo: "MICRO PECAS", descripcion: "Pecas creadas con delicadeza para aportar frescura y un toque juvenil único a tu rostro.", duracion: "45 min", precio: "250,00€", imagen: "https://zenestetic.com/wp-content/uploads/2025/07/PECAS-229x300.png" },
      { id: 'm5', categoria: "MICROPIGMENTACIÓN", titulo: "AREOLA SIMPLE", descripcion: "Reconstrucción oncológica de una sola areola con delicadeza para recuperar tu seguridad.", duracion: "90 min", precio: "250,00€", imagen: "https://zenestetic.com/wp-content/uploads/2025/07/AREOLA-SIMPLE-229x300.png" },
      { id: 'm6', categoria: "MICROPIGMENTACIÓN", titulo: "AREOLA DOBLE", descripcion: "Reconstrucción de ambas areolas para recuperar la imagen esencial de tu pecho.", duracion: "150 min", precio: "350,00€", imagen: "https://zenestetic.com/wp-content/uploads/2025/07/AREOLA-DOBLE-229x300.png" },
      { id: 'm7', categoria: "MICROPIGMENTACIÓN", titulo: "MICRO CAPILAR", descripcion: "Recupera la sensación de densidad capilar disimulando cicatrices o zonas despobladas.", duracion: "Consulta", precio: "Presupuesto", imagen: "https://zenestetic.com/wp-content/uploads/2025/07/CAPILAR-229x300.png" },
      { id: 'm8', categoria: "MICROPIGMENTACIÓN", titulo: "CORRECCIÓN TRABAJOS", descripcion: "Corregimos forma, color y técnica de experiencias previas no esperadas.", duracion: "Consulta", precio: "Presupuesto", imagen: "https://zenestetic.com/wp-content/uploads/2025/07/CORRECCIONES-229x300.png" },
      { id: 'm9', categoria: "MICROPIGMENTACIÓN", titulo: "CONSULTA PREVIA", descripcion: "Sesión esencial para pruebas de diseño, color y sensibilidad antes del tratamiento.", duracion: "30 min", precio: "50,00€", imagen: "https://zenestetic.com/wp-content/uploads/2025/07/CONSULTA-229x300.png" }
    ];

    let currentRitualType = 'templo'; // 'templo' o 'belleza'

    let TALLERES_DATA = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [
        {
            id: 'pilates-semanal',
            titulo: 'Pilates',
            fecha: 'L, M, X, J | Varios Horarios',
            descripcion: 'Método de entrenamiento físico y mental que combina fuerza muscular, control mental, respiración y relajación. Mejora la postura, la flexibilidad y fortalece el core.',
            qr: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://eltemplobyzenestetic.es/clases-pilates',
            hotspots: [
                { top: 31, left: 8, width: 17, height: 8 },
                { top: 22, left: 26.5, width: 17, height: 8 },
                { top: 31, left: 45, width: 17, height: 8 },
                { top: 22, left: 63.5, width: 17, height: 8 }
            ]
        },
        {
            id: 'entrenamiento-funcional',
            titulo: 'Entr. Funcional',
            fecha: 'L, M, J | Varios Horarios',
            descripcion: 'Circuito de ejercicios diseñados para trabajar grupos musculares de forma integral, mejorando la movilidad, resistencia y fuerza aplicada a la vida diaria.',
            qr: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://eltemplobyzenestetic.es/entrenamiento-funcional',
            hotspots: [
                { top: 22, left: 8, width: 17, height: 8 },
                { top: 31, left: 26.5, width: 17, height: 8 },
                { top: 31, left: 63.5, width: 17, height: 8 }
            ]
        },
        {
            id: 'gap-semanal',
            titulo: 'GAP',
            fecha: 'X, V | Varios Horarios',
            descripcion: 'Clase dirigida de tonificación específica para Glúteos, Abdominales y Piernas. Una sesión intensa y efectiva para fortalecer el tren inferior.',
            qr: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://eltemplobyzenestetic.es/clases-gap',
            hotspots: [
                { top: 22, left: 45, width: 17, height: 8 },
                { top: 31, left: 82, width: 17, height: 8 }
            ]
        },
        {
            id: 'yoga-restaurativo',
            titulo: 'Yoga Restaurativo',
            fecha: 'Lunes | 18:00 a 19:00',
            descripcion: 'Práctica suave de yoga centrada en la relajación profunda y la recuperación del cuerpo. Uso de apoyos para mantener posturas sin esfuerzo y calmar el sistema nervioso.',
            qr: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://eltemplobyzenestetic.es/yoga-restaurativo',
            hotspots: [{ top: 41, left: 8, width: 17, height: 8 }]
        },
        {
            id: 'yin-yoga-semanal',
            titulo: 'Yin Yoga',
            fecha: 'Lunes | 19:15 a 20:15',
            descripcion: 'Yoga meditativo de ritmo lento que trabaja los tejidos conectivos profundos. Posturas mantenidas durante varios minutos para fomentar la flexibilidad y la calma mental.',
            qr: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://eltemplobyzenestetic.es/yin-yoga',
            hotspots: [{ top: 50.5, left: 8, width: 17, height: 8 }]
        },
        {
            id: 'vinyasa-yoga',
            titulo: 'Vinyasa Yoga',
            fecha: 'Jueves | 19:30 a 20:30',
            descripcion: 'Estilo dinámico de yoga que fluye a través de la respiración sincronizada con el movimiento. Una meditación en movimiento que fortalece y flexibiliza.',
            qr: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://eltemplobyzenestetic.es/vinyasa-yoga',
            hotspots: [{ top: 50.5, left: 63.5, width: 17, height: 8 }]
        },
        {
            id: 'chikung-taichi',
            titulo: 'ChiKung TaiChi',
            fecha: 'Viernes | 11:00 a 12:00',
            descripcion: 'Arte milenario chino que combina movimientos suaves, respiración y concentración para equilibrar la energía vital y mejorar la salud general.',
            qr: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://eltemplobyzenestetic.es/chikung-taichi',
            hotspots: [{ top: 31, left: 82, width: 17, height: 8 }]
        },
        {
            id: 'pilates-candles',
            titulo: 'Pilates Candles',
            fecha: '07 Sábado | 10:00 a 11:00',
            descripcion: 'Una experiencia única que combina el control y la precisión del Pilates con la atmósfera relajante de la luz de las velas. Ideal para conectar con tu centro y mejorar la flexibilidad en un entorno de paz absoluta.',
            qr: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://eltemplobyzenestetic.es/inscripcion-pilates-candles',
            hotspots: [{ top: 62.5, left: 9.5, width: 23, height: 14 }]
        },
        {
            id: 'collage-intuitivo',
            titulo: 'Collage Intuitivo',
            fecha: '13 Viernes | 18:00 a 20:30',
            descripcion: 'Explora tu creatividad sin juicios. En este taller de arte-terapia, utilizaremos el collage para expresar emociones y descubrir mensajes de nuestro subconsciente a través de las imágenes y el color.',
            qr: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://eltemplobyzenestetic.es/inscripcion-collage',
            hotspots: [{ top: 62.5, left: 38.5, width: 23, height: 14 }]
        },
        {
            id: 'astrologia',
            titulo: 'Taller de Astrología',
            fecha: '21 Sábado | 10:00 a 12:30',
            descripcion: 'Descubre el lenguaje de las estrellas y cómo influyen en tu camino personal. Un taller introductorio para entender las bases de tu carta natal y los tránsitos planetarios actuales.',
            qr: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://eltemplobyzenestetic.es/inscripcion-astrologia',
            hotspots: [{ top: 62.5, left: 67, width: 23, height: 14 }]
        },
        {
            id: 'yin-yoga',
            titulo: 'Yin Yoga y Meditación con Cuencos',
            fecha: '27 Viernes | 19:00 a 20:30',
            descripcion: 'Una sesión profunda de estiramientos pasivos combinada con la vibración sanadora de los cuencos tibetanos. Una oportunidad para soltar tensiones acumuladas y entrar en un estado de calma profunda.',
            qr: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://eltemplobyzenestetic.es/inscripcion-yinyoga',
            hotspots: [{ top: 79.5, left: 24, width: 23, height: 14 }]
        },
        {
            id: 'alquimia-corazon',
            titulo: 'Alquimia del Corazón',
            fecha: '28 Sábado | 10:00 a 13:30',
            descripcion: 'Un taller dedicado a la apertura emocional y el auto-amor. A través de dinámicas de respiración, meditación y rituales, trabajaremos en la transformación de nuestras barreras internas.',
            qr: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://eltemplobyzenestetic.es/inscripcion-alquimia',
            hotspots: [{ top: 79.5, left: 53, width: 23, height: 14 }]
        }
    ];

    // Migración: Dividir actividades con múltiples hotspots en individuales
    let needsMigration = false;
    TALLERES_DATA.forEach(t => { if (t.hotspots && t.hotspots.length > 1) needsMigration = true; });
    if (needsMigration) {
        let migratedData = [];
        TALLERES_DATA.forEach(t => {
            if (t.hotspots && t.hotspots.length > 1) {
                t.hotspots.forEach((h, i) => {
                    migratedData.push({...t, id: `${t.id}_${i}_mig`, titulo: `${t.titulo} ${i + 1}`, hotspots: [h]});
                });
            } else { migratedData.push(t); }
        });
        TALLERES_DATA = migratedData;
        if(window.saveToCloud) window.saveToCloud('talleresData', TALLERES_DATA, STORAGE_KEY); else localStorage.setItem(STORAGE_KEY, JSON.stringify(TALLERES_DATA));
    }

    // --- DATOS CATÁLOGO TALLERES (Igual que Experiencias) ---
    const TALLERES_CATALOGO_KEY = 'templo_talleres_catalogo_v1';
    let MOCK_TALLERES_CATALOGO = JSON.parse(localStorage.getItem(TALLERES_CATALOGO_KEY)) || [
        { id: 1, titulo: 'Taller de Cerámica', descripcion: 'Conecta con la tierra y crea tus propias piezas en un entorno de paz.', precio: '45,00€', imagen: 'https://images.unsplash.com/photo-1565191999001-551c187427bb?q=80&w=800' },
        { id: 2, titulo: 'Meditación Sonora', descripcion: 'Viaje a través del sonido con cuencos y gongs para una relajación profunda.', precio: '30,00€', imagen: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800' },
        { id: 3, titulo: 'Escritura Creativa', descripcion: 'Libera tu voz interior y plasma tus ideas sobre el papel sin filtros.', precio: '25,00€', imagen: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=800' },
        { id: 4, titulo: 'Pintura Intuitiva', descripcion: 'Expresa tus emociones a través del color y el trazo libre.', precio: '35,00€', imagen: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=800' }
    ];

    let mediaList = [
        { type: 'image', url: "https://lh3.googleusercontent.com/aida-public/AB6AXuDq8A6YqPFNCdPUBGww4XHhzPafdmFhKy__WevTTTUU67ycggv8ZbdxnDw9FxwG4wTVmO33HLj1A0It-2Nv5cRkjJe3urzhD4Cd-22IqepIKhgiSFdFl3mkdW8O5ec3OMdd45eJoJq-a-AdIiR_eGtcEFUb1IuSS1n_o6of2nFJbZfa8YcVWBT5liDrnLOAIMhT-44nqedpKVfsMqJqJRvC15YjZh0kcBOwtJ8bB-SaiTbjp_ed2HDWGSgYQe8OZYY3kmVRCl8Sw5vM" }
    ];

    let bannerItems = [
        { url: "https://eltemplobyzenestetic.es/wp-content/uploads/2025/12/HOLISTIC-SHIRODHARA-819x1024.png", alt: "Oferta Bienvenida" },
        { url: "https://eltemplobyzenestetic.es/wp-content/uploads/2025/12/DUO-KITO-819x1024.png", alt: "Rituales de Temporada" }
    ];

    let currentBannerIndex = 0;
    let tempMediaList = [];
    let tabsProcessed = 0;
    let currentEditingId = null;
    let currentEditingRitualId = null;
    let inactivityTimer = null;
    let screensaverActive = false;
    let fallbackCycleInterval = null;
    let currentMediaIndex = 0;

    // --- CAPTURA DE ELEMENTOS DOM (Centralizado) ---
    const btnCitas = document.getElementById('btn-citas');
    const btnRituales = document.getElementById('btn-rituales');
    const btnTalleres = document.getElementById('btn-talleres');
    const btnClases = document.getElementById('btn-clases');
    const btnAsistencia = document.getElementById('btn-asistencia');
    
    const citasPanel = document.getElementById('citas-panel');
    const ritualesPanel = document.getElementById('rituales-panel');
    const talleresPanel = document.getElementById('talleres-panel');
    const clasesPanel = document.getElementById('clases-panel');
    const adminPanel = document.getElementById('admin-panel');
    const dniModal = document.getElementById('dni-modal');
    const pinModal = document.getElementById('pin-modal');
    const screensaver = document.getElementById('screensaver');
    const screensaverMedia = document.getElementById('screensaver-media');

    const btnVolverCitas = document.getElementById('btn-volver-citas');
    const btnVolverRituales = document.getElementById('btn-volver-rituales');
    const btnVolverTalleres = document.getElementById('btn-volver-talleres');
    const btnVolverClases = document.getElementById('btn-volver-clases');
    const btnInicioRituales = document.getElementById('btn-inicio-rituales');
    const btnInicioCitas = document.getElementById('btn-inicio-citas');
    const btnInicioTalleres = document.getElementById('btn-inicio-talleres');
    const btnInicioClases = document.getElementById('btn-inicio-clases');
    const btnLogoutAdmin = document.getElementById('btn-logout-admin');
    const btnLogoutAdminSidebar = document.getElementById('btn-logout-admin-sidebar');
    const btnExitApp = document.getElementById('btn-exit-app');
    const btnToggleFullscreen = document.getElementById('btn-toggle-fullscreen');
    const btnDeleteHotspot = document.getElementById('btn-delete-hotspot');
    const btnDeleteRitual = document.getElementById('btn-delete-ritual');
    const btnDeleteTallerItem = document.getElementById('btn-delete-taller-item');
    const btnSaveConfig = document.getElementById('btn-save-talleres-config');
    const btnSaveRitual = document.getElementById('btn-save-ritual');
    const btnDrawMode = document.getElementById('btn-draw-mode');

    const clockContainer = document.getElementById('clock-container');
    const dateDisplay = document.getElementById('date-display');
    const timeDisplay = document.getElementById('time-display');
    const drawingRect = document.getElementById('drawing-rect');
    const bannerSlider = document.getElementById('banner-slider');
    const bannerDotsContainer = document.getElementById('banner-dots-container');
    const ritualesListContainer = document.getElementById('rituales-list-container');
    const citasListContainer = document.getElementById('citas-list-container');
    const citasEmptyState = document.getElementById('citas-empty-state');
    const citasWelcomeText = document.getElementById('citas-welcome-text');
    const dniInput = document.getElementById('dni-input');
    const dniError = document.getElementById('dni-error');
    const btnSubmitDni = document.getElementById('btn-submit-dni');
    const btnCancelDni = document.getElementById('btn-cancel-dni');
    const pinDots = document.querySelectorAll('#pin-dots div');
    const pinNumBtns = document.querySelectorAll('.pin-num-btn');
    const btnPinClear = document.getElementById('btn-pin-clear');
    const btnPinCancelAlt = document.getElementById('btn-pin-cancel-alt');
    const pinError = document.getElementById('pin-error');
    const btnCancelPin = document.getElementById('btn-cancel-pin');
    const btnSaveQrs = document.getElementById('btn-save-qrs');
    const qrGridContainer = document.getElementById('qr-grid-container');

    // Elementos Catálogo Talleres
    const talleresItemsList = document.getElementById('talleres-items-list');
    const adminTalleresItemList = document.getElementById('admin-talleres-item-list');
    const btnSaveTallerItem = document.getElementById('btn-save-taller-item');
    const editTallerItemTitulo = document.getElementById('edit-taller-item-titulo');
    const editTallerItemDesc = document.getElementById('edit-taller-item-desc');
    const editTallerItemPrecio = document.getElementById('edit-taller-item-precio');
    const editTallerItemImagen = document.getElementById('edit-taller-item-imagen');
    const editTallerItemPreview = document.getElementById('edit-taller-item-preview');
    const tallerPreviewPlaceholder = document.getElementById('taller-preview-placeholder');

    let currentPinValue = '';
    const adminOverlay = document.getElementById('admin-visual-overlay');

    // --- MANEJADORES DE NAVEGACIÓN PRINCIPAL ---
    if (btnCitas) {
        btnCitas.addEventListener('click', () => {
            showPanel(citasPanel);
        });
    }

    if (btnRituales) {
        btnRituales.addEventListener('click', () => {
             // El catálogo de experiencias/rituales ya está cargado
             showPanel(ritualesPanel);
        });
    }

    if (btnTalleres) {
        btnTalleres.addEventListener('click', () => {
            showPanel(talleresPanel);
        });
    }

    if (btnClases) {
        btnClases.addEventListener('click', () => {
            showPanel(clasesPanel);
        });
    }
    
    // ==========================================
    // Lógica Banner de Ofertas
    // ==========================================
    // ==========================================
    // Lógica Banner de Ofertas (Sincronizado con Google Sheets)
    // ==========================================
    function rotateBanner() {
        if (!bannerSlider || bannerItems.length <= 1) return;
        
        currentBannerIndex = (currentBannerIndex + 1) % bannerItems.length;
        bannerSlider.style.transform = `translateX(-${currentBannerIndex * 100}%)`;
        
        // Actualizar puntos
        const dots = document.querySelectorAll('.banner-dot');
        dots.forEach((dot, i) => {
            if (i === currentBannerIndex) {
                dot.classList.add('active', 'bg-primary', 'w-6');
                dot.classList.remove('bg-white/50');
            } else {
                dot.classList.remove('active', 'bg-primary', 'w-6');
                dot.classList.add('bg-white/50');
            }
        });
    }

    // Intervalo para el banner
    let bannerInterval = setInterval(rotateBanner, 10000);

    const renderBanners = () => {
        if (!bannerSlider || !bannerDotsContainer) return;
        
        bannerSlider.innerHTML = bannerItems.map(item => `
            <div class="min-w-full h-full relative">
                <img src="${item.url}" alt="${item.alt}" class="w-full h-full object-cover">
            </div>
        `).join('');

        // Crear puntos (dots)
        bannerDotsContainer.innerHTML = bannerItems.map((_, i) => `
            <div class="banner-dot size-2 rounded-full transition-all duration-300 ${i === 0 ? 'active bg-primary w-6' : 'bg-white/50'}"></div>
        `).join('');

        // Reiniciar el índice y la posición
        currentBannerIndex = 0;
        bannerSlider.style.transform = 'translateX(0)';
    };

    // Render inicial de banners
    renderBanners();

    // Handler para respuesta de Banners de Google Sheets
    window.handleBannersResponse = function(response) {
        try {
            if (response && response.table && response.table.rows) {
                const newList = response.table.rows.map(row => {
                    if (!row.c || !row.c[0] || !row.c[0].v) return null;
                    const rawUrl = row.c[0].v.trim();
                    
                    let finalUrl = rawUrl;
                    if (rawUrl.includes('drive.google.com')) {
                        const fileId = getDriveFileId(rawUrl);
                        if (fileId) finalUrl = `https://lh3.googleusercontent.com/d/${fileId}`;
                    } else if (!rawUrl.startsWith('http')) {
                        return null; // Ignorar si no es URL ni Drive
                    }
                    
                    return { url: finalUrl, alt: row.c[1] ? row.c[1].v : "Oferta" };
                }).filter(item => item !== null);

                if (newList.length > 0) {
                    bannerItems = newList;
                    renderBanners();
                    console.log("Banners sincronizados:", bannerItems.length);
                }
            }
        } catch (e) {
            console.error("Error procesando banners:", e);
        }
    };

    function renderHomeQRs() {
        const iosImg = document.getElementById('home-qr-ios-img');
        const androidImg = document.getElementById('home-qr-android-img');
        const iosInput = document.getElementById('edit-home-qr-ios');
        const androidInput = document.getElementById('edit-home-qr-android');

        if (iosImg) iosImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(HOME_QR_DATA.ios)}`;
        if (androidImg) androidImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(HOME_QR_DATA.android)}`;
        
        if (iosInput) iosInput.value = HOME_QR_DATA.ios;
        if (androidInput) androidInput.value = HOME_QR_DATA.android;
    }

    // Render inicial de QRs de inicio
    renderHomeQRs();

    async function syncBannersFromSheet() {
        const BANNER_GID = "0"; // GID para la pestaña Banner
        document.querySelectorAll('.banner-sync-script').forEach(s => s.remove());
        const script = document.createElement('script');
        script.className = 'banner-sync-script';
        script.src = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json;responseHandler:handleBannersResponse&gid=${BANNER_GID}&tq=select%20A,B`;
        document.body.appendChild(script);
    }

    // --- LÓGICA DE HORARIOS / AGENDA ---
    function renderScheduleImage() {
        const scheduleImg = document.getElementById('schedule-img');
        const adminScheduleImg = document.getElementById('admin-schedule-img');
        const scheduleInput = document.getElementById('edit-schedule-img-url');
        
        const imageUrl = getDirectImgLink(SCHEDULE_IMG_URL);
        
        if (scheduleImg) scheduleImg.src = imageUrl;
        if (adminScheduleImg) adminScheduleImg.src = imageUrl;
        if (scheduleInput && !scheduleInput.value) scheduleInput.value = SCHEDULE_IMG_URL;
    }

    // Render inicial
    renderScheduleImage();

    const btnSaveScheduleImg = document.getElementById('btn-save-schedule-img');
    if (btnSaveScheduleImg) {
        btnSaveScheduleImg.addEventListener('click', () => {
            const input = document.getElementById('edit-schedule-img-url');
            const newUrlRaw = input?.value.trim() || '';
            const newUrlConverted = getDirectImgLink(newUrlRaw);

            if (newUrlConverted) {
                SCHEDULE_IMG_URL = newUrlConverted;
                localStorage.setItem(SCHEDULE_IMG_STORAGE_KEY, SCHEDULE_IMG_URL);
                if (window.saveToCloud) window.saveToCloud('scheduleImg', SCHEDULE_IMG_URL, SCHEDULE_IMG_STORAGE_KEY);
                renderScheduleImage();
                if (input) input.value = SCHEDULE_IMG_URL;
                showToast('Imagen de horario actualizada');
            }
        });
    }

    // Listener para previsualización inmediata de la imagen de agenda en el editor
    const scheduleImgInput = document.getElementById('edit-schedule-img-url');
    if (scheduleImgInput) {
        scheduleImgInput.addEventListener('input', (e) => {
            const adminImg = document.getElementById('admin-schedule-img');
            if (adminImg) {
                adminImg.src = getDirectImgLink(e.target.value);
            }
        });
    }



    // --- DATOS DE RITUALES (Persistentes) ---
    // (Ahora definidos al inicio del script)



    function showRitualesPanel() {
        showPanel(ritualesPanel);
    }

    function hideRitualesPanel() {
        hidePanel(ritualesPanel);
    }

    if (btnRituales) btnRituales.addEventListener('click', showRitualesPanel);
    if (btnVolverRituales) btnVolverRituales.addEventListener('click', hideRitualesPanel);
    if (btnInicioRituales) btnInicioRituales.addEventListener('click', hideRitualesPanel);

    // ==========================================
    // Lógica Panel Citas / Únete
    // ==========================================
    function showCitasPanel() {
        showPanel(citasPanel);
    }

    function hideCitasPanel() {
        hidePanel(citasPanel);
    }

    if (btnVolverCitas) btnVolverCitas.addEventListener('click', hideCitasPanel);
    if (btnInicioCitas) btnInicioCitas.addEventListener('click', hideCitasPanel);

    // ==========================================
    // Lógica Talleres y Clases
    // ==========================================
    // --- PERSISTENCIA Y CARGA DE DATOS ---

    // (Ahora definidos al inicio del script)



    // (Ya declarado al inicio)
    // currentEditingId = null;


    function renderTalleres() {
        const hotspotContainer = document.getElementById('talleres-hotspots-overlay');
        
        // --- VISTA PÚBLICA ---
        if (hotspotContainer) {
            hotspotContainer.innerHTML = '';
            TALLERES_DATA.forEach(taller => {
                if (taller.hotspots) {
                    taller.hotspots.forEach(pos => {
                        const spot = document.createElement('button');
                        spot.className = 'absolute z-10 hover:bg-primary/20 hover:border-2 border-primary/50 transition-all rounded-lg cursor-pointer group';
                        spot.style.top = `${pos.top}%`;
                        spot.style.left = `${pos.left}%`;
                        spot.style.width = `${pos.width}%`;
                        spot.style.height = `${pos.height}%`;
                        
                        spot.innerHTML = `<div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur-sm text-white text-[9px] px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap uppercase tracking-widest font-bold z-50">${taller.titulo}</div>`;

                        spot.onclick = (e) => {
                            e.stopPropagation();
                            window.seleccionarTaller(taller.id);
                        };
                        hotspotContainer.appendChild(spot);
                    });
                }
            });
        }

        // --- LÓGICA DEL EDITOR EN PANEL ADMIN ---
        const adminOverlayInstance = document.getElementById('admin-visual-overlay');
        if (adminOverlayInstance) {
            // En el editor, solo actualizamos el contenido si no hay una operación activa que requiera el DOM intacto
            // Pero para simplificar, redibujamos solo si no estamos arrastrando/redimensionando
            if (!isDragging && !isResizing) {
                adminOverlayInstance.innerHTML = '';
                TALLERES_DATA.forEach(taller => {
                    if (taller.hotspots) {
                        taller.hotspots.forEach(pos => {
                            const spot = document.createElement('div');
                            const isSelected = currentEditingId === taller.id;
                            
                            spot.className = `absolute z-10 border-2 transition-all ${isSelected ? 'border-primary bg-primary/20 ring-2 ring-primary/30' : 'border-slate-400/50 bg-slate-500/10'} hover:border-primary cursor-move`;
                            spot.style.top = `${pos.top}%`;
                            spot.style.left = `${pos.left}%`;
                            spot.style.width = `${pos.width}%`;
                            spot.style.height = `${pos.height}%`;
                            spot.setAttribute('data-id', taller.id);
                            
                            spot.innerHTML = `
                                <div class="pointer-events-none absolute -top-6 left-0 bg-white shadow-sm border border-slate-200 px-2 py-0.5 rounded text-[9px] font-bold text-slate-700 whitespace-nowrap">
                                    ${taller.titulo || 'Sin título'}
                                </div>
                                ${isSelected ? '<div class="absolute -bottom-1 -right-1 size-3 bg-primary rounded-full border-2 border-white cursor-nwse-resize shadow-md" data-resize="true"></div>' : ''}
                            `;
                            
                            spot.onpointerdown = (e) => {
                                e.stopPropagation();
                                if (e.target.dataset.resize) {
                                    startResizing(e, taller.id);
                                } else {
                                    // Seleccionar sin redibujar TODO el overlay inmediatamente si es posible
                                    currentEditingId = taller.id;
                                    window.cargarTallerEnEditor(taller.id);
                                    startDragging(e, taller.id);
                                    
                                    // Actualizar visualmente la selección sin borrar el DOM
                                    document.querySelectorAll('#admin-visual-overlay > div').forEach(el => {
                                        const elId = el.getAttribute('data-id');
                                        if (elId === taller.id) {
                                            el.classList.add('border-primary', 'bg-primary/20', 'ring-2', 'ring-primary/30');
                                            el.classList.remove('border-slate-400/50', 'bg-slate-500/10');
                                        } else {
                                            el.classList.remove('border-primary', 'bg-primary/20', 'ring-2', 'ring-primary/30');
                                            el.classList.add('border-slate-400/50', 'bg-slate-500/10');
                                        }
                                    });
                                }
                            };
                            
                            adminOverlayInstance.appendChild(spot);
                        });
                    }
                });
            } else {
                // Si estamos arrastrando/redimensionando, solo actualizamos la posición del elemento actual
                const activeEl = adminOverlayInstance.querySelector(`[data-id="${currentHotspotId}"]`);
                if (activeEl) {
                    const taller = TALLERES_DATA.find(t => t.id === currentHotspotId);
                    if (taller && taller.hotspots) {
                        const h = taller.hotspots[0];
                        activeEl.style.top = `${h.top}%`;
                        activeEl.style.left = `${h.left}%`;
                        activeEl.style.width = `${h.width}%`;
                        activeEl.style.height = `${h.height}%`;
                    }
                }
            }
        }
    }

    // --- MOTOR CAD (DIBUJO Y MANIPULACIÓN) ---
    let isDrawing = false;
    let isDragging = false;
    let isResizing = false;
    let startX, startY;
    let currentHotspotId = null; // Restaurado
    let drawModeActive = false;

    // Usar la referencia global ya definida o capturarla aquí una vez

    // (Ya capturado al inicio)


    if (btnDrawMode) {
        btnDrawMode.addEventListener('click', () => {
            drawModeActive = !drawModeActive;
            btnDrawMode.classList.toggle('bg-primary', drawModeActive);
            btnDrawMode.classList.toggle('bg-slate-700', !drawModeActive);
            const adminOverlay = document.getElementById('admin-visual-overlay');
            if (adminOverlay) adminOverlay.style.cursor = drawModeActive ? 'crosshair' : 'default';
        });
    }

    function getCoords(e) {
        if (!adminOverlay) return { x: 0, y: 0 };
        const rect = adminOverlay.getBoundingClientRect();
        return {
            x: ((e.clientX - rect.left) / rect.width) * 100,
            y: ((e.clientY - rect.top) / rect.height) * 100
        };
    }

    if (adminOverlay) {
        adminOverlay.addEventListener('pointerdown', (e) => {
            if (drawModeActive && e.target === adminOverlay) {
                isDrawing = true;
                const coords = getCoords(e);
                startX = coords.x;
                startY = coords.y;
                drawingRect.style.left = `${startX}%`;
                drawingRect.style.top = `${startY}%`;
                drawingRect.style.width = '0%';
                drawingRect.style.height = '0%';
                drawingRect.classList.remove('hidden');
            }
        });

        window.addEventListener('pointermove', (e) => {
            if (!adminOverlay || (!isDrawing && !isDragging && !isResizing)) return;
            const coords = getCoords(e);
            
            if (isDrawing) {
                const width = Math.abs(coords.x - startX);
                const height = Math.abs(coords.y - startY);
                drawingRect.style.left = `${Math.min(coords.x, startX)}%`;
                drawingRect.style.top = `${Math.min(coords.y, startY)}%`;
                drawingRect.style.width = `${width}%`;
                drawingRect.style.height = `${height}%`;
            } else if (isDragging && currentHotspotId) {
                const index = TALLERES_DATA.findIndex(t => t.id === currentHotspotId);
                if (index === -1) return;
                const dx = coords.x - startX;
                const dy = coords.y - startY;
                
                TALLERES_DATA[index].hotspots[0].left += dx;
                TALLERES_DATA[index].hotspots[0].top += dy;
                
                startX = coords.x;
                startY = coords.y;
                syncFormWithData(TALLERES_DATA[index]);
                renderTalleres();
            } else if (isResizing && currentHotspotId) {
                const index = TALLERES_DATA.findIndex(t => t.id === currentHotspotId);
                if (index === -1) return;
                const h = TALLERES_DATA[index].hotspots[0];
                h.width = Math.max(2, coords.x - h.left);
                h.height = Math.max(2, coords.y - h.top);
                syncFormWithData(TALLERES_DATA[index]);
                renderTalleres();
            }
        });

        window.addEventListener('pointerup', () => {
            if (isDrawing) {
                isDrawing = false;
                drawingRect.classList.add('hidden');
                
                const newTaller = {
                    id: 'taller_' + Date.now(),
                    titulo: 'Nueva Actividad',
                    fecha: 'Por definir',
                    descripcion: 'Descripción de la actividad...',
                    qr: 'https://alcar-it.com/',
                    hotspots: [{
                        top: parseFloat(drawingRect.style.top),
                        left: parseFloat(drawingRect.style.left),
                        width: parseFloat(drawingRect.style.width),
                        height: parseFloat(drawingRect.style.height)
                    }]
                };
                
                TALLERES_DATA.push(newTaller);
                drawModeActive = false;
                btnDrawMode.classList.remove('bg-primary');
                btnDrawMode.classList.add('bg-slate-700');
                adminOverlay.style.cursor = 'default';
                
                window.cargarTallerEnEditor(newTaller.id);
            }
            isDragging = false;
            isResizing = false;
        });
    }

    function startDragging(e, id) {
        if (drawModeActive) return;
        isDragging = true;
        currentHotspotId = id;
        const coords = getCoords(e);
        startX = coords.x;
        startY = coords.y;
    }

    function startResizing(e, id) {
        isResizing = true;
        currentHotspotId = id;
    }

    function syncFormWithData(taller) {
        const tituloI = document.getElementById('edit-taller-titulo');
        const fechaI = document.getElementById('edit-taller-fecha');
        const descI = document.getElementById('edit-taller-desc');
        const qrI = document.getElementById('edit-taller-qr');
        
        if (tituloI) tituloI.value = taller.titulo;
        if (fechaI) fechaI.value = taller.fecha;
        if (descI) descI.value = taller.descripcion;
        if (qrI) qrI.value = taller.qr;
        
        if (taller.hotspots && taller.hotspots.length > 0) {
            const h = taller.hotspots[0];
            const topI = document.getElementById('edit-taller-top');
            const leftI = document.getElementById('edit-taller-left');
            const widthI = document.getElementById('edit-taller-width');
            const heightI = document.getElementById('edit-taller-height');
            
            if (topI) topI.value = h.top.toFixed(1);
            if (leftI) leftI.value = h.left.toFixed(1);
            if (widthI) widthI.value = h.width.toFixed(1);
            if (heightI) heightI.value = h.height.toFixed(1);
        }
    }

    window.cargarTallerEnEditor = function(id) {
        const taller = TALLERES_DATA.find(t => t.id === id);
        if (!taller) return;

        currentEditingId = id;
        console.log("Cargando en editor:", id);

        // Mostrar botón borrar
        if (btnDeleteHotspot) {
            btnDeleteHotspot.classList.remove('hidden');
        }

        // Habilitar y rellenar formulario
        const form = document.getElementById('admin-taller-form');
        if (form) form.classList.remove('opacity-50', 'pointer-events-none');
        
        const label = document.getElementById('edit-taller-title-label');
        if (label) label.textContent = `PROPIEDADES: ${taller.titulo}`;
        
        syncFormWithData(taller);
        renderTalleres();
    };

    if (btnDeleteHotspot) {
        btnDeleteHotspot.addEventListener('click', (e) => {
            e.preventDefault();
            if (!currentEditingId) return;
            
            if (confirm('¿Seguro que quieres eliminar esta actividad completa y todos sus puntos interactivos?')) {
                TALLERES_DATA = TALLERES_DATA.filter(t => t.id !== currentEditingId);
                console.log("Actividad eliminada:", currentEditingId);
                currentEditingId = null;
                
                // Guardar en Storage inmediatamente al borrar
                if(window.saveToCloud) window.saveToCloud('talleresData', TALLERES_DATA, STORAGE_KEY); else localStorage.setItem(STORAGE_KEY, JSON.stringify(TALLERES_DATA));
                
                renderTalleres();
                const form = document.getElementById('admin-taller-form');
                if (form) form.classList.add('opacity-50', 'pointer-events-none');
                btnDeleteHotspot.classList.add('hidden');
                showToast('Actividad eliminada');
            }
        });
    }

    // Vinculación bidireccional Formulario -> Visual
    ['titulo', 'fecha', 'desc', 'qr', 'top', 'left', 'width', 'height'].forEach(key => {
        const input = document.getElementById(`edit-taller-${key}`);
        if (input) {
            input.addEventListener('input', () => {
                if (!currentEditingId) return;
                const index = TALLERES_DATA.findIndex(t => t.id === currentEditingId);
                if (index === -1) return;

                const val = input.value;
                if (key === 'titulo') TALLERES_DATA[index].titulo = val;
                else if (key === 'fecha') TALLERES_DATA[index].fecha = val;
                else if (key === 'desc') TALLERES_DATA[index].descripcion = val;
                else if (key === 'qr') TALLERES_DATA[index].qr = getDirectImgLink(val);
                else {
                    const numVal = parseFloat(val) || 0;
                    if (key === 'top') TALLERES_DATA[index].hotspots[0].top = numVal;
                    if (key === 'left') TALLERES_DATA[index].hotspots[0].left = numVal;
                    if (key === 'width') TALLERES_DATA[index].hotspots[0].width = numVal;
                    if (key === 'height') TALLERES_DATA[index].hotspots[0].height = numVal;
                }
                renderTalleres();
            });
        }
    });


    // Listener para el botón de guardar

    // (Ya capturado al inicio)

    if (btnSaveConfig) {
        btnSaveConfig.addEventListener('click', () => {
            // 1. Guardar la imagen del horario (Agenda) si ha cambiado
            const scheduleInput = document.getElementById('edit-schedule-img-url');
            const newUrlRaw = scheduleInput?.value.trim() || '';
            const newUrlConverted = getDirectImgLink(newUrlRaw);

            if (newUrlConverted && newUrlConverted !== SCHEDULE_IMG_URL) {
                SCHEDULE_IMG_URL = newUrlConverted;
                localStorage.setItem(SCHEDULE_IMG_STORAGE_KEY, SCHEDULE_IMG_URL);
                if (window.saveToCloud) {
                    window.saveToCloud('scheduleImg', SCHEDULE_IMG_URL, SCHEDULE_IMG_STORAGE_KEY);
                }
                renderScheduleImage();
                if (scheduleInput) scheduleInput.value = SCHEDULE_IMG_URL;
            }

            // 2. Guardar hotspots de la actividad seleccionada
            if (currentEditingId) {
                const index = TALLERES_DATA.findIndex(t => t.id === currentEditingId);
                if (index !== -1) {
                    // Actualizar datos
                    TALLERES_DATA[index].titulo = document.getElementById('edit-taller-titulo').value;
                    TALLERES_DATA[index].fecha = document.getElementById('edit-taller-fecha').value;
                    TALLERES_DATA[index].descripcion = document.getElementById('edit-taller-desc').value;
                    TALLERES_DATA[index].qr = getDirectImgLink(document.getElementById('edit-taller-qr').value);

                    const topVal = parseFloat(document.getElementById('edit-taller-top').value);
                    const leftVal = parseFloat(document.getElementById('edit-taller-left').value);
                    const widthVal = parseFloat(document.getElementById('edit-taller-width').value);
                    const heightVal = parseFloat(document.getElementById('edit-taller-height').value);

                    if (TALLERES_DATA[index].hotspots) {
                        TALLERES_DATA[index].hotspots[0] = { top: topVal, left: leftVal, width: widthVal, height: heightVal };
                    }

                    // Guardar en Storage
                    if(window.saveToCloud) window.saveToCloud('talleresData', TALLERES_DATA, STORAGE_KEY); else localStorage.setItem(STORAGE_KEY, JSON.stringify(TALLERES_DATA));
                    renderTalleres(); // Actualizar previsualización y lista admin
                }
            }
            
            showToast('Configuración guardada correctamente');
        });
    }

    window.seleccionarTaller = function(id) {
        const taller = TALLERES_DATA.find(t => t.id === id);
        if (!taller) return;

        // Actualizar UI de botones
        document.querySelectorAll('.taller-btn').forEach(btn => {
            btn.classList.remove('border-primary', 'bg-primary/5', 'shadow-md');
            btn.classList.add('bg-white', 'border-sand');
        });
        const activeBtn = document.getElementById(`btn-taller-${id}`);
        if (activeBtn) {
            activeBtn.classList.remove('bg-white', 'border-sand');
            activeBtn.classList.add('border-primary', 'bg-primary/5', 'shadow-md');
        }

        // Determinar el origen del QR (Imagen vs Link a Generar)
        const qrRaw = (taller.qr || '').trim();
        let qrSrc = getDirectImgLink(qrRaw);
        
        // Si no es un enlace directo de imagen (Drive/Dropbox) y parece una URL, generamos el QR
        const isImageUrl = qrRaw.match(/\.(jpeg|jpg|gif|png|webp|svg)/i);
        const isDriveOrDropbox = qrRaw.includes('drive.google.com') || qrRaw.includes('dropbox.com') || qrRaw.includes('lh3.googleusercontent.com');

        if (qrRaw && !isImageUrl && !isDriveOrDropbox && qrRaw.startsWith('http')) {
            qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrRaw)}`;
        }

        // Actualizar Panel de Detalles
        const detailContainer = document.getElementById('taller-detalle-content');
        if (detailContainer) {
            detailContainer.classList.add('opacity-0');
            setTimeout(() => {
                detailContainer.innerHTML = `
                    <div class="animate-fade-in w-full">
                        <div class="flex flex-col items-center text-center mb-4">
                            <div class="size-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                                <span class="material-symbols-outlined text-primary text-2xl">event_available</span>
                            </div>
                            <h3 class="text-xl font-serif font-bold text-slate-800 mb-1 leading-tight">${taller.titulo}</h3>
                            <span class="px-3 py-0.5 bg-sand text-zen-gray text-[10px] font-bold rounded-full uppercase tracking-widest">${taller.fecha}</span>
                        </div>
                        
                        <div class="bg-slate-50 rounded-xl p-4 mb-4 border border-sand/30 w-full">
                            <p class="text-slate-600 leading-snug text-base italic serif-text">"${taller.descripcion}"</p>
                        </div>

                        <div class="flex flex-col items-center p-5 bg-white border border-sand rounded-xl shadow-sm w-full">
                            <h4 class="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Escanea para Inscribirte</h4>
                            <div class="p-3 bg-white border border-sand rounded-lg shadow-inner mb-2">
                                <img src="${qrSrc}" alt="QR Inscripción" class="size-32 md:size-36 object-contain">
                            </div>
                            <p class="text-[9px] text-zen-gray/60 uppercase font-medium">Inscripción segura vía web</p>
                        </div>
                    </div>
                `;
                detailContainer.classList.remove('opacity-0');
            }, 300);
        }
    };

    function showPanel(panel) {
        if (!panel) return;
        document.body.classList.add('no-scroll');
        
        // Preparar para animación
        panel.classList.remove('hidden-transition');
        
        if (panel.id === 'talleres-panel') renderTalleres();
        if (panel.id === 'rituales-panel') renderRituales();
        
        // Delay para activar transición
        setTimeout(() => {
            panel.classList.add('panel-active');
        }, 10);
        
        panel.scrollTo(0, 0);
        setTimeout(() => panel.focus(), 600);
    }

    function hidePanel(panel) {
        if (!panel) return;
        panel.classList.remove('panel-active');
        
        setTimeout(() => {
            panel.classList.add('hidden-transition');
            // Solo quitar no-scroll si no hay otros paneles/modales activos
            if (!document.querySelector('.panel-active')) {
                document.body.classList.remove('no-scroll');
            }
        }, 600);
    }

    // Listeners para abrir paneles (YA INCLUIDOS ARRIBA)

    if (btnVolverTalleres) btnVolverTalleres.addEventListener('click', () => {
        hidePanel(talleresPanel);
        // Resetear detalle al cerrar
        const detailContent = document.getElementById('taller-detalle-content');
        if (detailContent) {
            detailContent.innerHTML = `
                <div class="flex flex-col items-center text-center py-12">
                    <div class="size-20 bg-primary/5 rounded-full flex items-center justify-center mb-6 animate-bounce">
                        <span class="material-symbols-outlined text-primary text-4xl">touch_app</span>
                    </div>
                    <h3 class="text-xl font-serif font-bold text-slate-800 mb-4 uppercase tracking-widest">Información de Actividad</h3>
                    <p class="text-zen-gray italic serif-text leading-relaxed px-4">"Tu cuerpo es tu templo, cuídalo. Toca cualquier actividad para ver los detalles e inscribirte."</p>
                </div>
            `;
        }
    });

    if (btnVolverClases) btnVolverClases.addEventListener('click', () => hidePanel(clasesPanel));

    // Botones de inicio globales (si existen)
    document.querySelectorAll('.btn-inicio-global').forEach(btn => {
        btn.addEventListener('click', () => {
            document.body.classList.remove('no-scroll');
            hidePanel(talleresPanel);
            hidePanel(clasesPanel);
            hideRitualesPanel();
            hideCitasPanel();
        });
    });

    // --- LÓGICA DETALLE RITUALES (MODAL) ---
    window.openRitualDetail = function(id) {
        const data = (currentRitualType === 'templo') ? MOCK_RITUALES : BELLEZA_DATA;
        const ritual = data.find(r => r.id == id);
        if (!ritual) return;

        const modal = document.getElementById('ritual-detail-modal');
        const img = document.getElementById('ritual-modal-img');
        const titulo = document.getElementById('ritual-modal-titulo');
        const cat = document.getElementById('ritual-modal-categoria');
        const dur = document.getElementById('ritual-modal-duracion');
        const prec = document.getElementById('ritual-modal-precio');
        const desc = document.getElementById('ritual-modal-descripcion');
        const qr = document.getElementById('ritual-modal-qr');

        if (!modal || !img || !titulo || !cat || !dur || !prec || !desc || !qr) return;

        // Limpiar para animación
        img.src = '';
        qr.src = '';

        // Cargar Datos
        img.src = getDirectImgLink(ritual.image || ritual.imagen);
        titulo.textContent = ritual.titulo;
        cat.textContent = ritual.categoria;
        dur.textContent = ritual.fecha || ritual.duracion;
        prec.textContent = ritual.precio;
        desc.textContent = ritual.descripcion;

        // Generar URL de compra (Slug dinámico basado en título)
        // Ejemplo: "Holistic Abhyanga" -> "holistic-abhyanga"
        const slug = ritual.titulo
            .toLowerCase()
            .trim()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Quitar acentos
            .replace(/&/g, 'y')
            .replace(/[^\w\s-]/g, '') // Quitar caracteres raros
            .replace(/\s+/g, '-') // Espacios a guiones
            .replace(/-+/g, '-'); // Quitar guiones duplicados
        
        const purchaseUrl = `https://eltemplobyzenestetic.es/producto/${slug}/`;
        qr.src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(purchaseUrl)}`;

        modal.classList.remove('hidden');
        document.body.classList.add('no-scroll');
    };

    window.closeRitualDetail = function() {
        const modal = document.getElementById('ritual-detail-modal');
        if (modal) modal.classList.add('hidden');
        if (!document.querySelector('.panel-active')) {
            document.body.classList.remove('no-scroll');
        }
    };

    const btnCerrarRitualModal = document.getElementById('btn-cerrar-ritual-modal');
    if (btnCerrarRitualModal) btnCerrarRitualModal.onclick = window.closeRitualDetail;

    function renderRituales() {
        if (!ritualesListContainer) return;
        ritualesListContainer.innerHTML = '';
        
        const data = (currentRitualType === 'templo') ? MOCK_RITUALES : BELLEZA_DATA;
        const panel = document.getElementById('rituales-panel');
        
        // Mantener siempre el tema oscuro original de El Templo
        if (panel) {
            panel.classList.remove('theme-belleza');
        }

        const categoriasArr = [...new Set(data.map(r => r.categoria))];
        
        categoriasArr.forEach((cat, index) => {
            const ritualesCategoria = data.filter(r => r.categoria === cat);
            
            // Determinar banner de categoría
            let bannerImg = '';
            if (currentRitualType === 'templo') {
                bannerImg = CATEGORY_BANNERS[cat] || 'https://eltemplobyzenestetic.es/wp-content/uploads/2023/11/MASAJES-AYURVEDA-ALICANTE-4.webp';
            } else {
                // Banner genérico o específico para belleza
            const bellezaBanners = {
                "CUIDADO DE MANOS": "https://zenestetic.com/wp-content/uploads/2025/08/CUIDADO-DE-MANOS-1024x576.png",
                "CUIDADO DE PIES": "https://zenestetic.com/wp-content/uploads/2025/08/CUIDADO-DE-PIES-1024x576.png",
                "DEPILACIÓN": "https://zenestetic.com/wp-content/uploads/2025/08/DEPILACION-1024x576.png",
                "BELLEZA & MIRADA": "https://zenestetic.com/wp-content/uploads/2025/08/PESTANAS-1024x1024.png",
                "MICROPIGMENTACIÓN": "https://zenestetic.com/wp-content/uploads/2025/07/18-1024x576.png"
            };
            bannerImg = bellezaBanners[cat] || 'https://zenestetic.com/wp-content/uploads/2025/08/BELLEZA-1024x576.png';
            }
            
            const tarjetasHTML = ritualesCategoria.map(ritual => `
                <div onclick="window.openRitualDetail('${ritual.id}')" class="ritual-card bg-[#F2E5D6] border border-[#39280F]/10 flex flex-col rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group h-full cursor-pointer">
                    <div class="h-48 md:h-56 w-full relative overflow-hidden bg-[#E4D7C5]/30">
                        <div class="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700" style="background-image: url('${getDirectImgLink(ritual.image || ritual.imagen)}')"></div>
                        <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center">
                            <span class="material-symbols-outlined text-white opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all text-4xl">add_circle</span>
                        </div>
                    </div>
                    <div class="p-6 md:p-8 flex flex-col flex-grow ritual-card-body">
                        <h3 class="font-serif text-xl md:text-2xl font-bold text-[#39280F] mb-2 ritual-card-title">${ritual.titulo}</h3>
                        <p class="text-[#39280F]/60 text-sm md:text-base leading-relaxed mb-6 flex-grow line-clamp-3 ritual-card-desc">${ritual.descripcion}</p>
                        
                        <div class="flex items-center justify-between border-t border-[#39280F]/5 pt-4 mt-auto ritual-card-footer">
                            <div class="flex flex-col">
                                <span class="text-xs font-bold text-[#39280F]/40 uppercase tracking-widest ritual-label">Duración</span>
                                <span class="text-[#39280F]/80 font-medium whitespace-nowrap ritual-value"><span class="material-symbols-outlined text-[16px] align-text-bottom mr-1 text-[#39280F]/30">${ritual.fecha ? "calendar_today" : "schedule"}</span>${ritual.fecha || ritual.duracion}</span>
                            </div>
                            <div class="flex flex-col text-right">
                                <span class="text-xs font-bold text-[#39280F]/40 uppercase tracking-widest ritual-label">Precio</span>
                                <span class="text-[#39280F] font-bold text-lg">${ritual.precio}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');
            
            const itemHTML = `
                <div class="w-full flex flex-col category-section" data-category="${cat}">
                    <!-- Cabecera Categoría (Botón Acordeón) -->
                    <div class="category-header flex items-center px-6 md:px-10 group" onclick="toggleAccordion('${cat}')">
                        <div class="category-banner" style="background-image: ${bannerImg ? `url('${bannerImg}')` : 'none'}"></div>
                        <div class="relative z-10 flex items-center justify-between w-full">
                            <div class="flex flex-col">
                                <span class="text-white/70 text-xs md:text-sm font-bold uppercase tracking-[0.3em] mb-1 category-pretitle">Descubre</span>
                                <h2 class="text-white text-2x1 md:text-4xl font-light tracking-[0.1em] uppercase category-title">${cat}</h2>
                            </div>
                            <div class="size-10 md:size-14 rounded-full border border-white/30 text-white flex items-center justify-center accordion-icon">
                                <span class="material-symbols-outlined text-2xl md:text-3xl">expand_more</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Contenido Categoría (Desplegable) -->
                    <div id="content-${cat.replace(/\s+/g, '-')}" class="category-content px-1">
                        <div class="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            ${tarjetasHTML}
                        </div>
                    </div>
                </div>
            `;
            ritualesListContainer.insertAdjacentHTML('beforeend', itemHTML);
        });
    }

    // --- LÓGICA DE PESTAÑAS (Templo vs Belleza) ---
    window.switchRitualType = function(type) {
        if (type === currentRitualType) return;
        currentRitualType = type;
        
        // Actualizar UI de pestañas
        const btnTemplo = document.getElementById('tab-rituales-templo');
        const btnBelleza = document.getElementById('tab-rituales-belleza');
        
        if (type === 'templo') {
            btnTemplo.style.backgroundColor = '#39280F';
            btnTemplo.style.color = '#E4D7C5';
            btnBelleza.style.backgroundColor = 'transparent';
            btnBelleza.style.color = 'rgba(57, 40, 15, 0.5)';
        } else {
            btnBelleza.style.backgroundColor = '#39280F';
            btnBelleza.style.color = '#E4D7C5';
            btnTemplo.style.backgroundColor = 'transparent';
            btnTemplo.style.color = 'rgba(57, 40, 15, 0.5)';
        }
        
        // Re-renderizar con animación de desvanecimiento
        if (ritualesListContainer) {
            ritualesListContainer.classList.add('opacity-0');
            setTimeout(() => {
                renderRituales();
                ritualesListContainer.classList.remove('opacity-0');
                const panel = document.getElementById('rituales-panel');
                if (panel) panel.scrollTo({top: 0, behavior: 'smooth'});
            }, 300);
        }
    };

    // Función global para manejar el acordeón con scroll sincronizado
    window.toggleAccordion = function(categoryName) {
        const id = `content-${categoryName.replace(/\s+/g, '-')}`;
        const content = document.getElementById(id);
        const header = content.previousElementSibling;
        const panel = document.getElementById('rituales-panel');
        const isOpen = content.classList.contains('open');
        
        // Si ya está abierto, solo lo cerramos (comportamiento estándar)
        if (isOpen) {
            content.classList.remove('open');
            header.classList.remove('active');
            return;
        }

        // --- Lógica de Apertura con Scroll Sincronizado ---
        
        // 1. Cerrar todos los demás inmediatamente
        document.querySelectorAll('.category-content').forEach(c => {
            c.classList.remove('open');
            c.previousElementSibling.classList.remove('active');
        });
        
        // 2. Abrir el seleccionado
        content.classList.add('open');
        header.classList.add('active');
        
        // 3. Seguimiento dinámico de la posición durante la animación
        const duration = 800; // Coincide con el CSS (cubic-bezier 0.8s)
        const start = performance.now();
        const headerHeight = panel.querySelector('header').offsetHeight;
        const panelRect = panel.getBoundingClientRect();

        function syncScroll(timestamp) {
            const elapsed = timestamp - start;
            
            // Calculamos la posición actual del header respecto al panel
            const headerRect = header.getBoundingClientRect();
            const currentTopRelativeToPanel = headerRect.top - panelRect.top;
            
            // Queremos que el header esté a 'headerHeight' del panel
            const diff = currentTopRelativeToPanel - headerHeight;
            
            // Ajustamos el scroll del panel para compensar el movimiento
            if (Math.abs(diff) > 0.5) {
                panel.scrollTop += diff;
            }

            if (elapsed < duration) {
                requestAnimationFrame(syncScroll);
            }
        }

        // Iniciamos el seguimiento en el siguiente frame
        requestAnimationFrame(syncScroll);
    };

    if (btnAsistencia) {
        btnAsistencia.addEventListener('click', () => {
            showToast('Llamando a recepción. En breve te atenderemos.');
        });
    }

    // ==========================================
    // Lógica Lectura CSV (Datos reales del Google Sheet con horas)
    // ==========================================
    // Listado real de citas (Sincronizado desde el Sheet)
    let CITAS_REALES = [];
    
    // Handler global para las citas (JSONP)
    window.handleCitasResponse = function(response) {
        try {
            if (!response || !response.table || !response.table.rows) return;
            
            const results = [];

            // La API de Google mueve la cabecera a cols[] automáticamente.
            // rows[] empieza ya con datos reales. Iteramos TODAS las filas,
            // pero filtramos por si el DNI fuera texto puro (cabecera no detectada).
            response.table.rows.forEach(row => {
                if (!row.c || row.c.length < 2) return;
                
                // Columna B (índice 1) = DNI
                const dni = row.c[1] ? (row.c[1].v || '').toString().trim() : '';
                // Saltamos si el DNI es vacío o solo letras (estaría en la cabecera)
                if (!dni || /^[a-zA-Z\s]+$/.test(dni)) return;

                // Grupos de 3 desde columna C (índice 2): rito | fecha | hora
                for (let i = 2; i + 2 <= row.c.length - 1; i += 3) {
                    const servicioCell = row.c[i];
                    const fechaCell    = row.c[i + 1];
                    const horaCell     = row.c[i + 2];

                    const servicio = servicioCell ? (servicioCell.v || '').toString().trim() : '';
                    if (!servicio) continue;

                    const fecha = fechaCell ? (fechaCell.f || fechaCell.v || '').toString() : '';
                    const hora  = horaCell  ? (horaCell.f  || horaCell.v  || '').toString() : '';
                    results.push({ DNI: dni, Servicio: servicio, Fecha: fecha, Hora: hora, Estado: 'Confirmada' });
                }
            });
            
            CITAS_REALES = results;
            console.log("Citas sincronizadas:", CITAS_REALES.length, CITAS_REALES.slice(0,3));
        } catch (e) {
            console.error("Error al procesar citas:", e);
        }
    };

    // --- NUEVA LÓGICA DE SINCRONIZACIÓN REMOTA TOTAL ---
    function fetchSheetData(sheetName, callbackName) {
        const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}&callback=${callbackName}`;
        const script = document.createElement('script');
        script.src = url;
        document.body.appendChild(script);
        setTimeout(() => script.remove(), 10000);
    }

    // Handler para Experiencias
    window.handleExperienciasResponse = function(response) {
        try {
            if (!response || !response.table || !response.table.rows) return;
            const rows = response.table.rows;
            const newData = rows.map((row, index) => {
                if (!row.c || row.c.length < 6) return null;
                return {
                    id: row.c[0] ? row.c[0].v : index + 1,
                    titulo: row.c[1] ? row.c[1].v : '',
                    descripcion: row.c[2] ? row.c[2].v : '',
                    duracion: row.c[3] ? row.c[3].v : '',
                    precio: row.c[4] ? row.c[4].v : '',
                    imagen: row.c[5] ? row.c[5].v : '',
                    image: row.c[5] ? row.c[5].v : '',
                    categoria: row.c[6] ? row.c[6].v : 'Otros',
                    fecha: row.c[7] ? row.c[7].v : ''
                };
            }).filter(item => item !== null && item.titulo);

            if (newData.length > 0) {
                MOCK_RITUALES = newData;
                if(window.saveToCloud) window.saveToCloud('rituales', MOCK_RITUALES, RITUALES_STORAGE_KEY); else localStorage.setItem(RITUALES_STORAGE_KEY, JSON.stringify(MOCK_RITUALES));
                console.log("✅ Experiencias sincronizadas desde la nube");
                renderRituales();
                if (typeof renderAdminRituales === 'function') renderAdminRituales();
            }
        } catch (e) { console.error("Error sincronizando Experiencias:", e); }
    };

    // Handler para Talleres (Catálogo)
    window.handleTalleresItemsResponse = function(response) {
        try {
            if (!response || !response.table || !response.table.rows) return;
            const rows = response.table.rows;
            const newData = rows.map((row, index) => {
                if (!row.c || row.c.length < 5) return null;
                return {
                    id: row.c[0] ? row.c[0].v : index + 1,
                    titulo: row.c[1] ? row.c[1].v : '',
                    descripcion: row.c[2] ? row.c[2].v : '',
                    precio: row.c[3] ? row.c[3].v : '',
                    imagen: row.c[4] ? row.c[4].v : ''
                };
            }).filter(item => item !== null && item.titulo);

            if (newData.length > 0) {
                MOCK_TALLERES_CATALOGO = newData;
                if(window.saveToCloud) window.saveToCloud('talleresCatalogo', MOCK_TALLERES_CATALOGO, TALLERES_CATALOGO_KEY); else localStorage.setItem(TALLERES_CATALOGO_KEY, JSON.stringify(MOCK_TALLERES_CATALOGO));
                console.log("✅ Talleres sincronizados desde la nube");
                renderTalleresCatalogo();
                if (typeof renderAdminTalleresCatalogo === 'function') renderAdminTalleresCatalogo();
            }
        } catch (e) { console.error("Error sincronizando Talleres:", e); }
    };

    // Handler para QRs
    window.handleQRsResponse = function(response) {
        try {
            if (!response || !response.table || !response.table.rows) return;
            const rows = response.table.rows;
            const newData = rows.map((row, index) => {
                if (!row.c || row.c.length < 3) return null;
                return {
                    id: row.c[0] ? row.c[0].v : index + 1,
                    titulo: row.c[1] ? row.c[1].v : '',
                    data: row.c[2] ? row.c[2].v : ''
                };
            }).filter(item => item !== null && item.titulo);

            if (newData.length > 0) {
                QR_DATA = newData;
                if(window.saveToCloud) window.saveToCloud('qrConfig', QR_DATA, QR_STORAGE_KEY); else localStorage.setItem(QR_STORAGE_KEY, JSON.stringify(QR_DATA));
                console.log("✅ QRs sincronizados desde la nube");
                renderQRGrid();
            }
        } catch (e) { console.error("Error sincronizando QRs:", e); }
    };

    // Sincronización remota consolidada al final del script

    async function syncCitasFromSheet() {
        fetchSheetData('Citas', 'handleCitasResponse');
        return new Promise(resolve => setTimeout(resolve, 1500));
    }

    // Cargar citas al inicio
    syncCitasFromSheet();


    const showDniModal = () => {
        if (!dniModal) return;
        document.body.classList.add('no-scroll');
        dniModal.classList.remove('hidden');
        if (dniInput) dniInput.value = '';
        if (dniError) dniError.classList.add('hidden');
        setTimeout(() => {
            if (dniInput) dniInput.focus();
        }, 100);
    };

    const hideDniModal = () => {
        hidePanel(dniModal);
    };

    // Lógica DNI
    if (btnCancelDni) btnCancelDni.addEventListener('click', hideDniModal);
    
    if (btnSubmitDni) {
        btnSubmitDni.addEventListener('click', async () => {
            const dniValue = dniInput.value.trim().toUpperCase();
            
            // Validación básica de DNI/NIE (Ej: 8 números y 1 letra, o Letra + 7 números + Letra)
            const regexDniNie = /^[XYZ]?\d{5,8}[A-Z]$/;
            
            if (regexDniNie.test(dniValue)) {
                showToast(`Buscando reservas para DNI: ${dniValue}...`);
                
                // Simular retraso de lectura de base de datos/CSV
                // Aseguramos sincronización antes de buscar
                await syncCitasFromSheet();
                
                setTimeout(() => {
                    const cleanDni = dniValue.replace(/[^A-Z0-9]/g, '');
                    console.log("DNI Limpio Buscado:", cleanDni);
                    
                    // NORMALIZADOR DE DNI: Quita todo lo que no sea letra/número
                    const normalize = (val) => (val || '').toString().toUpperCase().replace(/[^A-Z0-9]/g, '').trim();

                    // Filtramos por DNI en el listado real con normalización extrema
                    const citasCliente = CITAS_REALES.filter(reserva => {
                        const dniReserva = normalize(reserva.DNI);
                        return dniReserva === cleanDni || (dniReserva.length > 0 && cleanDni.endsWith(dniReserva));
                    });
                    
                    console.log(`Resultados para ${cleanDni}:`, citasCliente.length);
                    
                    citasListContainer.innerHTML = '';
                    
                    if (citasCliente.length > 0) {
                        citasEmptyState.classList.add('hidden');
                        
                        // Generar tarjetas de cita
                        citasCliente.forEach(cita => {
                            const isConfirmada = cita.Estado.toLowerCase() === 'confirmada';
                            const statusColor = isConfirmada ? 'bg-green-100 text-green-700 border-green-200' : 'bg-primary/10 text-primary border-primary/20';
                            const statusIcon = isConfirmada ? 'check_circle' : 'pending';
                            const icon = cita.Servicio.toLowerCase().includes('masaje') ? 'massage' : 'spa';
                            
                            const cardHTML = `
                                <div class="bg-white rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between shadow-sm border border-sand hover:shadow-md transition-shadow gap-6 md:gap-4 w-full">
                                    <div class="flex items-center gap-4 md:gap-6">
                                        <div class="size-14 md:size-16 rounded-full bg-sand flex items-center justify-center shrink-0">
                                            <span class="material-symbols-outlined text-2xl md:text-3xl text-zen-gray">${icon}</span>
                                        </div>
                                        <div class="flex flex-col">
                                            <h3 class="text-lg md:text-xl font-bold text-slate-800">${cita.Servicio}</h3>
                                            <div class="flex flex-wrap items-center gap-2 mt-1 md:mt-2 text-slate-500 font-medium text-xs md:text-sm">
                                                <div class="flex items-center gap-1"><span class="material-symbols-outlined text-[16px]">calendar_today</span><span>${cita.Fecha}</span></div>
                                                <span class="text-sand/50 hidden md:inline">|</span>
                                                <div class="flex items-center gap-1"><span class="material-symbols-outlined text-[16px]">schedule</span><span>${cita.Hora} (${cita.Duracion})</span></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="px-3 md:px-4 py-1.5 md:py-2 ${statusColor} rounded-full flex items-center gap-2 shrink-0 border mt-2 md:mt-0 self-end md:self-auto">
                                        <span class="material-symbols-outlined text-[16px] md:text-[18px]">${statusIcon}</span>
                                        <span class="font-bold uppercase tracking-wider text-[10px] md:text-xs">${cita.Estado}</span>
                                    </div>
                                </div>
                            `;
                            citasListContainer.insertAdjacentHTML('beforeend', cardHTML);
                        });
                    } else {
                        // No hay citas para este DNI
                        citasEmptyState.classList.remove('hidden');
                    }
                    
                    showCitasPanel();
                }, 600);
            } else {
                dniError.classList.remove('hidden');
                const modalContent = dniModal.querySelector('div');
                modalContent.classList.add('animate-pulse');
                setTimeout(() => modalContent.classList.remove('animate-pulse'), 500);
                dniInput.focus();
            }
        });
    }

    if (dniInput) {
        dniInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                btnSubmitDni.click();
            }
        });
        
        dniInput.addEventListener('input', () => {
            dniError.classList.add('hidden');
        });
    }

    // ==========================================
    // Lógica del Panel de Administración Oculto
    // ==========================================

    // (Ya capturados al inicio)


    // Variables para la secuencia de clics
    let clickCount = 0;
    let clickTimer = null;
    let longPressTimer = null;
    let lastTouchTime = 0; // Para evitar duplicidad mousedown/touchstart

    function resetClickState() {
        clickCount = 0;
        clearTimeout(clickTimer);
        clearTimeout(longPressTimer);
        if (clockContainer) clockContainer.style.opacity = '1';
    }

    function showPinModal() {
        resetPinInput();
        showPanel(pinModal);
    }

    function hidePinModal() {
        hidePanel(pinModal);
    }

    function showAdminPanel() {
        hidePinModal();
        setTimeout(() => {
            showPanel(adminPanel);
            switchAdminTab('resumen');
        }, 300);
    }

    function hideAdminPanel() {
        hidePanel(adminPanel);
    }

    // ==========================================
    // Lógica EDITOR DE EXPERIENCIAS (Nuevo)
    // ==========================================

    // (Ya declarado al inicio)
    // currentEditingRitualId = null;


    window.switchAdminTab = function(tabName) {
        document.querySelectorAll('.admin-view').forEach(v => v.classList.add('hidden'));
        document.querySelectorAll('.admin-tab-btn').forEach(b => {
             b.classList.remove('active', 'bg-white', 'shadow-sm', 'text-slate-800');
             b.classList.add('text-slate-400');
        });

        const activeView = document.getElementById(`admin-view-${tabName}`);
        const activeBtn = document.getElementById(`tab-btn-${tabName}`);
        
        if (activeView) activeView.classList.remove('hidden');
        if (activeBtn) {
            activeBtn.classList.add('active', 'bg-white', 'shadow-sm', 'text-slate-800');
            activeBtn.classList.remove('text-slate-400');
        }

        if (tabName === 'experiencias') {
            renderAdminRituales();
        }
        if (tabName === 'qrs') {
            loadQRConfigIntoEditor();
        }
        if (tabName === 'talleres-items') {
            renderAdminTalleresCatalogo();
        }
    }

    function renderAdminRituales() {
        const list = document.getElementById('admin-ritual-list');
        if (!list) return;
        
        list.innerHTML = MOCK_RITUALES.map(ritual => `
            <button onclick="cargarRitualEnEditor(${ritual.id})" class="w-full p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-primary/30 hover:shadow-md transition-all text-left flex items-center justify-between group">
                <div class="flex flex-col gap-1 overflow-hidden">
                    <span class="text-[10px] font-bold text-primary uppercase tracking-widest">${ritual.categoria || 'Otros'}</span>
                    <span class="text-sm font-bold text-slate-800 truncate">${ritual.titulo || 'Nueva Experiencia'}</span>
                    <span class="text-[10px] text-slate-400 font-medium">${ritual.precio || '0,00€'} | ${ritual.fecha || ritual.duracion || '--'}</span>
                </div>
                <span class="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors">edit</span>
            </button>
        `).join('');
    }

    const btnNewRitual = document.getElementById('btn-new-ritual');
    if (btnNewRitual) {
        btnNewRitual.addEventListener('click', () => {
            const newId = Date.now();
            const newRitual = {
                id: newId,
                titulo: 'Nueva Experiencia',
                descripcion: 'Descripción corta.',
                duracion: '60 min',
                precio: '0,00€',
                fecha: '',
                imagen: '',
                image: '',
                categoria: 'Otros'
            };
            MOCK_RITUALES.unshift(newRitual); // Agregar al inicio
            if(window.saveToCloud) window.saveToCloud('rituales', MOCK_RITUALES, RITUALES_STORAGE_KEY); else localStorage.setItem(RITUALES_STORAGE_KEY, JSON.stringify(MOCK_RITUALES));
            renderAdminRituales();
            renderRituales();
            window.cargarRitualEnEditor(newId);
        });
    }

    window.cargarRitualEnEditor = function(id) {
        const ritual = MOCK_RITUALES.find(r => r.id === id);
        if (!ritual) return;
        
        currentEditingRitualId = id;
        document.getElementById('edit-ritual-titulo').value = ritual.titulo || '';
        document.getElementById('edit-ritual-desc').value = ritual.descripcion || '';
        document.getElementById('edit-ritual-duracion').value = ritual.duracion || '';
        document.getElementById('edit-ritual-precio').value = ritual.precio || '';
        const fechaEl = document.getElementById('edit-ritual-fecha');
        if (fechaEl) fechaEl.value = ritual.fecha || '';
        const imgField = document.getElementById('edit-ritual-imagen');
        imgField.value = ritual.image || ritual.imagen || '';
        
        // Actualizar vista previa
        updateRitualPreview(imgField.value);

        // Mostrar botón borrar
        if (btnDeleteRitual) btnDeleteRitual.classList.remove('hidden');
        
        // Hacer scroll al formulario en móviles
        document.getElementById('admin-ritual-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    if (btnDeleteRitual) {
        btnDeleteRitual.addEventListener('click', () => {
            if (!currentEditingRitualId) return;
            if (confirm('¿Seguro que quieres eliminar esta experiencia permanentemente?')) {
                MOCK_RITUALES = MOCK_RITUALES.filter(r => r.id !== currentEditingRitualId);
                currentEditingRitualId = null;
                if(window.saveToCloud) window.saveToCloud('rituales', MOCK_RITUALES, RITUALES_STORAGE_KEY); else localStorage.setItem(RITUALES_STORAGE_KEY, JSON.stringify(MOCK_RITUALES));
                showToast('Experiencia eliminada');
                btnDeleteRitual.classList.add('hidden');
                // Limpiar campos
                document.getElementById('edit-ritual-titulo').value = '';
                document.getElementById('edit-ritual-desc').value = '';
                document.getElementById('edit-ritual-duracion').value = '';
                document.getElementById('edit-ritual-precio').value = '';
                if (document.getElementById('edit-ritual-fecha')) document.getElementById('edit-ritual-fecha').value = '';
                document.getElementById('edit-ritual-imagen').value = '';
                updateRitualPreview('');
                renderAdminRituales();
                renderRituales();
            }
        });
    }

    function updateRitualPreview(url) {
        const preview = document.getElementById('edit-ritual-preview');
        const placeholder = document.getElementById('preview-placeholder');
        if (!preview || !placeholder) return;

        const directUrl = getDirectImgLink(url);

        if (directUrl && directUrl.trim().length > 5) {
            preview.src = directUrl;
            preview.onload = () => {
                preview.classList.remove('opacity-0');
                placeholder.classList.add('hidden');
            };
            preview.onerror = () => {
                preview.classList.add('opacity-0');
                placeholder.classList.remove('hidden');
            };
        } else {
            preview.classList.add('opacity-0');
            placeholder.classList.remove('hidden');
        }
    }

    // Listener para actualización en tiempo real
    const ritualImgInput = document.getElementById('edit-ritual-imagen');
    if (ritualImgInput) {
        ritualImgInput.addEventListener('input', (e) => {
            updateRitualPreview(e.target.value);
        });
    }


    // (Ya capturado al inicio)

    // Los elementos ya están capturados al inicio del script, pero aseguramos la referencia
    const btnSaveRitualTop = document.getElementById('btn-save-ritual-top');
    
    function saveRitualAction() {
        let index = MOCK_RITUALES.findIndex(r => r.id === currentEditingRitualId);
        
        if (!currentEditingRitualId || index === -1) {
            // Auto crear si no había nada seleccionado
            const newId = Date.now();
            currentEditingRitualId = newId;
            const newRitual = { id: newId, titulo: '', descripcion: '', precio: '', fecha: '', imagen: '', image: '', categoria: 'Otros' };
            MOCK_RITUALES.unshift(newRitual);
            index = 0;
        }

        const tituloVal = document.getElementById('edit-ritual-titulo')?.value || 'Nueva Experiencia';
        const descVal = document.getElementById('edit-ritual-desc')?.value || '';
        const durVal = document.getElementById('edit-ritual-duracion')?.value || '';
        const precVal = document.getElementById('edit-ritual-precio')?.value || '';
        const fechaEl = document.getElementById('edit-ritual-fecha');
        const imgVal = getDirectImgLink(document.getElementById('edit-ritual-imagen')?.value || '');
        
        MOCK_RITUALES[index] = {
            ...MOCK_RITUALES[index],
            titulo: tituloVal,
            descripcion: descVal,
            duracion: durVal,
            precio: precVal,
            fecha: fechaEl ? fechaEl.value : '',
            imagen: imgVal,
            image: imgVal
        };

        if(window.saveToCloud) window.saveToCloud('rituales', MOCK_RITUALES, RITUALES_STORAGE_KEY); else localStorage.setItem(RITUALES_STORAGE_KEY, JSON.stringify(MOCK_RITUALES));
        showToast('Experiencia guardada correctamente');
        renderAdminRituales();
        renderRituales(); // Actualizar vista pública
    }

    if (btnSaveRitual) btnSaveRitual.addEventListener('click', saveRitualAction);
    if (btnSaveRitualTop) btnSaveRitualTop.addEventListener('click', saveRitualAction);

    // --- LÓGICA DE TALLERES (CATÁLOGO) ---
    let currentEditingTallerItemId = null;

    function renderTalleresCatalogo() {
        const container = document.getElementById('talleres-items-list');
        if (!container) return;
        container.innerHTML = MOCK_TALLERES_CATALOGO.map(taller => {
            const displayImg = getDirectImgLink(taller.imagen);
            return `
            <div class="bg-white border border-sand rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col group h-full">
                <div class="aspect-video relative overflow-hidden">
                    <img src="${displayImg}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="${taller.titulo}">
                    <div class="absolute top-4 left-4">
                        <span class="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-[10px] font-bold text-primary uppercase tracking-widest shadow-sm">Taller</span>
                    </div>
                </div>
                <div class="p-6 flex flex-col flex-grow">
                    <h3 class="text-lg font-bold text-slate-800 mb-1 truncate">${taller.titulo}</h3>
                    <p class="text-xs text-primary font-bold mb-2 uppercase tracking-widest">${taller.fecha || ''}</p>
                    <p class="text-sm text-slate-500 line-clamp-3 mb-6 flex-grow leading-relaxed">${taller.descripcion}</p>
                    <div class="pt-4 border-t border-slate-50 flex items-center justify-between mt-auto">
                        <span class="text-primary font-bold">${taller.precio}</span>
                        <button onclick="showToast('Disponible próximamente, contacta en recepción')" class="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-primary transition-colors uppercase tracking-tighter p-1 hover:bg-slate-50 rounded-lg active:scale-95">
                            <span class="material-symbols-outlined text-sm">schedule</span>
                            Consultar
                        </button>
                    </div>
                </div>
            </div>
        `}).join('');
    }

    function renderAdminTalleresCatalogo() {
        const container = document.getElementById('admin-talleres-item-list');
        if (!container) return;
        container.innerHTML = MOCK_TALLERES_CATALOGO.map(taller => `
            <button onclick="cargarTallerItemEnEditor(${taller.id})" class="w-full p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-primary/30 hover:shadow-md transition-all text-left flex items-center justify-between group">
                <div class="flex flex-col gap-1 overflow-hidden">
                    <span class="text-sm font-bold text-slate-800 truncate">${taller.titulo}</span>
                    <span class="text-[10px] text-slate-400 font-medium">${taller.precio} ${taller.fecha ? '| ' + taller.fecha : ''}</span>
                </div>
                <span class="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors">edit</span>
            </button>
        `).join('');
    }

    const btnNewTallerItem = document.getElementById('btn-new-taller-item');
    if (btnNewTallerItem) {
        btnNewTallerItem.addEventListener('click', () => {
            const newId = Date.now();
            const newTaller = {
                id: newId,
                titulo: 'Nuevo Taller',
                descripcion: 'Descripción...',
                precio: '0,00€',
                fecha: '',
                imagen: ''
            };
            MOCK_TALLERES_CATALOGO.unshift(newTaller); // Add to beginning
            if(window.saveToCloud) window.saveToCloud('talleresCatalogo', MOCK_TALLERES_CATALOGO, TALLERES_CATALOGO_KEY); else localStorage.setItem(TALLERES_CATALOGO_KEY, JSON.stringify(MOCK_TALLERES_CATALOGO));
            renderAdminTalleresCatalogo();
            renderTalleresCatalogo();
            window.cargarTallerItemEnEditor(newId);
        });
    }

    window.cargarTallerItemEnEditor = function(id) {
        const taller = MOCK_TALLERES_CATALOGO.find(t => t.id === id);
        if (!taller) return;
        
        currentEditingTallerItemId = id;
        if (editTallerItemTitulo) editTallerItemTitulo.value = taller.titulo;
        if (editTallerItemDesc) editTallerItemDesc.value = taller.descripcion;
        if (editTallerItemPrecio) editTallerItemPrecio.value = taller.precio;
        const fechaInput = document.getElementById('edit-taller-item-fecha');
        if (fechaInput) fechaInput.value = taller.fecha || '';
        if (editTallerItemImagen) editTallerItemImagen.value = taller.imagen;
        
        updateTallerItemPreview(taller.imagen || '');

        // Mostrar botón borrar
        if (btnDeleteTallerItem) btnDeleteTallerItem.classList.remove('hidden');
        
        document.getElementById('admin-talleres-item-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    if (btnDeleteTallerItem) {
        btnDeleteTallerItem.addEventListener('click', () => {
            if (!currentEditingTallerItemId) return;
            if (confirm('¿Seguro que quieres eliminar este taller del catálogo permanentemente?')) {
                MOCK_TALLERES_CATALOGO = MOCK_TALLERES_CATALOGO.filter(t => t.id !== currentEditingTallerItemId);
                currentEditingTallerItemId = null;
                if(window.saveToCloud) window.saveToCloud('talleresCatalogo', MOCK_TALLERES_CATALOGO, TALLERES_CATALOGO_KEY); else localStorage.setItem(TALLERES_CATALOGO_KEY, JSON.stringify(MOCK_TALLERES_CATALOGO));
                showToast('Taller eliminado del catálogo');
                btnDeleteTallerItem.classList.add('hidden');
                // Limpiar campos
                if (editTallerItemTitulo) editTallerItemTitulo.value = '';
                if (editTallerItemDesc) editTallerItemDesc.value = '';
                if (editTallerItemPrecio) editTallerItemPrecio.value = '';
                const fechaInput = document.getElementById('edit-taller-item-fecha');
                if (fechaInput) fechaInput.value = '';
                if (editTallerItemImagen) editTallerItemImagen.value = '';
                updateTallerItemPreview('');
                renderAdminTalleresCatalogo();
                renderTalleresCatalogo();
            }
        });
    }

    function updateTallerItemPreview(url) {
        const preview = document.getElementById('edit-taller-item-preview');
        const placeholder = document.getElementById('taller-preview-placeholder');
        if (!preview || !placeholder) return;
        
        const directUrl = getDirectImgLink(url);
        
        if (directUrl && directUrl.length > 5) {
            preview.src = directUrl;
            preview.onload = () => {
                preview.classList.remove('opacity-0');
                placeholder.classList.add('hidden');
            };
            preview.onerror = () => {
                preview.classList.add('opacity-0');
                placeholder.classList.remove('hidden');
            };
        } else {
            preview.classList.add('opacity-0');
            placeholder.classList.remove('hidden');
        }
    }

    if (editTallerItemImagen) {
        editTallerItemImagen.addEventListener('input', (e) => {
            updateTallerItemPreview(e.target.value);
        });
        // También al perder el foco, para limpiar el campo si es necesario
        editTallerItemImagen.addEventListener('change', (e) => {
            const converted = getDirectImgLink(e.target.value);
            if (converted !== e.target.value) {
                e.target.value = converted;
            }
        });
    }

    if (btnSaveTallerItem) {
        btnSaveTallerItem.addEventListener('click', () => {
            // Aseguramos obtener el ID actual
            if (!currentEditingTallerItemId) {
                showToast('Selecciona un taller para editar primero');
                return;
            }

            let index = MOCK_TALLERES_CATALOGO.findIndex(t => t.id === currentEditingTallerItemId);
            
            if (index === -1) {
                showToast('Error: No se encontró el taller seleccionado');
                return;
            }

            const tituloVal = document.getElementById('edit-taller-item-titulo')?.value || 'Nuevo Taller';
            const descVal = document.getElementById('edit-taller-item-desc')?.value || '';
            const precioVal = document.getElementById('edit-taller-item-precio')?.value || '';
            const fechaInput = document.getElementById('edit-taller-item-fecha');
            const imgInput = document.getElementById('edit-taller-item-imagen');
            const imgVal = imgInput ? getDirectImgLink(imgInput.value) : '';

            // Actualizar objeto en memoria
            MOCK_TALLERES_CATALOGO[index] = {
                ...MOCK_TALLERES_CATALOGO[index],
                titulo: tituloVal,
                descripcion: descVal,
                precio: precioVal,
                fecha: fechaInput ? fechaInput.value : '',
                imagen: imgVal
            };

            // Guardar
            if(window.saveToCloud) {
                window.saveToCloud('talleresCatalogo', MOCK_TALLERES_CATALOGO, TALLERES_CATALOGO_KEY);
            } else {
                localStorage.setItem(TALLERES_CATALOGO_KEY, JSON.stringify(MOCK_TALLERES_CATALOGO));
            }

            showToast('Taller guardado correctamente');
            renderAdminTalleresCatalogo();
            renderTalleresCatalogo(); 
            
            // Actualizar el campo si se convirtió el enlace
            if (imgInput) imgInput.value = imgVal;
        });
    }

    // Inicializar Catálogo
    renderTalleresCatalogo();
    const QR_STORAGE_KEY = 'templo_qr_config';
    let QR_DATA = JSON.parse(localStorage.getItem(QR_STORAGE_KEY)) || [
        { id: 1, titulo: 'YouTube', data: 'https://www.youtube.com/@eltemplobyzenestetic' },
        { id: 2, titulo: 'Instagram', data: 'https://www.instagram.com/eltemplobyzenestetic/' },
        { id: 3, titulo: 'Facebook', data: 'https://www.facebook.com/zenesteticalicante/?locale=es_ES' },
        { id: 4, titulo: 'WhatsApp', data: 'https://wa.me/34682054593' },
        { id: 5, titulo: 'Página Web', data: 'https://eltemplobyzenestetic.es/' }
    ];

    function renderQRGrid() {
        if (!qrGridContainer) return;
        
        // Filtrar para mostrar solo Redes Sociales (excluir App Store, Google Play, iOS, Android)
        const socialQRs = QR_DATA.filter(qr => {
            const title = qr.titulo.toLowerCase();
            const data = qr.data.toLowerCase();
            return !title.includes('app store') && !title.includes('play store') && 
                   !title.includes('ios') && !title.includes('android') &&
                   !data.includes('apps.apple.com') && !data.includes('play.google.com');
        });

        qrGridContainer.className = "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 w-full transition-all duration-700 items-start pb-12";
        
        const brandIcons = {
            youtube: `<svg class="size-8" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
            instagram: `<svg class="size-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>`,
            facebook: `<svg class="size-8" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`,
            whatsapp: `<svg class="size-8" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.41 0 .01 5.399 0 12.039c0 2.123.554 4.197 1.608 6.041l-1.71 6.241 6.386-1.674a11.803 11.803 0 0 0 5.76 1.496h.004c6.64 0 12.04-5.399 12.042-12.041a11.776 11.776 0 0 0-3.441-8.361"/></svg>`,
            web: `<svg class="size-8" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2zm-1 2v2h2V4h-2zm0 14v2h2v-2h-2zm5-12.5V7h2V5.5h-2zm0 13V20h2v-1.5h-2zM7 5.5V7h2V5.5H7zm0 13V20h2v-1.5H7z"/></svg>`
        };
        
        qrGridContainer.innerHTML = socialQRs.map((qr, index) => {
            const title = qr.titulo.toLowerCase();
            const dataUrl = qr.data.toLowerCase();
            let brandKey = 'web';

            if (title.includes('youtube') || dataUrl.includes('youtube.com')) brandKey = 'youtube';
            else if (title.includes('instagram') || dataUrl.includes('instagram.com')) brandKey = 'instagram';
            else if (title.includes('facebook') || dataUrl.includes('facebook.com')) brandKey = 'facebook';
            else if (title.includes('whatsapp') || dataUrl.includes('wa.me') || title.includes('canal')) brandKey = 'whatsapp';

            return `
                <div class="qr-card bg-zen-gray rounded-[1.25rem] shadow-xl border border-white/10 transition-all duration-500 hover:-translate-y-1" style="flex: 1 1 0; min-width: 0; max-width: 200px; display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 12px;">
                    <div class="w-full aspect-square bg-white border border-white/20 p-1.5 sm:p-2 rounded-2xl shadow-sm transition-all duration-500 hover:shadow-2xl group overflow-hidden">
                         <img src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qr.data)}" class="w-full h-full grayscale group-hover:grayscale-0 transition-all duration-700" alt="QR ${qr.titulo}">
                    </div>
                    
                    <div class="flex flex-col items-center py-1" style="gap: 4px;">
                        <div class="text-white/90 scale-75 drop-shadow-sm transition-transform group-hover:scale-90">
                            ${brandIcons[brandKey]}
                        </div>
                        <span class="text-[9px] sm:text-[10px] font-black text-white/50 uppercase text-center leading-none px-1" style="letter-spacing: 0.1em;">
                            ${qr.titulo}
                        </span>
                    </div>
                </div>
            `;
        }).join('');
        
        // Animación de entrada
        setTimeout(() => {
            qrGridContainer.classList.remove('opacity-0', 'translate-y-4');
            qrGridContainer.classList.add('opacity-100', 'translate-y-0');
        }, 100);
    }

    function loadQRConfigIntoEditor() {
        QR_DATA.forEach(qr => {
            const titleInput = document.getElementById(`qr-title-${qr.id}`);
            const dataInput = document.getElementById(`qr-data-${qr.id}`);
            if (titleInput) titleInput.value = qr.titulo;
            if (dataInput) dataInput.value = qr.data;
        });
    }

    if (btnSaveQrs) {
        btnSaveQrs.addEventListener('click', () => {
            const newData = [];
            for (let i = 1; i <= 5; i++) {
                const titleVal = document.getElementById(`qr-title-${i}`)?.value || '';
                const dataVal = document.getElementById(`qr-data-${i}`)?.value || '';
                newData.push({
                    id: i,
                    titulo: titleVal,
                    data: dataVal
                });
            }
            QR_DATA = newData;
            if(window.saveToCloud) window.saveToCloud('qrConfig', QR_DATA, QR_STORAGE_KEY); else localStorage.setItem(QR_STORAGE_KEY, JSON.stringify(QR_DATA));
            showToast('Configuración QR guardada correctamente');
            renderQRGrid();
        });
    }

    const btnSaveHomeQrs = document.getElementById('btn-save-home-qrs');
    if (btnSaveHomeQrs) {
        btnSaveHomeQrs.addEventListener('click', () => {
            const iosVal = document.getElementById('edit-home-qr-ios').value.trim();
            const androidVal = document.getElementById('edit-home-qr-android').value.trim();
            
            if (iosVal) HOME_QR_DATA.ios = iosVal;
            if (androidVal) HOME_QR_DATA.android = androidVal;
            
            if(window.saveToCloud) window.saveToCloud('homeQRs', HOME_QR_DATA, HOME_QR_STORAGE_KEY); else localStorage.setItem(HOME_QR_STORAGE_KEY, JSON.stringify(HOME_QR_DATA));
            
            showToast('QRs de inicio actualizados');
            renderHomeQRs();
        });
    }

    // Inicializar QRs
    renderQRGrid();

    if (clockContainer) {
        // Manejar ratón y táctil: 3 clics rápidos + pulsación larga
        const handleDown = (e) => {
            // Evitar duplicidad de mousedown tras touchstart
            const now = Date.now();
            if (now - lastTouchTime < 100) return;
            if (e.type === 'touchstart') lastTouchTime = now;

            clickCount++;
            
            // Feedback pulsación
            clockContainer.classList.add('scale-90');
            setTimeout(() => clockContainer.classList.remove('scale-90'), 150);

            // Reiniciar el temporizador de secuencia en cada toque
            clearTimeout(clickTimer);
            clickTimer = setTimeout(() => {
                resetClickState();
            }, 4000); // 4 segundos para completar la secuencia (más generoso)

            if (clickCount >= 3) {
                console.log("PIN Modal: 3 toques detectados, esperando pulsación larga...");
                // Al tercer clic o más, si se mantiene, se activa
                clockContainer.style.opacity = '0.5';
                
                clearTimeout(longPressTimer);
                longPressTimer = setTimeout(() => {
                    console.log("PIN Modal: Lanzando modal...");
                    showPinModal();
                    resetClickState();
                }, 1000); // Solo 1 segundo manteniendo presionado (más rápido)
            }
        };

        const handleUp = () => {
            if (clickCount >= 3) {
                clearTimeout(longPressTimer);
                clockContainer.style.opacity = '1';
            }
        };

        // Bloquear menú contextual para que la pulsación larga funcione siempre
        clockContainer.addEventListener('contextmenu', (e) => e.preventDefault());

        clockContainer.addEventListener('mousedown', handleDown);
        clockContainer.addEventListener('touchstart', handleDown, { passive: true });
        clockContainer.addEventListener('mouseup', handleUp);
        clockContainer.addEventListener('mouseleave', handleUp);
        clockContainer.addEventListener('touchend', handleUp);
        clockContainer.addEventListener('touchcancel', handleUp);
    }

    // --- LÓGICA DE PIN VISUAL (Pinpad) ---
    function updatePinUI() {
        pinDots.forEach((dot, index) => {
            if (index < currentPinValue.length) {
                dot.classList.add('bg-primary', 'border-primary', 'scale-110');
                dot.classList.remove('border-slate-200');
            } else {
                dot.classList.remove('bg-primary', 'border-primary', 'scale-110');
                dot.classList.add('border-slate-200');
            }
        });
    }

    function resetPinInput() {
        currentPinValue = '';
        if (pinError) pinError.classList.add('hidden');
        updatePinUI();
    }

    function checkPin() {
        if (currentPinValue === '2468') {
            showAdminPanel();
            resetPinInput();
        } else {
            // PIN Incorrecto
            if (pinError) pinError.classList.remove('hidden');
            
            const modalContent = pinModal.querySelector('div');
            modalContent.classList.add('animate-pulse');
            setTimeout(() => {
                modalContent.classList.remove('animate-pulse');
                resetPinInput();
            }, 500);
        }
    }

    pinNumBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (currentPinValue.length < 4) {
                currentPinValue += btn.getAttribute('data-val');
                if (pinError) pinError.classList.add('hidden');
                updatePinUI();
                
                if (currentPinValue.length === 4) {
                    setTimeout(checkPin, 250);
                }
            }
        });
    });

    if (btnPinClear) {
        btnPinClear.addEventListener('click', () => {
            if (currentPinValue.length > 0) {
                currentPinValue = currentPinValue.slice(0, -1);
                updatePinUI();
            }
        });
    }

    if (btnPinCancelAlt) {
        btnPinCancelAlt.addEventListener('click', hidePinModal);
    }

    if (btnToggleFullscreen) {
        btnToggleFullscreen.addEventListener('click', () => {
            if (!document.fullscreenElement) {
                const req = document.documentElement.requestFullscreen || 
                            document.documentElement.webkitRequestFullscreen || 
                            document.documentElement.msRequestFullscreen;
                
                if (req) {
                    req.call(document.documentElement).catch(err => {
                        showToast(`Error al activar pantalla completa: ${err.message}`);
                    });
                }
                btnToggleFullscreen.innerHTML = '<span class="material-symbols-outlined text-lg">fullscreen_exit</span> Salir Kiosk';
            } else {
                document.exitFullscreen();
                btnToggleFullscreen.innerHTML = '<span class="material-symbols-outlined text-lg">fullscreen</span> Modo Kiosk';
            }
        });
    }

    if (btnCancelPin) btnCancelPin.addEventListener('click', hidePinModal);
    if (btnLogoutAdmin) btnLogoutAdmin.addEventListener('click', hideAdminPanel);
    if (btnLogoutAdminSidebar) btnLogoutAdminSidebar.addEventListener('click', hideAdminPanel);

    if (btnExitApp) {
        btnExitApp.addEventListener('click', () => {
            if (confirm('¿Estás seguro de que quieres cerrar la aplicación?')) {
                // Salir de pantalla completa si está activa
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                }

                // En PWAs de iOS, window.close() no funciona habitualmente.
                // Intentamos cerrar, y si no, informamos al usuario.
                window.close();
                
                // Fallback: Mostrar mensaje informativo si window.close() es bloqueado
                showToast('Para salir completamente en esta tablet, usa el gesto de deslizar hacia arriba.');
                
                // Redirigir a una página en blanco para simular el cierre
                setTimeout(() => {
                    window.location.href = 'about:blank';
                }, 1000);
            }
        });
    }

    // ==========================================
    // Lógica del Modo Atractor (Salvapantallas)
    // ==========================================
    // Helper: Extraer el FILE_ID de un enlace de Google Drive
    function getDriveFileId(url) {
        // Formatos: /file/d/FILE_ID/view  o  id=FILE_ID
        const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
        return match ? match[1] : null;
    }

    // Handler global para la respuesta de Google Sheets (JSONP)
    window.handleMediaResponse = function(response) {
        try {
            if (response && response.table && response.table.rows) {
                const newList = response.table.rows.map(row => {
                    if (!row.c || !row.c[0] || !row.c[0].v) return null;
                    const rawUrl = row.c[0].v.trim();
                    
                    // Ignorar entradas vacías o links de WhatsApp
                    if (!rawUrl || rawUrl.includes('whatsapp.com/channel')) return null;

                    // ---- Detectar fichero LOCAL (sin http://) ----
                    if (!rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
                        if (/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(rawUrl)) {
                            return { type: 'image', url: rawUrl };
                        }
                        return null;
                    }

                    // ---- Detectar Google Drive ----
                    if (rawUrl.includes('drive.google.com')) {
                        const fileId = getDriveFileId(rawUrl);
                        if (!fileId) return null;
                        // Forzar a imagen (el usuario dijo que no quiere vídeos)
                        return { type: 'image', url: `https://lh3.googleusercontent.com/d/${fileId}` };
                    }

                    // ---- Por defecto: Imagen directa ----
                    return { type: 'image', url: rawUrl };
                }).filter(item => item !== null);

                tempMediaList = [...tempMediaList, ...newList];
            }
        } catch (e) {
            console.error("Error procesando JSONP de multimedia:", e);
        } finally {
            tabsProcessed++;
            if (tabsProcessed >= TABS_MULTIMEDIA.length) {
                if (tempMediaList.length > 0) {
                    mediaList = tempMediaList;
                    console.log("Sincronización total completada:", mediaList.length, "elementos.");
                } else {
                    console.warn("No se encontraron medios válidos en ninguna pestaña.");
                }
            }
        }
    };

    // Función para sincronizar medios con el Google Sheet
    async function syncMediaFromSheet() {
        console.log("Iniciando sincronización multi-pestaña...");
        tempMediaList = [];
        tabsProcessed = 0;

        // Eliminamos scripts previos
        document.querySelectorAll('.media-sync-script').forEach(s => s.remove());

        TABS_MULTIMEDIA.forEach(tab => {
            const script = document.createElement('script');
            script.className = 'media-sync-script';
            script.src = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json;responseHandler:handleMediaResponse&gid=${tab.gid}&tq=select%20A`;
            document.body.appendChild(script);
        });
        
        return new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Iniciar sincronización inmediata
    syncMediaFromSheet();
    syncBannersFromSheet();

    const btnSyncAll = document.getElementById('btn-sync-all');
    if (btnSyncAll) {
        btnSyncAll.addEventListener('click', async () => {
            const icon = document.getElementById('sync-icon');
            const indicator = document.getElementById('sync-status-indicator');
            
            if (icon) icon.classList.add('animate-spin');
            if (indicator) {
                indicator.innerHTML = '<span class="size-2 bg-amber-500 rounded-full animate-pulse"></span> Sincronizando contenido...';
                indicator.className = 'mt-4 px-4 py-2 bg-amber-50 text-amber-700 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-2';
            }

            try {
                // Sincronización multi-pestaña
                fetchSheetData('Experiencias', 'handleExperienciasResponse');
                fetchSheetData('TalleresItems', 'handleTalleresItemsResponse');
                fetchSheetData('QRs', 'handleQRsResponse');
                
                // Sincronización de banners y salvapantallas
                await Promise.all([syncMediaFromSheet(), syncBannersFromSheet()]);
                
                showToast('Contenido sincronizado con Google Sheet');
                if (indicator) {
                    indicator.innerHTML = '<span class="size-2 bg-green-500 rounded-full"></span> Sincronización Exitosa';
                    indicator.className = 'mt-4 px-4 py-2 bg-green-50 text-green-700 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-2';
                }
            } catch (e) {
                console.error("Error en sincronización manual:", e);
                showToast('Error al sincronizar');
                if (indicator) {
                    indicator.innerHTML = '<span class="size-2 bg-red-500 rounded-full"></span> Error en Sincronización';
                    indicator.className = 'mt-4 px-4 py-2 bg-red-50 text-red-700 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-2';
                }
            } finally {
                if (icon) setTimeout(() => icon.classList.remove('animate-spin'), 1000);
            }
        });
    }

    function showNextMedia() {
        if (!mediaList || mediaList.length === 0) return;
        
        currentMediaIndex = (currentMediaIndex + 1) % mediaList.length;
        const nextMedia = mediaList[currentMediaIndex];

        // 1. Ocultar imagen actual (Fade out)
        screensaverMedia.style.opacity = '0';

        setTimeout(() => {
            const screensaverImg = document.getElementById('screensaver-img');
            if (screensaverImg) screensaverImg.src = nextMedia.url;
            screensaverMedia.classList.remove('hidden', 'opacity-0');
            setTimeout(() => {
                screensaverMedia.style.opacity = '1';
            }, 50);
        }, 1000);
    }

    async function activateScreensaver() {
        // Cerrar paneles y modales con transiciones si están abiertos
        if (pinModal.classList.contains('panel-active')) hidePinModal();
        if (dniModal.classList.contains('panel-active')) hideDniModal();
        if (citasPanel.classList.contains('panel-active')) hideCitasPanel();
        if (ritualesPanel.classList.contains('panel-active')) hideRitualesPanel();
        if (talleresPanel.classList.contains('panel-active')) hidePanel(talleresPanel);
        if (clasesPanel.classList.contains('panel-active')) hidePanel(clasesPanel);
        if (adminPanel.classList.contains('panel-active')) hideAdminPanel();

        // Limpiar el estado de scroll del body
        document.body.classList.remove('no-scroll');

        // Sincronizar con el Sheet justo antes de empezar para tener lo último
        await syncMediaFromSheet();

        screensaverActive = true;
        screensaver.classList.remove('hidden');

        // Ocultar el reloj durante el salvapantallas
        const clock = document.getElementById('clock-container');
        if (clock) clock.classList.add('hidden');

        // Mostrar el screensaver primero (necesario para que el autoplay de YouTube funcione)
        setTimeout(() => {
            screensaver.classList.remove('opacity-0');
        }, 10);

        setTimeout(() => {
            if (mediaList.length > 0) {
                const currentMedia = mediaList[currentMediaIndex % mediaList.length];
                const screensaverImg = document.getElementById('screensaver-img');
                if (screensaverImg) screensaverImg.src = currentMedia.url;
                screensaverMedia.classList.remove('hidden', 'opacity-0');
                screensaverMedia.style.opacity = '1';
            }
        }, 300);

        // Iniciar ciclo
        clearInterval(fallbackCycleInterval);
        fallbackCycleInterval = setInterval(showNextMedia, CYCLE_INTERVAL);
    }

    function deactivateScreensaver() {
        if (!screensaverActive) return;
        screensaverActive = false;
        
        screensaver.classList.add('opacity-0');

        // Volver a mostrar el reloj al salir del salvapantallas
        const clock = document.getElementById('clock-container');
        if (clock) clock.classList.remove('hidden');
        clearInterval(fallbackCycleInterval);
        
        setTimeout(() => {
            screensaver.classList.add('hidden');
        }, 1000);
    }

    function resetInactivity() {
        clearTimeout(inactivityTimer);
        
        if (screensaverActive) {
            deactivateScreensaver();
        }

        // Reiniciar conteo siempre, incluso si estamos en el admin (para caducar sesión)
        inactivityTimer = setTimeout(activateScreensaver, INACTIVITY_LIMIT);
    }


    // Escuchar eventos globales para resetear inactividad
    const interactionEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'touchmove', 'wheel'];
    interactionEvents.forEach(event => {
        document.addEventListener(event, resetInactivity, { passive: true });
    });
 
    // Iniciar temporizador base
    resetInactivity();

    // ==========================================
    // Sincronización Realtime con Firebase
    // ==========================================
    if (typeof firebase !== 'undefined' && !firebase.apps.length) {
        // firebaseConfig debe estar definido en firebase-config.js (ignorado en git)
        if (typeof firebaseConfig === 'undefined') {
            console.warn("⚠️ firebaseConfig no encontrado. La sincronización en la nube podría no funcionar.");
            return;
        }
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

        // Sincronizar Imagen de Agenda (Faltaba)
        setupFirebaseSync('scheduleImg', SCHEDULE_IMG_URL, SCHEDULE_IMG_STORAGE_KEY, (data) => {
            if (typeof data === 'string') {
                SCHEDULE_IMG_URL = data;
                renderScheduleImage();
            }
        });

        // Sincronizar QRs de Inicio (Faltaba)
        setupFirebaseSync('homeQRs', HOME_QR_DATA, HOME_QR_STORAGE_KEY, (data) => {
            if (data && typeof data === 'object') {
                HOME_QR_DATA = data;
                renderHomeQRs();
            }
        });

        setupFirebaseSync('qrConfig', QR_DATA, QR_STORAGE_KEY, (data) => {
            // Asegurar que siempre tenemos 5 elementos y que no contienen QRs de descarga
            const defaults = [
                { id: 1, titulo: 'YouTube', data: 'https://www.youtube.com/@eltemplobyzenestetic' },
                { id: 2, titulo: 'Instagram', data: 'https://www.instagram.com/eltemplobyzenestetic/' },
                { id: 3, titulo: 'Facebook', data: 'https://www.facebook.com/zenesteticalicante/?locale=es_ES' },
                { id: 4, titulo: 'WhatsApp', data: 'https://wa.me/34682054593' },
                { id: 5, titulo: 'Página Web', data: 'https://eltemplobyzenestetic.es/' }
            ];
            
            let finalData = Array.isArray(data) ? [...data] : [];
            
            // Mapear y Limpiar: Si encontramos App Store o Google Play, sustituirlos por el default correspondiente
            finalData = finalData.map((qr, index) => {
                const lowTitle = qr.titulo.toLowerCase();
                const lowData = qr.data.toLowerCase();
                if (lowTitle.includes('app store') || lowTitle.includes('play store') || lowTitle.includes('google play') || lowData.includes('apps.apple.com') || lowData.includes('play.google.com')) {
                    // Reemplazar por el default de ese slot
                    return defaults[index] || defaults[0];
                }
                return qr;
            });

            // Rellenar hasta 5 si faltan
            if (finalData.length < 5) {
                for (let i = finalData.length; i < 5; i++) {
                    finalData.push(defaults[i]);
                }
            }
            
            QR_DATA = finalData;
            if (typeof renderQRGrid === 'function') renderQRGrid();
        });
    }


});
