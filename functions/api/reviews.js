// GET - Load reviews for an app (public)
export async function onRequestGet(context) {
    try {
        const { request, env } = context;
        const url = new URL(request.url);
        const appId = url.searchParams.get('appId');
        const data = await env.APPS_DB.get('all_reviews');
        const allReviews = data ? JSON.parse(data) : [];
        const reviews = appId ? allReviews.filter(r => r.appId === appId) : allReviews;
        return new Response(JSON.stringify({ success: true, reviews }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ success: false, reviews: [] }), {
            status: 500, headers: { 'Content-Type': 'application/json' }
        });
    }
}

// POST - Add review (public)
export async function onRequestPost(context) {
    try {
        const { request, env } = context;
        const review = await request.json();
        if (!review.appId || !review.rating || !review.comment || !review.name) {
            return new Response(JSON.stringify({ success: false, message: 'Missing fields' }), {
                status: 400, headers: { 'Content-Type': 'application/json' }
            });
        }
        review.id = 'rev_' + Date.now();
        review.createdAt = Date.now();
        const data = await env.APPS_DB.get('all_reviews');
        let reviews = data ? JSON.parse(data) : [];
        reviews.unshift(review);
        await env.APPS_DB.put('all_reviews', JSON.stringify(reviews));
        return new Response(JSON.stringify({ success: true, review }), {
            status: 200, headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ success: false, message: error.message }), {
            status: 500, headers: { 'Content-Type': 'application/json' }
        });
    }
}

// DELETE - Remove review (admin only)
export async function onRequestDelete(context) {
    try {
        const { request, env } = context;
        const auth = request.headers.get('Authorization');
        if (!auth || !auth.startsWith('Bearer ')) {
            return new Response(JSON.stringify({ success: false }), { status: 401 });
        }
        const url = new URL(request.url);
        const id = url.searchParams.get('id');
        const data = await env.APPS_DB.get('all_reviews');
        let reviews = data ? JSON.parse(data) : [];
        reviews = reviews.filter(r => r.id !== id);
        await env.APPS_DB.put('all_reviews', JSON.stringify(reviews));
        return new Response(JSON.stringify({ success: true }), {
            status: 200, headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ success: false }), { status: 500 });
    }
}
