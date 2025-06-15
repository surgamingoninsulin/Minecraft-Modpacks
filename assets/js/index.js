document.addEventListener('DOMContentLoaded', () => {
    const modpackContainer = document.getElementById('modpack-container');
    const loadingMessage = document.getElementById('loading-message');

    // Fetch modpack data from modpacks.json
    fetch('./assets/json/modpacks.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(modpacksData => {
            if (modpacksData.length > 0) {
                loadingMessage.remove(); // Remove loading message once data is fetched
                renderModpacks(modpacksData);
            } else {
                loadingMessage.textContent = 'Geen modpacks gevonden.';
            }
        })
        .catch(error => {
            console.error('Fout bij het laden van modpacks:', error);
            loadingMessage.textContent = 'Fout bij het laden van modpacks. Probeer het later opnieuw.';
        });

    function renderModpacks(modpacks) {
        modpacks.forEach(modpack => {
            const cardLink = document.createElement('a');
            cardLink.href = modpack.downloadUrl; // The entire card is now the download link
            cardLink.className = "modpack-card bg-white rounded-xl shadow-xl overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-2xl w-full sm:w-64 md:w-72 lg:w-64 xl:w-60 cursor-pointer";
            cardLink.setAttribute('aria-label', `Download ${modpack.name}`); // Accessibility

            cardLink.innerHTML = `
                <img class="modpack-card-image w-full rounded-t-xl" src="${modpack.imageUrl}" alt="Afbeelding van ${modpack.name}" onerror="this.onerror=null;this.src='https://placehold.co/600x400/CCCCCC/000000?text=Afbeelding+niet+gevonden';">
                <div class="p-5 flex flex-col justify-between flex-grow">
                    <div>
                        <h3 class="text-2xl font-bold text-blue-800 mb-2">${modpack.name}</h3>
                        <p class="text-gray-700 text-sm mb-1">
                            <span class="font-semibold">Versie:</span> ${modpack.version}
                        </p>
                        <p class="text-gray-700 text-sm">
                            <span class="font-semibold">Minecraft Versie:</span> ${modpack.mcVersion}
                        </p>
                    </div>
                </div>
            `;
            modpackContainer.appendChild(cardLink);
        });
    }
});
