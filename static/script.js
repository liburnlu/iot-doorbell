let currentPage = 1;
const pageSize = 12;

async function loadGallery(page) {
    const grid = document.getElementById('image-grid');
    const pageLabel = document.getElementById('pageLabel');
    
    // 1. Update the label immediately so the user sees the change
    pageLabel.innerText = `Page ${page}`;
    
    grid.innerHTML = `<div class="col-span-full text-center py-20 text-gray-500 animate-pulse font-mono">Loading Page ${page}...</div>`;

    try {
        const response = await fetch(`/images?page=${page}&page_size=${pageSize}`);
        const images = await response.json();

        grid.innerHTML = ''; 

        if (images.length === 0) {
            grid.innerHTML = `<div class="col-span-full text-center py-20 text-gray-500">No more images found.</div>`;
            return;
        }

        images.forEach(img => {
            const fileName = img.name || 'Unnamed Event';
            const dateStr = img.created_at ? new Date(img.created_at).toLocaleString() : 'Date Unknown';

            // FIXED: Card is now Dark (#232323) so white text shows up perfectly
            const card = `
                <div class="group bg-[#232323] border border-[#2e2e2e] rounded-lg overflow-hidden hover:border-emerald-500/50 transition-all duration-200">
                    <div class="aspect-square relative overflow-hidden bg-[#171717]">
                        <img src="${img.url}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                    </div>
                    <div class="p-3">
                        <p class="text-sm font-medium text-white truncate" title="${fileName}">${fileName}</p>
                        <p class="text-xs text-gray-500 mt-1">${dateStr}</p>
                    </div>
                </div>
            `;
            grid.innerHTML += card;
        });

    } catch (err) {
        console.error("Pagination Error:", err);
        grid.innerHTML = `<div class="col-span-full text-center py-20 text-red-500">Error connecting to backend.</div>`;
    }
}

// FIXED: Global function to handle incrementing
function changePage(step) {
    const newPage = currentPage + step;
    
    if (newPage >= 1) {
        currentPage = newPage; // Update the global variable
        console.log("Moving to page:", currentPage);
        loadGallery(currentPage);
    }
}

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
    loadGallery(currentPage);
});