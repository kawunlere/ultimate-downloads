// ===== APPS API =====
// Handles: GET (load apps), POST (save app), DELETE (remove app)

// GET - Load all apps (public)
export async function onRequestGet(context) {
    try {
        const { env } = context;
        const appsData = await env.APPS_DB.get('all_apps');
        const apps = appsData ? JSON.parse(appsData) : [];
        
        return new Response(JSON.stringify({
            success: true,
            apps: apps
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
            apps: [],
            message: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// POST - Save or update app (admin only)
export async function onRequestPost(context) {
    try {
        const { request, env } = context;
        
        // Check authorization
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
        
        const newApp = await request.json();
        
        // Validation
        if (!newApp.name || !newApp.category || !newApp.icon || !newApp.download) {
            return new Response(JSON.stringify({
                success: false,
                message: 'Missing required fields'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Load existing apps
        const appsData = await env.APPS_DB.get('all_apps');
        let apps = appsData ? JSON.parse(appsData) : [];
        
        // Update if exists, otherwise add new
        const existingIndex = apps.findIndex(a => a.id === newApp.id);
        if (existingIndex >= 0) {
            apps[existingIndex] = { ...apps[existingIndex], ...newApp };
        } else {
            apps.unshift(newApp);
        }
        
        // Save back to KV
        await env.APPS_DB.put('all_apps', JSON.stringify(apps));
        
        return new Response(JSON.stringify({
            success: true,
            message: 'App saved successfully',
            app: newApp
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

// DELETE - Remove app (admin only)
export async function onRequestDelete(context) {
    try {
        const { request, env } = context;
        
        // Check authorization
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
        
        // Get app ID from URL
        const url = new URL(request.url);
        const id = url.searchParams.get('id');
        
        if (!id) {
            return new Response(JSON.stringify({
                success: false,
                message: 'App ID required'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Load and filter apps
        const appsData = await env.APPS_DB.get('all_apps');
        let apps = appsData ? JSON.parse(appsData) : [];
        apps = apps.filter(a => a.id !== id);
        
        // Save back
        await env.APPS_DB.put('all_apps', JSON.stringify(apps));
        
        return new Response(JSON.stringify({
            success: true,
            message: 'App deleted'
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
