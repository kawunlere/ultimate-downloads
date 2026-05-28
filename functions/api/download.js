export async function onRequestPost(context) {
    try {
        const { request, env } = context;
        const { id } = await request.json();
        if (!id) return new Response(JSON.stringify({ success: false }), { status: 400 });
        
        const appsData = await env.APPS_DB.get('all_apps');
        let apps = appsData ? JSON.parse(appsData) : [];
        const idx = apps.findIndex(a => a.id === id);
        if (idx >= 0) {
            apps[idx].downloads = (apps[idx].downloads || 0) + 1;
            await env.APPS_DB.put('all_apps', JSON.stringify(apps));
            return new Response(JSON.stringify({ success: true, downloads: apps[idx].downloads }), {
                status: 200, headers: { 'Content-Type': 'application/json' }
            });
        }
        return new Response(JSON.stringify({ success: false }), { status: 404 });
    } catch (error) {
        return new Response(JSON.stringify({ success: false }), { status: 500 });
    }
}
