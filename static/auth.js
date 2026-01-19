// LOGIN
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const { data, error } = await _supabase.auth.signInWithPassword({ email, password });

    if (error) {
        alert(error.message);
    } else {
        localStorage.setItem('sb-access-token', data.session.access_token);
        window.location.href = '/dashboard';
    }
});

// REGISTER
document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const { error } = await _supabase.auth.signUp({ email, password });

    if (error) alert(error.message);
    else {
        alert("Registration successful! Check your email or try logging in.");
        window.location.href = '/login';
    }
});