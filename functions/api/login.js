// ===== ADMIN LOGIN API =====
export async function onRequestPost(context) {
    try {
        const { request } = context;
        const body = await request.json();
        const { username, password } = body;
        
        // Your secret credentials
        const ADMIN_USERNAME = "olamide";
        const ADMIN_PASSWORD = "Olamide@2501#Ultimate";
        
        // Check credentials
        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
            // Generate a simple token
            const token = btoa(`${username}:${Date.now()}:${Math.random()}`);
            
            return new Response(JSON.stringify({
                success: true,
                token: token,
                message: "Login successful"
            }), {
                status: 200,
                headers: { 
                    'Content-Type': 'application/json',
                    'Set-Cookie': `admin_token=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400`
                }
            });
        }
        
        // Wrong credentials
        return new Response(JSON.stringify({
            success: false,
            message: "Invalid username or password"
        }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            message: "Server error"
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
