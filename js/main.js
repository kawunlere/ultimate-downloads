// ===== MENU TOGGLE =====
function toggleMenu() {
    const menu = document.getElementById('sideMenu');
    menu.classList.toggle('active');
}

// ===== SEARCH TOGGLE =====
function toggleSearch() {
    const searchBox = document.getElementById('searchBox');
    searchBox.classList.toggle('active');
    if (searchBox.classList.contains('active')) {
        searchBox.querySelector('input').focus();
    }
}

// ===== LOAD APPS FROM DATABASE =====
async function loadApps() {
    try {
        const response = await fetch('/api/apps');
        const data = await response.json();
        
        if (data.apps && data.apps.length > 0) {
            renderFeatured(data.apps);
            renderTopApps(data.apps);
            renderLatestGames(data.apps);
            renderCollections(data.apps);
        } else {
            showEmpty();
        }
    } catch (error) {
        console.log('No apps yet, showing empty state');
        showEmpty();
    }
}

// ===== RENDER FEATURED =====
function renderFeatured(apps) {
    const slider = document.getElementById('featuredSlider');
    if (!slider) return;
    
    const featured = apps.filter(app => app.featured).slice(0, 5);
    
    if (featured.length === 0) {
        slider.innerHTML = '<div class="loading">No featured apps yet</div>';
        return;
    }
    
    slider.innerHTML = featured.map(app => `
        <div class="featured-card" onclick="openApp('${app.id}')" style="background: ${app.bgColor || 'linear-gradient(135deg, #ff6b6b, #ee5a6f)'}">
            <div class="featured-card-info">
                <img src="${app.icon}" alt="${app.name}">
                <div>
                    <h3>${app.name}</h3>
                    <p>${app.category}</p>
                </div>
            </div>
        </div>
    `).join('');
}

// ===== RENDER TOP APPS =====
function renderTopApps(apps) {
    const slider = document.getElementById('topAppsSlider');
    if (!slider) return;
    
    const top = apps.filter(app => app.top).slice(0, 10);
    
    if (top.length === 0) {
        slider.innerHTML = '<div class="loading">No top apps yet</div>';
        return;
    }
    
    slider.innerHTML = top.map(app => `
        <div class="top-app-card" onclick="openApp('${app.id}')">
            <div class="img-wrap">
                <img src="${app.icon}" alt="${app.name}">
                <span class="badge-editor">Editor's Choice</span>
                <span class="badge-premium">PREMIUM</span>
            </div>
            <h3>${app.name}</h3>
            <p>${app.category}</p>
        </div>
    `).join('');
}

// ===== RENDER LATEST GAMES =====
function renderLatestGames(apps) {
    const list = document.getElementById('latestGames');
    if (!list) return;
    
    const games = apps.filter(app => app.type === 'game').slice(0, 6);
    
    if (games.length === 0) {
        list.innerHTML = '<div class="loading">No games yet</div>';
        return;
    }
    
    list.innerHTML = games.map(app => `
        <div class="app-list-item" onclick="openApp('${app.id}')">
            <img src="${app.icon}" alt="${app.name}">
            <div class="info">
                <h3>${app.name}</h3>
                <div class="meta">
                    <span>⭐ ${app.rating || '4.0'}</span>
                    <span>•</span>
                    <span>${app.category}</span>
                </div>
                ${app.modInfo ? `<div class="mod-info">${app.modInfo}</div>` : ''}
            </div>
        </div>
    `).join('');
}

// ===== RENDER COLLECTIONS =====
function renderCollections(apps) {
    const grid = document.getElementById('collections');
    if (!grid) return;
    
    const collections = [
        { title: 'Born for Battle', color: 'linear-gradient(135deg, #1e3c72, #2a5298)', count: '+4 more' },
        { title: 'Personalize Beyond', color: 'linear-gradient(135deg, #134e5e, #71b280)', count: '+47 more' },
        { title: 'Grand Theft Auto', color: 'linear-gradient(135deg, #232526, #414345)', count: '+12 more' },
        { title: 'Legendary Pixel Games', color: 'linear-gradient(135deg, #2980b9, #6dd5fa)', count: '+8 more' }
    ];
    
    grid.innerHTML = collections.map(col => `
        <div class="collection-card" style="background: ${col.color}">
            <h3>${col.title}</h3>
            <div class="more-count">${col.count}</div>
        </div>
    `).join('');
}

// ===== EMPTY STATE =====
function showEmpty() {
    const sections = ['featuredSlider', 'topAppsSlider', 'latestGames', 'collections'];
    sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.innerHTML = '<div class="loading">No apps uploaded yet. Visit /admin to add apps.</div>';
        }
    });
}

// ===== OPEN APP PAGE =====
function openApp(id) {
    window.location.href = `/app.html?id=${id}`;
}

// ===== CLOSE MENU WHEN CLICKING OUTSIDE =====
document.addEventListener('click', (e) => {
    const menu = document.getElementById('sideMenu');
    const menuIcon = document.querySelector('.menu-icon');
    if (menu && menu.classList.contains('active') && !menu.contains(e.target) && !menuIcon.contains(e.target)) {
        menu.classList.remove('active');
    }
});

// ===== INIT =====
loadApps();
