let currentPage = 1;

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('sb-access-token');
    
    if (!token) {
        window.location.href = '/login';
        return;
    }

    try {
        // _supabase comes from config.js
        const { data: { user }, error } = await _supabase.auth.getUser(token);

        if (error || !user) {
            logout(); // logout comes from config.js
            return;
        }

        document.getElementById('user-email').innerText = user.email;
        document.getElementById('user-name').innerText = user.email.split('@')[0];

        loadGallery(currentPage);

    } catch (err) {
        console.error("Dashboard Init Error:", err);
    }
});

async function loadGallery(page) {
    const grid = document.getElementById('image-grid');
    const pageLabel = document.getElementById('pageLabel');
    
    pageLabel.innerText = `Page ${page}`;
    grid.innerHTML = `<div class="col-span-full text-center py-20 text-gray-500 animate-pulse font-mono">Loading...</div>`;

    try {
        const response = await fetch(`/images?page=${page}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('sb-access-token')}` }
        });

        if (response.status === 401) { logout(); return; }

        const images = await response.json();
        grid.innerHTML = ''; 

        if (!images || images.length === 0) {
            grid.innerHTML = `<div class="col-span-full text-center py-20 text-gray-500">No more images found.</div>`;
            return;
        }

        images.forEach(img => {
            grid.innerHTML += `
                <div class="group bg-[#232323] border border-[#2e2e2e] rounded-lg overflow-hidden hover:border-emerald-500/50 transition-all duration-200">
                    <div class="aspect-square relative overflow-hidden bg-[#171717]">
                        <img src="${img.url}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy">
                    </div>
                    <div class="p-3">
                        <p class="text-sm font-medium text-white truncate">${img.name || 'Capture'}</p>
                        <p class="text-xs text-gray-500 mt-1">${img.created_at ? new Date(img.created_at).toLocaleString() : ''}</p>
                    </div>
                </div>`;
        });
    } catch (err) {
        grid.innerHTML = `<div class="col-span-full text-center py-20 text-red-500">Backend Connection Error.</div>`;
    }
}

function changePage(step) {
    currentPage += step;
    if (currentPage < 1) currentPage = 1;
    loadGallery(currentPage);
}

// Auto-refresh the gallery every 60 seconds
setInterval(() => {
    console.log("Checking for new captures...");
    loadGallery(currentPage);
}, 60000);