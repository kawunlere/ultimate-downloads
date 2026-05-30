function toggleMenu() {
    const menu = document.getElementById('sideMenu');
    if (menu) menu.classList.toggle('active');
}

function toggleSearch() {
    const searchBox = document.getElementById('searchBox');
    if (searchBox) {
        searchBox.classList.toggle('active');
        if (searchBox.classList.contains('active')) {
            const input = searchBox.querySelector('input');
            if (input) input.focus();
        }
    }
}

let allSearchData = { apps: [], news: [] };

async function loadSearchData() {
    try {
        const [appsRes, newsRes] = await Promise.all([fetch('/api/apps'), fetch('/api/news')]);
        const appsData = await appsRes.json();
        const newsData = await newsRes.json();
        allSearchData.apps = appsData.apps || [];
        allSearchData.news = newsData.news || [];
    } catch (e) {}
}

function performGlobalSearch(query) {
    const results = document.getElementById('searchResults');
    if (!results) return;
    if (!query || query.length < 2) { results.classList.remove('active'); results.innerHTML = ''; return; }
    const q = query.toLowerCase();
    const matchedApps = allSearchData.apps.filter(a => a.name.toLowerCase().includes(q) || a.category.toLowerCase().includes(q)).slice(0, 5);
    const matchedNews = allSearchData.news.filter(n => n.title.toLowerCase().includes(q)).slice(0, 3);
    if (matchedApps.length === 0 && matchedNews.length === 0) {
        results.innerHTML = '<div class="search-no-results">No results found</div>';
        results.classList.add('active');
        return;
    }
    let html = '';
    matchedApps.forEach(app => {
        html += '<div class="search-result-item" onclick="window.location.href=\'/app.html?id=' + app.id + '\'">';
        html += '<img src="' + app.icon + '">';
        html += '<div class="info"><h4>' + app.name + '</h4><p>' + (app.type === 'game' ? '🎮' : '📱') + ' ' + app.category + '</p></div>';
        html += '</div>';
    });
    matchedNews.forEach(n => {
        html += '<div class="search-result-item" onclick="window.location.href=\'/news-detail.html?id=' + n.id + '\'">';
        html += '<div style="width:40px;height:40px;border-radius:10px;background:' + (n.color || '#7ac142') + ';display:flex;align-items:center;justify-content:center;color:#fff;"><i class="fa-solid fa-newspaper"></i></div>';
        html += '<div class="info"><h4>' + n.title + '</h4><p>📰 News</p></div>';
        html += '</div>';
    });
    results.innerHTML = html;
    results.classList.add('active');
}

let currentSlide = 0;
let slideInterval;

function renderHeroSlider(apps) {
    const slider = document.getElementById('heroSlider');
    const dots = document.getElementById('heroDots');
    if (!slider) return;
    const featured = apps.filter(a => a.featured).slice(0, 5);
    if (featured.length === 0) { slider.innerHTML = '<div class="loading">No featured apps yet</div>'; return; }
    const colors = ['linear-gradient(135deg, #667eea, #764ba2)','linear-gradient(135deg, #f093fb, #f5576c)','linear-gradient(135deg, #4facfe, #00f2fe)','linear-gradient(135deg, #43e97b, #38f9d7)','linear-gradient(135deg, #fa709a, #fee140)'];
    
    let html = '';
    featured.forEach((app, i) => {
        const bgStyle = app.background ? 'background: url(\'' + app.background + '\') center/cover;' : 'background: ' + colors[i % colors.length] + ';';
        const overlay = app.background ? '<div style="position:absolute;inset:0;background:linear-gradient(135deg, rgba(0,0,0,0.5), rgba(0,0,0,0.3));"></div>' : '';
        const active = i === 0 ? ' active' : '';
        html += '<div class="hero-slide' + active + '" style="' + bgStyle + '" onclick="openApp(\'' + app.id + '\')">';
        html += overlay;
        html += '<div class="hero-slide-content">';
        html += '<span class="tag">⭐ FEATURED</span>';
        html += '<h2>' + app.name + '</h2>';
        html += '<p>' + app.category + ' • ' + (app.modInfo || 'Premium Unlocked') + '</p>';
        html += '<span class="btn-hero"><i class="fa-solid fa-download"></i> Download</span>';
        html += '</div>';
        html += '<img src="' + app.icon + '" class="hero-slide-icon">';
        html += '</div>';
    });
    slider.innerHTML = html;
    
    let dotsHtml = '';
    featured.forEach((_, i) => {
        const active = i === 0 ? ' active' : '';
        dotsHtml += '<div class="hero-dot' + active + '" onclick="goToSlide(' + i + ')"></div>';
    });
    dots.innerHTML = dotsHtml;
    
    if (slideInterval) clearInterval(slideInterval);
    slideInterval = setInterval(() => nextSlide(featured.length), 4000);
}

function nextSlide(total) { currentSlide = (currentSlide + 1) % total; updateSlides(); }
function goToSlide(index) {
    currentSlide = index; updateSlides();
    if (slideInterval) { clearInterval(slideInterval); const total = document.querySelectorAll('.hero-slide').length; slideInterval = setInterval(() => nextSlide(total), 4000); }
}
function updateSlides() {
    document.querySelectorAll('.hero-slide').forEach((s, i) => s.classList.toggle('active', i === currentSlide));
    document.querySelectorAll('.hero-dot').forEach((d, i) => d.classList.toggle('active', i === currentSlide));
}

