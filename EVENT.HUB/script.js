// ==========================================
// 1. ДАННЫЕ И ПЕРЕМЕННЫЕ
// ==========================================

const defaultEvents = [
    { 
        id: 1, 
        title: "Monza GT3 Masters", 
        date: "2026-05-12", 
        category: "Cyber", 
        city: "Monza", 
        img: "https://images.unsplash.com/photo-1547915721-395786047240?auto=format&fit=crop&w=500&q=80",
        desc: "Главная гонка сезона в Assetto Corsa Competizione. Профессиональный симулятор и адреналин."
    },
    { 
        id: 2, 
        title: "Techno Night", 
        date: "2026-05-20", 
        category: "Music", 
        city: "Berlin", 
        img: "https://images.unsplash.com/photo-1514525253344-991422c7a0c5?auto=format&fit=crop&w=500&q=80",
        desc: "Лучший свет и звук в этом году. Погрузитесь в атмосферу ночного Берлина."
    },
    { 
        id: 3, 
        title: "Unreal Dev Meetup", 
        date: "2026-06-05", 
        category: "Meetup", 
        city: "San Francisco", 
        img: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=500&q=80",
        desc: "Обсуждаем новинки Unreal Engine 5 и Quixel Bridge. Обмен опытом для разработчиков."
    }
];

let events = JSON.parse(localStorage.getItem('myEvents')) || defaultEvents;
let joinedEvents = JSON.parse(localStorage.getItem('joinedEvents')) || [];

// ==========================================
// 2. ЛОГИКА КАСТОМНОГО СЕЛЕКТОРА И ФИЛЬТРОВ
// ==========================================

const catSelect = document.getElementById('catSelect');
const catOptions = document.getElementById('catOptions');
const catCurrent = document.getElementById('catCurrent');

// Открыть/закрыть список
catSelect.addEventListener('click', (e) => {
    catOptions.classList.toggle('show');
    e.stopPropagation();
});

// Клик по опции
document.querySelectorAll('.option').forEach(opt => {
    opt.addEventListener('click', (e) => {
        const value = e.target.getAttribute('data-value');
        const text = e.target.innerText;
        
        catCurrent.innerText = text; // Меняем текст в поле
        catSelect.setAttribute('data-selected', value); // Запоминаем выбор
        
        applyFilters(); // Запускаем фильтрацию
    });
});

// Закрытие при клике мимо
window.addEventListener('click', (e) => {
    if (!catSelect.contains(e.target)) {
        catOptions.classList.remove('show');
    }
});

// Обновленная функция фильтрации
function applyFilters() {
    const cat = catSelect.getAttribute('data-selected') || 'all';
    const city = document.getElementById('filterCity').value.toLowerCase();
    const date = document.getElementById('filterDate').value;

    const filtered = events.filter(e => {
        const matchCat = cat === 'all' || e.category === cat;
        const matchCity = !city || (e.city && e.city.toLowerCase().includes(city));
        const matchDate = !date || e.date === date;
        return matchCat && matchCity && matchDate;
    });

    renderEvents(filtered);
}

// ==========================================
// 3. ФУНКЦИИ ЛОГИКИ (Чат, Лайки, Модалки)
// ==========================================

function openDetails(id) {
    const event = events.find(e => e.id === id);
    const detailBox = document.getElementById('eventDetailData');
    
    const chatHtml = (event.chat || [
        {user: "Dina", text: "Кто-нибудь едет из центра?"},
        {user: "Alex", text: "Я буду на месте к 18:00!"}
    ]).map(msg => `
        <div style="margin-bottom: 10px; font-size: 13px;">
            <b style="color:var(--primary)">${msg.user}:</b> ${msg.text}
        </div>
    `).join('');

    detailBox.innerHTML = `
        <img src="${event.img}" class="detail-img">
        <h1 style="margin-top:20px">${event.title}</h1>
        <div class="tag">${event.category}</div>
        <p style="color:#ccc; margin: 15px 0;">${event.desc || 'Без описания'}</p>
        
        <div class="glass-card" style="padding: 15px; margin-top: 20px;">
            <h4>Чат участников</h4>
            <div id="chatBox" style="height: 100px; overflow-y: auto; margin-bottom: 10px;">${chatHtml}</div>
            <div style="display:flex; gap: 10px;">
                <input type="text" id="chatInput" placeholder="Написать..." style="margin:0; flex:1">
                <button class="save-btn" onclick="sendMsg(${event.id})">></button>
            </div>
        </div>

        <button class="save-btn" style="width:100%; margin-top: 20px;" onclick="joinEvent(${event.id})">Принять участие</button>
    `;
    document.getElementById('eventDetailModal').classList.remove('hidden');
}

function sendMsg(id) {
    const input = document.getElementById('chatInput');
    if (!input.value) return;

    const event = events.find(e => e.id === id);
    if (!event.chat) event.chat = [];
    
    event.chat.push({ user: "Вы", text: input.value });
    input.value = "";
    
    saveAndRender();
    openDetails(id); 
}

function toggleLike(id) {
    const event = events.find(e => e.id === id);
    if (!event.likes) event.likes = 0;
    
    event.likes += event.liked ? -1 : 1;
    event.liked = !event.liked;
    
    saveAndRender();
}

