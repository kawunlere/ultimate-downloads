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

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDark ? 'true' : 'false');
    const btn = document.querySelector('.dark-toggle i');
    if (btn) btn.className = isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
}

function loadDarkMode() {
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
        const btn = document.querySelector('.dark-toggle i');
        if (btn) btn.className = 'fa-solid fa-sun';
    }
}

function toggleNotifications() {
    const dropdown = document.getElementById('notifDropdown');
    if (dropdown) dropdown.classList.toggle('active');
    markNotificationsRead();
}

async function loadNotifications() {
    try {
        const res = await fetch('/api/apps');
        const data = await res.json();
        const apps = data.apps || [];
        const recent = apps.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).slice(0, 8);
        
        const lastSeen = parseInt(localStorage.getItem('lastNotifSeen') || '0');
        const unreadCount = recent.filter(a => (a.createdAt || 0) > lastSeen).length;
        
        const badge = document.getElementById('notifBadge');
        if (badge) {
            if (unreadCount > 0) { badge.textContent = unreadCount; badge.style.display = 'block'; }
            else { badge.style.display = 'none'; }
        }
        
        const list = document.getElementById('notifList');
        if (!list) return;
        if (recent.length === 0) {
            list.innerHTML = '<div class="notif-empty"><i class="fa-solid fa-bell-slash" style="font-size:30px;color:#ddd;display:block;margin-bottom:10px;"></i>No notifications yet</div>';
            return;
        }
        let html = '';
        recent.forEach(app => {
            const timeAgo = getTimeAgo(app.createdAt);
            html += '<div class="notif-item" onclick="window.location.href=\'/app.html?id=' + app.id + '\'"><img src="' + app.icon + '"><div class="notif-content"><h5>New: ' + app.name + '</h5><p>' + app.category + ' • ' + timeAgo + '</p></div></div>';
        });
        list.innerHTML = html;
    } catch (e) {}
}

function getTimeAgo(timestamp) {
    if (!timestamp) return 'Recently';
    const diff = Math.floor((Date.now() - timestamp) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return Math.floor(diff/60) + 'm ago';
    if (diff < 86400) return Math.floor(diff/3600) + 'h ago';
    if (diff < 604800) return Math.floor(diff/86400) + 'd ago';
    return new Date(timestamp).toLocaleDateString();
}

function markNotificationsRead() {
    localStorage.setItem('lastNotifSeen', Date.now().toString());
    const badge = document.getElementById('notifBadge');
    if (badge) badge.style.display = 'none';
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
        html += '<div class="search-result-item" onclick="window.location.href=\'/app.html?id=' + app.id + '\'"><img src="' + app.icon + '"><div class="info"><h4>' + app.name + '</h4><p>' + (app.type === 'game' ? '🎮' : '📱') + ' ' + app.category + '</p></div></div>';
    });
    matchedNews.forEach(n => {
        html += '<div class="search-result-item" onclick="window.location.href=\'/news-detail.html?id=' + n.id + '\'"><div style="width:40px;height:40px;border-radius:10px;background:' + (n.color || '#7ac142') + ';display:flex;align-items:center;justify-content:center;color:#fff;"><i class="fa-solid fa-newspaper"></i></div><div class="info"><h4>' + n.title + '</h4><p>News</p></div></div>';
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
        html += '<div class="hero-slide ' + (i === 0 ? 'active' : '') + '" style="' + bgStyle + '" onclick="openApp(\'' + app.id + '\')">' + overlay + '<div class="hero-slide-content"><span class="tag"><i class="fa-solid fa-star"></i> FEATURED</span><h2>' + app.name + '</h2><p>' + app.category + ' • ' + (app.modInfo || 'Premium Unlocked') + '</p><span class="btn-hero"><i class="fa-solid fa-download"></i> Download</span></div><img src="' + app.icon + '" class="hero-slide-icon"></div>';
    });
    slider.innerHTML = html;
    let dotsHtml = '';
    featured.forEach((_, i) => { dotsHtml += '<div class="hero-dot ' + (i === 0 ? 'active' : '') + '" onclick="goToSlide(' + i + ')"></div>'; });
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
            renderTrending(data.apps);
            renderFeatured(data.apps);
            renderTopApps(data.apps);
            renderLatestGames(data.apps);
            renderRecentlyViewed(data.apps);
            renderCollections(colsData.collections || [], data.apps);
        } else { showEmpty(); }
    } catch (error) { showEmpty(); }
}

function renderTrending(apps) {
    const slider = document.getElementById('trendingSlider');
    if (!slider) return;
    const trending = [...apps].sort((a, b) => (b.downloads || 0) - (a.downloads || 0)).slice(0, 10);
    if (trending.length === 0 || trending.every(a => !a.downloads)) {
        slider.innerHTML = '<div class="loading">No downloads yet</div>';
        return;
    }
    let html = '';
    trending.forEach((app, i) => {
        html += '<div class="top-app-card" onclick="openApp(\'' + app.id + '\')"><div class="img-wrap"><img src="' + app.icon + '"><span class="badge-editor">#' + (i+1) + ' Trending</span></div><h3>' + app.name + '</h3><p>' + (app.downloads || 0) + ' downloads</p></div>';
    });
    slider.innerHTML = html;
}