async function loadApps() {
    try {
        const [appsRes, colsRes] = await Promise.all([fetch('/api/apps'), fetch('/api/collections')]);
        const data = await appsRes.json();
        const colsData = await colsRes.json();
        if (data.apps && data.apps.length > 0) {
            renderHeroSlider(data.apps);
            renderFeatured(data.apps);
            renderTopApps(data.apps);
            renderLatestGames(data.apps);
            renderCollections(colsData.collections || [], data.apps);
        } else { showEmpty(); }
    } catch (error) { showEmpty(); }
}

function renderFeatured(apps) {
    const slider = document.getElementById('featuredSlider');
    if (!slider) return;
    const featured = apps.filter(a => a.featured).slice(0, 5);
    if (featured.length === 0) { slider.innerHTML = '<div class="loading">No featured apps yet</div>'; return; }
    
    const colors = ['linear-gradient(135deg, #ff6b6b, #ee5a6f)','linear-gradient(135deg, #ff9966, #ff5e62)','linear-gradient(135deg, #fc5c7d, #6a82fb)'];
    
    let html = '';
    featured.forEach((app, i) => {
        const bgStyle = app.background ? 'background-image: url(\'' + app.background + '\');' : 'background: ' + colors[i % colors.length] + ';';
        html += '<div class="featured-card" onclick="openApp(\'' + app.id + '\')" style="' + bgStyle + '">';
        html += '<div class="featured-card-overlay"></div>';
        html += '<div class="featured-card-info">';
        html += '<img src="' + app.icon + '">';
        html += '<div><h3>' + app.name + '</h3><p>' + app.category + '</p></div>';
        html += '</div></div>';
    });
    slider.innerHTML = html;
}

function renderTopApps(apps) {
    const slider = document.getElementById('topAppsSlider');
    if (!slider) return;
    const top = apps.filter(a => a.top).slice(0, 10);
    if (top.length === 0) { slider.innerHTML = '<div class="loading">No top apps yet</div>'; return; }
    
    let html = '';
    top.forEach(app => {
        html += '<div class="top-app-card" onclick="openApp(\'' + app.id + '\')">';
        html += '<div class="img-wrap">';
        html += '<img src="' + app.icon + '">';
        if (app.editorChoice) html += '<span class="badge-editor">Editor Choice</span>';
        if (app.paid) html += '<span class="badge-premium">PAID</span>';
        else html += '<span class="badge-premium">PREMIUM</span>';
        html += '</div>';
        html += '<h3>' + app.name + '</h3>';
        html += '<p>' + app.category + '</p>';
        html += '</div>';
    });
    slider.innerHTML = html;
}

function renderLatestGames(apps) {
    const list = document.getElementById('latestGames');
    if (!list) return;
    const games = apps.filter(a => a.type === 'game').sort((a,b) => (b.createdAt || 0) - (a.createdAt || 0)).slice(0, 6);
    if (games.length === 0) { list.innerHTML = '<div class="loading">No games yet</div>'; return; }
    
    let html = '';
    games.forEach(app => {
        html += '<div class="app-list-item" onclick="openApp(\'' + app.id + '\')">';
        html += '<img src="' + app.icon + '">';
        html += '<div class="info"><h3>' + app.name + '</h3>';
        html += '<div class="meta"><span>⭐ ' + (app.rating || '4.0') + '</span><span>•</span><span>' + app.category + '</span></div>';
        if (app.modInfo) html += '<div class="mod-info">' + app.modInfo + '</div>';
        html += '</div></div>';
    });
    list.innerHTML = html;
}

function renderCollections(collections, allApps) {
    const grid = document.getElementById('collections');
    if (!grid) return;
    if (collections.length === 0) {
        grid.innerHTML = '<div class="loading">No collections yet. Create some in admin.</div>';
        return;
    }
    
    let html = '';
    collections.forEach(col => {
        const colApps = (col.appIds || []).map(id => allApps.find(a => a.id === id)).filter(a => a).slice(0, 3);
        const moreCount = Math.max(0, (col.appIds || []).length - 3);
        html += '<div class="collection-card" style="background-image: url(\'' + col.background + '\');" onclick="window.location.href=\'/collection.html?id=' + col.id + '\'">';
        html += '<div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(0,0,0,0.2), rgba(0,0,0,0.75));"></div>';
        html += '<h3 style="position:relative;z-index:2;">' + col.title + '</h3>';
        html += '<div style="position:absolute;bottom:15px;left:15px;display:flex;gap:6px;z-index:2;">';
        colApps.forEach(a => {
            html += '<img src="' + a.icon + '" style="width:35px;height:35px;border-radius:8px;border:2px solid #fff;">';
        });
        html += '</div>';
        if (moreCount > 0) html += '<div class="more-count" style="z-index:2;">+' + moreCount + ' more</div>';
        html += '</div>';
    });
    grid.innerHTML = html;
}

function showEmpty() {
    const sections = ['heroSlider', 'featuredSlider', 'topAppsSlider', 'latestGames', 'collections'];
    sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = '<div class="loading">No apps uploaded yet. Visit /admin to add apps.</div>';
    });
}

function openApp(id) { window.location.href = '/app.html?id=' + id; }

document.addEventListener('click', (e) => {
    const menu = document.getElementById('sideMenu');
    const menuIcon = document.querySelector('.menu-icon');
    if (menu && menu.classList.contains('active') && !menu.contains(e.target) && !menuIcon.contains(e.target)) {
        menu.classList.remove('active');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    loadSearchData();
    const globalSearch = document.getElementById('globalSearch');
    if (globalSearch) {
        globalSearch.addEventListener('input', (e) => performGlobalSearch(e.target.value));
    }
});

if (document.getElementById('heroSlider')) {
    loadApps();
}