function saveEvent() {
    const title = document.getElementById('eventTitle').value;
    const date = document.getElementById('eventDate').value;
    const category = document.getElementById('eventCategory').value;
    const city = document.getElementById('eventCity').value;
    const img = document.getElementById('eventImg').value;
    const desc = document.getElementById('eventDesc').value;

    if (!title || !date) return alert("Название и дата обязательны!");

    const newEvent = {
        id: Date.now(),
        title, date, category,
        city: city || "Весь мир",
        img: img || `https://picsum.photos/seed/${Date.now()}/500/300`,
        desc: desc,
        likes: 0,
        comments: [],
        chat: []
    };

    events.unshift(newEvent);
    saveAndRender();
    toggleModal();
}

// ==========================================
// 4. ПРОФИЛЬ И УЧАСТИЕ
// ==========================================

function joinEvent(id) {
    if (joinedEvents.some(e => e.id === id)) return alert("Вы уже записаны!");
    const event = events.find(e => e.id === id);
    joinedEvents.push(event);
    localStorage.setItem('joinedEvents', JSON.stringify(joinedEvents));
    alert(`Вы идете на ${event.title}`);
    updateProfileUI();
}

function leaveEvent(id) {
    joinedEvents = joinedEvents.filter(e => e.id !== id);
    localStorage.setItem('joinedEvents', JSON.stringify(joinedEvents));
    updateProfileUI();
}

function showProfile() {
    document.getElementById('eventGrid').classList.add('hidden');
    document.querySelector('.filters').classList.add('hidden');
    document.getElementById('profileSection').classList.remove('hidden');
    updateProfileUI();
}

function showHome() {
    document.getElementById('eventGrid').classList.remove('hidden');
    document.querySelector('.filters').classList.remove('hidden');
    document.getElementById('profileSection').classList.add('hidden');
}

function updateProfileUI() {
    const grid = document.getElementById('joinedEventsGrid');
    const stats = document.getElementById('userStats');
    
    stats.innerText = `Вы идете на ${joinedEvents.length} мероприятий`;
    grid.innerHTML = joinedEvents.map(event => `
        <div class="glass-card">
            <img src="${event.img}" class="event-img">
            <h3>${event.title}</h3>
            <button class="cancel-btn" onclick="leaveEvent(${event.id})" style="width:100%; margin-top:10px">Отказаться</button>
        </div>
    `).join('');
}

// ==========================================
// 5. ОБЩИЕ ФУНКЦИИ И РЕНДЕР
// ==========================================

function handleMouseMove(e, card) {
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
    card.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
}

function renderEvents(dataToRender = events) {
    const grid = document.getElementById('eventGrid');
    if (!grid) return;

    // Если ничего не найдено по фильтрам
    if (dataToRender.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; opacity: 0.6;">
                <div style="font-size: 50px; margin-bottom: 20px;">🔍</div>
                <h3 style="font-weight: 400;">Ничего не найдено</h3>
                <p style="font-size: 14px;">Попробуйте изменить категорию или город</p>
            </div>
        `;
        return;
    }

    // Рендер карточек с анимацией
    grid.innerHTML = dataToRender.map((event, index) => `
        <div class="glass-card" 
             onmousemove="handleMouseMove(event, this)" 
             style="animation: fadeInUp 0.4s ease forwards ${index * 0.1}s; opacity: 0;">
            
            <div style="overflow: hidden; border-radius: 20px; position: relative;">
                <img src="${event.img}" class="event-img" onclick="openDetails(${event.id})" style="cursor:pointer">
            </div>

            <span class="tag">${event.category}</span>
            
            <h3 onclick="openDetails(${event.id})" style="cursor:pointer; margin: 10px 0 5px 0">
                ${event.title}
            </h3>
            
            <p style="color: #888; font-size: 14px; margin-bottom: 15px;">
                📅 ${event.date} ${event.city ? `• 📍 ${event.city}` : ''}
            </p>
            
            <div class="card-footer">
                <button class="action-btn ${event.liked ? 'liked' : ''}" onclick="toggleLike(${event.id})">
                    ${event.liked ? '❤️' : '🤍'} ${event.likes || 0}
                </button>
                <!-- Мы убрали лишние кнопки, чтобы интерфейс был чище как на скрине -->
            </div>
            
            <button class="save-btn" onclick="joinEvent(${event.id})" style="width: 100%; margin-top: 15px;">
                Участвовать
            </button>
        </div>
    `).join('');
}

function saveAndRender() {
    localStorage.setItem('myEvents', JSON.stringify(events));
    renderEvents();
}

function toggleModal() { document.getElementById('modal').classList.toggle('hidden'); }
function closeDetails() { document.getElementById('eventDetailModal').classList.add('hidden'); }

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    document.getElementById('themeBtn').innerText = newTheme === 'dark' ? '☀️' : '🌙';
}

// При загрузке страницы проверяем сохраненную тему
const savedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);
// Инициализация

// Функция для отображения только избранного в профиле
function showFavorites() {
    const favorites = events.filter(e => e.liked);
    const grid = document.getElementById('joinedEventsGrid'); // Используем ту же сетку в профиле
    
    if (favorites.length === 0) {
        grid.innerHTML = '<p style="padding:20px; color:#555;">В избранном пока пусто.</p>';
        return;
    }

    grid.innerHTML = favorites.map(event => `
        <div class="glass-card">
            <img src="${event.img}" class="event-img">
            <h3>${event.title}</h3>
            <button class="action-btn liked" onclick="toggleLike(${event.id}); showFavorites();">❤️ Убрать</button>
        </div>
    `).join('');
}

renderEvents();