function renderFeatured(apps) {
    const slider = document.getElementById('featuredSlider');
    if (!slider) return;
    const featured = apps.filter(a => a.featured).slice(0, 5);
    if (featured.length === 0) { slider.innerHTML = '<div class="loading">No featured apps yet</div>'; return; }
    let html = '';
    featured.forEach(app => {
        const bg = app.background ? 'background: url(\'' + app.background + '\') center/cover;' : 'background: linear-gradient(135deg, #ff6b6b, #ee5a6f);';
        html += '<div class="featured-card" onclick="openApp(\'' + app.id + '\')" style="' + bg + '"><div class="featured-card-info"><img src="' + app.icon + '"><div><h3>' + app.name + '</h3><p>' + app.category + '</p></div></div></div>';
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
        const editorBadge = app.editorChoice ? '<span class="badge-editor">Editor Choice</span>' : '';
        const paidBadge = app.paid ? '<span class="badge-premium">PAID</span>' : '<span class="badge-premium">PREMIUM</span>';
        html += '<div class="top-app-card" onclick="openApp(\'' + app.id + '\')"><div class="img-wrap"><img src="' + app.icon + '">' + editorBadge + paidBadge + '</div><h3>' + app.name + '</h3><p>' + app.category + '</p></div>';
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
        html += '<div class="app-list-item" onclick="openApp(\'' + app.id + '\')"><img src="' + app.icon + '"><div class="info"><h3>' + app.name + '</h3><div class="meta"><span><i class="fa-solid fa-star" style="color:#ff7a3d;"></i> ' + (app.rating || '4.0') + '</span><span>•</span><span>' + app.category + '</span></div>' + (app.modInfo ? '<div class="mod-info">' + app.modInfo + '</div>' : '') + '</div></div>';
    });
    list.innerHTML = html;
}

function renderRecentlyViewed(apps) {
    const slider = document.getElementById('recentlyViewed');
    if (!slider) return;
    const recentIds = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    if (recentIds.length === 0) { if (slider.parentElement) slider.parentElement.style.display = 'none'; return; }
    const recent = recentIds.map(id => apps.find(a => a.id === id)).filter(a => a).slice(0, 10);
    if (recent.length === 0) { if (slider.parentElement) slider.parentElement.style.display = 'none'; return; }
    let html = '';
    recent.forEach(app => {
        html += '<div class="top-app-card" onclick="openApp(\'' + app.id + '\')"><div class="img-wrap"><img src="' + app.icon + '"></div><h3>' + app.name + '</h3><p>' + app.category + '</p></div>';
    });
    slider.innerHTML = html;
}

function renderCollections(collections, allApps) {
    const grid = document.getElementById('collections');
    if (!grid) return;
    if (collections.length === 0) { grid.innerHTML = '<div class="loading">No collections yet.</div>'; return; }
    let html = '';
    collections.forEach(col => {
        const colApps = (col.appIds || []).map(id => allApps.find(a => a.id === id)).filter(a => a).slice(0, 3);
        const moreCount = Math.max(0, (col.appIds || []).length - 3);
        let iconsHtml = '';
        colApps.forEach(a => { iconsHtml += '<img src="' + a.icon + '" style="width:35px;height:35px;border-radius:8px;border:2px solid #fff;">'; });
        html += '<div class="collection-card" style="background: url(\'' + col.background + '\') center/cover;" onclick="window.location.href=\'/collection.html?id=' + col.id + '\'"><div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(0,0,0,0.2), rgba(0,0,0,0.7));"></div><h3 style="position:relative;z-index:2;">' + col.title + '</h3><div style="position:absolute;bottom:15px;left:15px;display:flex;gap:6px;z-index:2;">' + iconsHtml + '</div>' + (moreCount > 0 ? '<div class="more-count" style="z-index:2;">+' + moreCount + ' more</div>' : '') + '</div>';
    });
    grid.innerHTML = html;
}

function showEmpty() {
    const sections = ['heroSlider', 'trendingSlider', 'featuredSlider', 'topAppsSlider', 'latestGames', 'collections'];
    sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = '<div class="loading">No apps yet. Visit /admin to add apps.</div>';
    });
}

function openApp(id) {
    let recent = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    recent = recent.filter(r => r !== id);
    recent.unshift(id);
    if (recent.length > 10) recent = recent.slice(0, 10);
    localStorage.setItem('recentlyViewed', JSON.stringify(recent));
    window.location.href = '/app.html?id=' + id;
}

async function loadFloatingButtons() {
    try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        const s = data.settings || {};
        if (!s.showTelegram && !s.showWhatsapp) return;
        let html = '<div class="floating-buttons">';
        if (s.showWhatsapp && s.whatsappUrl) html += '<a href="' + s.whatsappUrl + '" target="_blank" class="float-btn wa"><i class="fa-brands fa-whatsapp"></i></a>';
        if (s.showTelegram && s.telegramUrl) html += '<a href="' + s.telegramUrl + '" target="_blank" class="float-btn tg"><i class="fa-brands fa-telegram"></i></a>';
        html += '</div>';
        const div = document.createElement('div');
        div.innerHTML = html;
        document.body.appendChild(div.firstChild);
    } catch (e) {}
}

document.addEventListener('click', (e) => {
    const menu = document.getElementById('sideMenu');
    const menuIcon = document.querySelector('.menu-icon');
    if (menu && menu.classList.contains('active') && !menu.contains(e.target) && !menuIcon.contains(e.target)) {
        menu.classList.remove('active');
    }
    const notif = document.getElementById('notifDropdown');
    const notifIcon = document.querySelector('.notif-icon');
    if (notif && notif.classList.contains('active') && !notif.contains(e.target) && notifIcon && !notifIcon.contains(e.target)) {
        notif.classList.remove('active');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    loadDarkMode();
    loadSearchData();
    loadFloatingButtons();
    loadNotifications();
    const globalSearch = document.getElementById('globalSearch');
    if (globalSearch) {
        globalSearch.addEventListener('input', (e) => performGlobalSearch(e.target.value));
    }
});

if (document.getElementById('heroSlider')) {
    loadApps();
}
