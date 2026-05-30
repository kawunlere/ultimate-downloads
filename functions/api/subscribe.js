// POST - Add email subscriber
export async function onRequestPost(context) {
    try {
        const { request, env } = context;
        const { email } = await request.json();
        if (!email || !email.includes('@')) {
            return new Response(JSON.stringify({ success: false, message: 'Invalid email' }), {
                status: 400, headers: { 'Content-Type': 'application/json' }
            });
        }
        const data = await env.APPS_DB.get('all_subscribers');
        let subscribers = data ? JSON.parse(data) : [];
        if (subscribers.find(s => s.email === email)) {
            return new Response(JSON.stringify({ success: false, message: 'Already subscribed' }), {
                status: 200, headers: { 'Content-Type': 'application/json' }
            });
        }
        subscribers.unshift({ email, createdAt: Date.now() });
        await env.APPS_DB.put('all_subscribers', JSON.stringify(subscribers));
        return new Response(JSON.stringify({ success: true, message: 'Subscribed!' }), {
            status: 200, headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ success: false, message: error.message }), {
            status: 500, headers: { 'Content-Type': 'application/json' }
        });
    }
}

// GET - List subscribers (admin only)
export async function onRequestGet(context) {
    try {
        const { request, env } = context;
        const auth = request.headers.get('Authorization');
        if (!auth || !auth.startsWith('Bearer ')) {
            return new Response(JSON.stringify({ success: false }), { status: 401 });
        }
        const data = await env.APPS_DB.get('all_subscribers');
        const subscribers = data ? JSON.parse(data) : [];
        return new Response(JSON.stringify({ success: true, subscribers }), {
            status: 200, headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ success: false }), { status: 500 });
    }
}
