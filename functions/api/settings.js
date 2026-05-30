// GET - Load settings (public)
export async function onRequestGet(context) {
    try {
        const { env } = context;
        const data = await env.APPS_DB.get('site_settings');
        const settings = data ? JSON.parse(data) : {
            telegramUrl: '',
            whatsappUrl: '',
            telegramText: 'Join our Telegram Channel',
            whatsappText: 'Chat with us on WhatsApp',
            showTelegram: false,
            showWhatsapp: false
        };
        return new Response(JSON.stringify({ success: true, settings }), {
            status: 200,
            headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=30' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ success: false, settings: {} }), {
            status: 500, headers: { 'Content-Type': 'application/json' }
        });
    }
}

// POST - Save settings (admin only)
export async function onRequestPost(context) {
    try {
        const { request, env } = context;
        const auth = request.headers.get('Authorization');
        if (!auth || !auth.startsWith('Bearer ')) {
            return new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), {
                status: 401, headers: { 'Content-Type': 'application/json' }
            });
        }
        const settings = await request.json();
        await env.APPS_DB.put('site_settings', JSON.stringify(settings));
        return new Response(JSON.stringify({ success: true, message: 'Settings saved' }), {
            status: 200, headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ success: false, message: error.message }), {
            status: 500, headers: { 'Content-Type': 'application/json' }
        });
    }
}
