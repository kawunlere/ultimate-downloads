// ===== NEWS API =====

// GET - Load all news (public)
export async function onRequestGet(context) {
    try {
        const { env } = context;
        const newsData = await env.APPS_DB.get('all_news');
        const news = newsData ? JSON.parse(newsData) : [];
        
        return new Response(JSON.stringify({
            success: true,
            news: news
        }), {
            status: 200,
            headers: { 
                'Content-Type': 'application/json',
                'Cache-Control': 'public, max-age=60'
            }
        });
    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            news: [],
            message: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// POST - Save news (admin only)
export async function onRequestPost(context) {
    try {
        const { request, env } = context;
        
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return new Response(JSON.stringify({
                success: false,
                message: 'Unauthorized'
            }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        const newPost = await request.json();
        
        if (!newPost.title || !newPost.content) {
            return new Response(JSON.stringify({
                success: false,
                message: 'Missing required fields'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        const newsData = await env.APPS_DB.get('all_news');
        let news = newsData ? JSON.parse(newsData) : [];
        
        const existingIndex = news.findIndex(n => n.id === newPost.id);
        if (existingIndex >= 0) {
            news[existingIndex] = { ...news[existingIndex], ...newPost };
        } else {
            news.unshift(newPost);
        }
        
        await env.APPS_DB.put('all_news', JSON.stringify(news));
        
        return new Response(JSON.stringify({
            success: true,
            message: 'News saved'
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            message: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// DELETE - Remove news (admin only)
export async function onRequestDelete(context) {
    try {
        const { request, env } = context;
        
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return new Response(JSON.stringify({
                success: false,
                message: 'Unauthorized'
            }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        const url = new URL(request.url);
        const id = url.searchParams.get('id');
        
        if (!id) {
            return new Response(JSON.stringify({
                success: false,
                message: 'ID required'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        const newsData = await env.APPS_DB.get('all_news');
        let news = newsData ? JSON.parse(newsData) : [];
        news = news.filter(n => n.id !== id);
        
        await env.APPS_DB.put('all_news', JSON.stringify(news));
        
        return new Response(JSON.stringify({
            success: true,
            message: 'News deleted'
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            message: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
