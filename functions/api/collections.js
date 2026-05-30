// GET - Load all collections
export async function onRequestGet(context) {
    try {
        const { env } = context;
        const data = await env.APPS_DB.get('all_collections');
        const collections = data ? JSON.parse(data) : [];
        return new Response(JSON.stringify({ success: true, collections }), {
            status: 200,
            headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=60' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ success: false, collections: [] }), {
            status: 500, headers: { 'Content-Type': 'application/json' }
        });
    }
}

// POST - Save collection
export async function onRequestPost(context) {
    try {
        const { request, env } = context;
        const auth = request.headers.get('Authorization');
        if (!auth || !auth.startsWith('Bearer ')) {
            return new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), {
                status: 401, headers: { 'Content-Type': 'application/json' }
            });
        }
        const newCol = await request.json();
        if (!newCol.title || !newCol.background) {
            return new Response(JSON.stringify({ success: false, message: 'Missing fields' }), {
                status: 400, headers: { 'Content-Type': 'application/json' }
            });
        }
        const data = await env.APPS_DB.get('all_collections');
        let collections = data ? JSON.parse(data) : [];
        const idx = collections.findIndex(c => c.id === newCol.id);
        if (idx >= 0) collections[idx] = { ...collections[idx], ...newCol };
        else collections.unshift(newCol);
        await env.APPS_DB.put('all_collections', JSON.stringify(collections));
        return new Response(JSON.stringify({ success: true, message: 'Saved' }), {
            status: 200, headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ success: false, message: error.message }), {
            status: 500, headers: { 'Content-Type': 'application/json' }
        });
    }
}

// DELETE - Remove collection
export async function onRequestDelete(context) {
    try {
        const { request, env } = context;
        const auth = request.headers.get('Authorization');
        if (!auth || !auth.startsWith('Bearer ')) {
            return new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), {
                status: 401, headers: { 'Content-Type': 'application/json' }
            });
        }
        const url = new URL(request.url);
        const id = url.searchParams.get('id');
        const data = await env.APPS_DB.get('all_collections');
        let collections = data ? JSON.parse(data) : [];
        collections = collections.filter(c => c.id !== id);
        await env.APPS_DB.put('all_collections', JSON.stringify(collections));
        return new Response(JSON.stringify({ success: true }), {
            status: 200, headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ success: false }), {
            status: 500, headers: { 'Content-Type': 'application/json' }
        });
    }
}
