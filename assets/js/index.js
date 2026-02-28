
(function () {
    "use strict";

    const STATUS_VALUES = ["all", "stable", "beta", "archived"];
    const VALID_DATA_STATUS = ["stable", "beta", "archived"];
    const IMAGE_FALLBACK = "./assets/img/paper.jpg";
    const LANG_STORAGE_KEY = "surgoi_lang";
    const GH_RELEASES_API = "https://api.github.com/repos/surgamingoninsulin/Minecraft-Modpacks/releases";

    const DEFAULT_CONTENT = {
        hero: {
            eyebrow: { nl: "Sur Gaming On Insulin", en: "Sur Gaming On Insulin" },
            title: { nl: "Minecraft Modpacks op een plek", en: "Minecraft Modpacks in one place" },
            subtitle: {
                nl: "Alles op een pagina zonder menu.",
                en: "Everything on one page with no menu."
            }
        },
        sections: {
            featured: {
                title: { nl: "Uitgelichte Modpacks", en: "Featured Modpacks" },
                subtitle: { nl: "Handmatig gekozen highlights.", en: "Hand-picked highlights." }
            },
            allModpacks: {
                title: { nl: "Alle Modpacks", en: "All Modpacks" },
                subtitle: { nl: "Filter op tags, versie en status.", en: "Filter by tags, version, and status." }
            },
            install: {
                title: { nl: "Installatiegids", en: "Install Guide" },
                subtitle: { nl: "Korte stappen om te starten.", en: "Short steps to get started." }
            },
            updates: {
                title: { nl: "Updates en Changelog", en: "Updates and Changelog" },
                subtitle: { nl: "Laatste projectwijzigingen.", en: "Latest project changes." }
            }
        },
        filters: {
            searchLabel: { nl: "Zoeken", en: "Search" },
            searchPlaceholder: { nl: "Zoek op naam of beschrijving...", en: "Search by name or description..." },
            tagLabel: { nl: "Tags", en: "Tags" },
            mcVersionLabel: { nl: "Minecraft-versie", en: "Minecraft version" },
            statusLabel: { nl: "Status", en: "Status" },
            clear: { nl: "Filters wissen", en: "Clear filters" },
            allMcVersions: { nl: "Alle versies", en: "All versions" },
            statusOptions: {
                all: { nl: "Alle statussen", en: "All statuses" },
                stable: { nl: "Stabiel", en: "Stable" },
                beta: { nl: "Beta", en: "Beta" },
                archived: { nl: "Gearchiveerd", en: "Archived" }
            }
        },
        card: {
            featuredBadge: { nl: "Uitgelicht", en: "Featured" },
            versionLabel: { nl: "Versie", en: "Version" },
            mcVersionLabel: { nl: "MC", en: "MC" },
            loaderLabel: { nl: "Loader", en: "Loader" },
            sizeLabel: { nl: "Grootte", en: "Size" },
            updatedLabel: { nl: "Bijgewerkt", en: "Updated" },
            downloadCta: { nl: "Download", en: "Download" }
        },
        states: {
            errorModpacks: {
                nl: "Modpacks konden niet geladen worden. Probeer later opnieuw.",
                en: "Modpacks could not be loaded. Please try again later."
            },
            errorUpdates: { nl: "Updates konden niet geladen worden.", en: "Updates could not be loaded." },
            featuredEmpty: {
                nl: "Er zijn op dit moment geen uitgelichte modpacks.",
                en: "There are no featured modpacks right now."
            },
            noResults: {
                nl: "Geen modpacks gevonden met deze filters.",
                en: "No modpacks match these filters."
            },
            resultsCount: { nl: "{count} modpacks gevonden", en: "{count} modpacks found" },
            clearInline: { nl: "Wis filters", en: "Clear filters" },
            updatesEmpty: { nl: "Nog geen updates beschikbaar.", en: "No updates available yet." }
        },
        install: {
            intro: {
                nl: "Download je modpack en importeer het in je launcher.",
                en: "Download your modpack and import it in your launcher."
            },
            steps: [],
            tipsTitle: { nl: "Veelvoorkomende fixes", en: "Common fixes" },
            tips: []
        },
        updates: { readMore: { nl: "Lees meer", en: "Read more" } },
        footer: {
            title: { nl: "Klaar om te spelen?", en: "Ready to play?" },
            text: { nl: "Pak de nieuwste release via GitHub.", en: "Get the latest release through GitHub." },
            buttonLabel: { nl: "Open GitHub Releases", en: "Open GitHub Releases" },
            buttonUrl: "https://github.com/surgamingoninsulin/Minecraft-Modpacks/releases",
            copyright: {
                nl: "Sur Gaming On Insulin - Alle rechten voorbehouden.",
                en: "Sur Gaming On Insulin - All rights reserved."
            }
        }
    };

    const app = {
        state: {
            lang: loadLanguage(),
            query: "",
            selectedTags: new Set(),
            selectedMcVersion: "all",
            selectedStatus: "all"
        },
        content: DEFAULT_CONTENT,
        modpacks: [],
        updates: [],
        facets: { tags: [], mcVersions: [] },
        errors: { content: false, modpacks: false, updates: false }
    };

    const elements = {
        heroEyebrow: document.getElementById("hero-eyebrow"),
        heroTitle: document.getElementById("hero-title"),
        heroSubtitle: document.getElementById("hero-subtitle"),
        langButtons: Array.from(document.querySelectorAll(".lang-btn")),
        featuredTitle: document.getElementById("featured-title"),
        featuredSubtitle: document.getElementById("featured-subtitle"),
        featuredEmpty: document.getElementById("featured-empty"),
        featuredGrid: document.getElementById("featured-grid"),
        allModpacksTitle: document.getElementById("all-modpacks-title"),
        allModpacksSubtitle: document.getElementById("all-modpacks-subtitle"),
        searchLabel: document.getElementById("search-label"),
        searchInput: document.getElementById("search-input"),
        tagLabel: document.getElementById("tag-label"),
        tagChips: document.getElementById("tag-chips"),
        mcVersionLabel: document.getElementById("mc-version-label"),
        mcVersionSelect: document.getElementById("mc-version-select"),
        statusLabel: document.getElementById("status-label"),
        statusSelect: document.getElementById("status-select"),
        clearFilters: document.getElementById("clear-filters"),
        resultsCount: document.getElementById("results-count"),
        allModpacksGrid: document.getElementById("all-modpacks-grid"),
        allModpacksEmpty: document.getElementById("all-modpacks-empty"),
        installTitle: document.getElementById("install-title"),
        installSubtitle: document.getElementById("install-subtitle"),
        installIntro: document.getElementById("install-intro"),
        installSteps: document.getElementById("install-steps"),
        installTipsTitle: document.getElementById("install-tips-title"),
        installTipsList: document.getElementById("install-tips-list"),
        updatesTitle: document.getElementById("updates-title"),
        updatesSubtitle: document.getElementById("updates-subtitle"),
        updatesEmpty: document.getElementById("updates-empty"),
        updatesList: document.getElementById("updates-list"),
        footerTitle: document.getElementById("footer-title"),
        footerText: document.getElementById("footer-text"),
        footerButton: document.getElementById("footer-button"),
        copyrightYear: document.getElementById("copyright-year"),
        copyrightText: document.getElementById("copyright-text")
    };

    document.addEventListener("DOMContentLoaded", init);

    async function init() {
        elements.copyrightYear.textContent = String(new Date().getFullYear());
        bindEvents();

        const [contentResult, modpacksResult, updatesResult] = await Promise.all([
            fetchJson("./assets/json/content.json"),
            fetchJson("./assets/json/modpacks.json"),
            fetchUpdatesWithGithubFallback()
        ]);

        if (contentResult.data) {
            app.content = mergeContent(DEFAULT_CONTENT, contentResult.data);
        } else {
            app.errors.content = true;
            console.error("Failed to load content.json", contentResult.error);
        }

        if (modpacksResult.data) {
            app.modpacks = normalizeModpacks(modpacksResult.data);
            app.facets = deriveFacets(app.modpacks);
        } else {
            app.errors.modpacks = true;
            console.error("Failed to load modpacks.json", modpacksResult.error);
        }

        if (updatesResult.data) {
            app.updates = normalizeUpdates(updatesResult.data);
        } else {
            app.errors.updates = true;
            console.error("Failed to load updates", updatesResult.error);
        }

        renderApp();
        setupRevealAnimations();
    }

    function bindEvents() {
        elements.langButtons.forEach((button) => {
            button.addEventListener("click", () => {
                const nextLang = button.dataset.lang;
                if (nextLang !== "nl" && nextLang !== "en") {
                    return;
                }
                if (app.state.lang === nextLang) {
                    return;
                }

                app.state.lang = nextLang;
                localStorage.setItem(LANG_STORAGE_KEY, nextLang);
                renderApp();
            });
        });

        elements.searchInput.addEventListener("input", (event) => {
            app.state.query = event.target.value.trim();
            renderAllModpacks();
        });

        elements.mcVersionSelect.addEventListener("change", (event) => {
            app.state.selectedMcVersion = event.target.value;
            renderAllModpacks();
        });

        elements.statusSelect.addEventListener("change", (event) => {
            app.state.selectedStatus = STATUS_VALUES.includes(event.target.value) ? event.target.value : "all";
            renderAllModpacks();
        });

        elements.clearFilters.addEventListener("click", resetFilters);
    }

    function renderApp() {
        document.documentElement.lang = app.state.lang;
        renderLanguageButtons();
        renderHeroText();
        renderSectionText();
        renderFilterControls();
        renderFeaturedModpacks();
        renderAllModpacks();
        renderInstallGuide();
        renderUpdates();
        renderFooter();
    }

    function renderLanguageButtons() {
        elements.langButtons.forEach((button) => {
            const isActive = button.dataset.lang === app.state.lang;
            button.classList.toggle("is-active", isActive);
            button.setAttribute("aria-pressed", String(isActive));
        });
    }

    function renderHeroText() {
        elements.heroEyebrow.textContent = pickText(app.content.hero.eyebrow);
        elements.heroTitle.textContent = pickText(app.content.hero.title);
        elements.heroSubtitle.textContent = pickText(app.content.hero.subtitle);
    }

    function renderSectionText() {
        elements.featuredTitle.textContent = pickText(app.content.sections.featured.title);
        elements.featuredSubtitle.textContent = pickText(app.content.sections.featured.subtitle);
        elements.allModpacksTitle.textContent = pickText(app.content.sections.allModpacks.title);
        elements.allModpacksSubtitle.textContent = pickText(app.content.sections.allModpacks.subtitle);
        elements.installTitle.textContent = pickText(app.content.sections.install.title);
        elements.installSubtitle.textContent = pickText(app.content.sections.install.subtitle);
        elements.updatesTitle.textContent = pickText(app.content.sections.updates.title);
        elements.updatesSubtitle.textContent = pickText(app.content.sections.updates.subtitle);

        elements.searchLabel.textContent = pickText(app.content.filters.searchLabel);
        elements.tagLabel.textContent = pickText(app.content.filters.tagLabel);
        elements.mcVersionLabel.textContent = pickText(app.content.filters.mcVersionLabel);
        elements.statusLabel.textContent = pickText(app.content.filters.statusLabel);
        elements.searchInput.placeholder = pickText(app.content.filters.searchPlaceholder);
        elements.clearFilters.textContent = pickText(app.content.filters.clear);
    }

    function renderFilterControls() {
        sanitizeFilterState();
        renderTagChips();
        renderMcVersionSelect();
        renderStatusSelect();
    }

    function sanitizeFilterState() {
        const validTags = new Set(app.facets.tags);

        Array.from(app.state.selectedTags).forEach((tag) => {
            if (!validTags.has(tag)) {
                app.state.selectedTags.delete(tag);
            }
        });

        if (app.state.selectedMcVersion !== "all" && !app.facets.mcVersions.includes(app.state.selectedMcVersion)) {
            app.state.selectedMcVersion = "all";
        }

        if (!STATUS_VALUES.includes(app.state.selectedStatus)) {
            app.state.selectedStatus = "all";
        }
    }

    function renderTagChips() {
        elements.tagChips.innerHTML = "";

        app.facets.tags.forEach((tag) => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = app.state.selectedTags.has(tag) ? "tag-chip is-active" : "tag-chip";
            btn.textContent = tag;
            btn.addEventListener("click", () => {
                if (app.state.selectedTags.has(tag)) {
                    app.state.selectedTags.delete(tag);
                } else {
                    app.state.selectedTags.add(tag);
                }
                renderTagChips();
                renderAllModpacks();
            });
            elements.tagChips.appendChild(btn);
        });
    }

    function renderMcVersionSelect() {
        const options = [
            { value: "all", label: pickText(app.content.filters.allMcVersions) },
            ...app.facets.mcVersions.map((v) => ({ value: v, label: v }))
        ];
        setSelectOptions(elements.mcVersionSelect, options, app.state.selectedMcVersion);
    }

    function renderStatusSelect() {
        const options = STATUS_VALUES.map((status) => ({
            value: status,
            label: pickText(app.content.filters.statusOptions[status])
        }));
        setSelectOptions(elements.statusSelect, options, app.state.selectedStatus);
    }

    function renderFeaturedModpacks() {
        elements.featuredGrid.innerHTML = "";

        if (app.errors.modpacks) {
            showNote(elements.featuredEmpty, pickText(app.content.states.errorModpacks));
            return;
        }

        const featured = app.modpacks.filter((m) => m.featured).sort((a, b) => b.updatedDateValue - a.updatedDateValue);
        if (featured.length === 0) {
            showNote(elements.featuredEmpty, pickText(app.content.states.featuredEmpty));
            return;
        }

        hideNote(elements.featuredEmpty);
        featured.forEach((modpack) => {
            elements.featuredGrid.appendChild(createModpackCard(modpack, { featured: true }));
        });
    }

    function renderAllModpacks() {
        elements.allModpacksGrid.innerHTML = "";

        if (app.errors.modpacks) {
            showNote(elements.allModpacksEmpty, pickText(app.content.states.errorModpacks));
            elements.resultsCount.textContent = "";
            return;
        }

        const filtered = getFilteredModpacks();
        elements.resultsCount.textContent = pickText(app.content.states.resultsCount).replace("{count}", String(filtered.length));

        if (filtered.length === 0) {
            showNoResults();
            return;
        }

        hideNote(elements.allModpacksEmpty);
        filtered.forEach((modpack) => {
            elements.allModpacksGrid.appendChild(createModpackCard(modpack, { featured: false }));
        });
    }

    function renderInstallGuide() {
        elements.installIntro.textContent = pickText(app.content.install.intro);
        elements.installTipsTitle.textContent = pickText(app.content.install.tipsTitle);

        elements.installSteps.innerHTML = "";
        if (Array.isArray(app.content.install.steps)) {
            app.content.install.steps.forEach((step) => {
                const li = document.createElement("li");
                li.textContent = pickText(step);
                elements.installSteps.appendChild(li);
            });
        }

        elements.installTipsList.innerHTML = "";
        if (Array.isArray(app.content.install.tips)) {
            app.content.install.tips.forEach((tip) => {
                const li = document.createElement("li");
                li.textContent = pickText(tip);
                elements.installTipsList.appendChild(li);
            });
        }
    }

    function renderUpdates() {
        elements.updatesList.innerHTML = "";

        if (app.errors.updates) {
            showNote(elements.updatesEmpty, pickText(app.content.states.errorUpdates));
            return;
        }

        if (app.updates.length === 0) {
            showNote(elements.updatesEmpty, pickText(app.content.states.updatesEmpty));
            return;
        }

        hideNote(elements.updatesEmpty);

        app.updates.forEach((entry) => {
            const item = document.createElement("article");
            item.className = "update-item";

            const head = document.createElement("div");
            head.className = "update-head";

            const title = document.createElement("h3");
            title.className = "update-title";
            title.textContent = pickText(entry.title);

            const date = document.createElement("p");
            date.className = "update-date";
            date.textContent = formatDate(entry.date);

            head.appendChild(title);
            head.appendChild(date);

            const summary = document.createElement("p");
            summary.className = "update-summary";
            summary.textContent = pickText(entry.summary);

            item.appendChild(head);
            item.appendChild(summary);

            if (entry.link) {
                const link = document.createElement("a");
                link.className = "update-link";
                link.href = entry.link;
                link.target = "_blank";
                link.rel = "noopener noreferrer";
                link.textContent = pickText(app.content.updates.readMore);
                item.appendChild(link);
            }

            elements.updatesList.appendChild(item);
        });
    }

    function renderFooter() {
        elements.footerTitle.textContent = pickText(app.content.footer.title);
        elements.footerText.textContent = pickText(app.content.footer.text);
        elements.footerButton.textContent = pickText(app.content.footer.buttonLabel);
        elements.footerButton.href = app.content.footer.buttonUrl || "#";
        elements.copyrightText.textContent = pickText(app.content.footer.copyright);
    }

    function showNoResults() {
        elements.allModpacksEmpty.innerHTML = "";
        elements.allModpacksEmpty.classList.remove("hidden");

        const message = document.createElement("span");
        message.textContent = pickText(app.content.states.noResults);

        const clearButton = document.createElement("button");
        clearButton.type = "button";
        clearButton.className = "inline-clear-btn";
        clearButton.textContent = pickText(app.content.states.clearInline);
        clearButton.addEventListener("click", resetFilters);

        elements.allModpacksEmpty.appendChild(message);
        elements.allModpacksEmpty.appendChild(clearButton);
    }

    function resetFilters() {
        app.state.query = "";
        app.state.selectedTags = new Set();
        app.state.selectedMcVersion = "all";
        app.state.selectedStatus = "all";

        elements.searchInput.value = "";
        renderFilterControls();
        renderAllModpacks();
    }

    function getFilteredModpacks() {
        const query = normalizeText(app.state.query);

        return app.modpacks
            .filter((item) => {
                const nameText = normalizeText(item.name[app.state.lang] || item.name.nl || item.name.en);
                const descriptionText = normalizeText(item.description[app.state.lang] || item.description.nl || item.description.en);
                const haystack = `${nameText} ${descriptionText}`;

                if (query && !haystack.includes(query)) {
                    return false;
                }
                if (app.state.selectedMcVersion !== "all" && item.mcVersion !== app.state.selectedMcVersion) {
                    return false;
                }
                if (app.state.selectedStatus !== "all" && item.status !== app.state.selectedStatus) {
                    return false;
                }

                if (app.state.selectedTags.size > 0) {
                    const tagSet = new Set(item.tags);
                    for (const tag of app.state.selectedTags) {
                        if (!tagSet.has(tag)) {
                            return false;
                        }
                    }
                }

                return true;
            })
            .sort((a, b) => b.updatedDateValue - a.updatedDateValue);
    }

    function createModpackCard(modpack, options) {
        const card = document.createElement("article");
        card.className = "modpack-card";

        const media = document.createElement("div");
        media.className = "card-media";

        const image = document.createElement("img");
        image.className = "card-image";
        image.src = modpack.imageUrl || IMAGE_FALLBACK;
        image.alt = `${modpack.name[app.state.lang] || modpack.name.nl} cover`;
        image.loading = "lazy";
        image.addEventListener("error", () => {
            image.src = IMAGE_FALLBACK;
        });

        media.appendChild(image);

        if (options.featured) {
            const badge = document.createElement("span");
            badge.className = "featured-badge";
            badge.textContent = pickText(app.content.card.featuredBadge);
            media.appendChild(badge);
        }

        const content = document.createElement("div");
        content.className = "card-content";

        const header = document.createElement("div");
        header.className = "card-header";

        const title = document.createElement("h3");
        title.className = "card-title";
        title.textContent = modpack.name[app.state.lang] || modpack.name.nl || modpack.name.en;

        const description = document.createElement("p");
        description.className = "card-description";
        description.textContent = modpack.description[app.state.lang] || modpack.description.nl || modpack.description.en;

        header.appendChild(title);
        header.appendChild(description);

        const meta = document.createElement("ul");
        meta.className = "card-meta";

        const rows = [
            { label: pickText(app.content.card.versionLabel), value: modpack.version },
            { label: pickText(app.content.card.mcVersionLabel), value: modpack.mcVersion },
            { label: pickText(app.content.card.loaderLabel), value: modpack.loader },
            { label: pickText(app.content.card.sizeLabel), value: `${modpack.fileSizeMb.toFixed(1)} MB` },
            { label: pickText(app.content.card.updatedLabel), value: formatDate(modpack.updatedAt) }
        ];

        rows.forEach((row) => {
            const item = document.createElement("li");
            item.className = "meta-item";

            const label = document.createElement("span");
            label.textContent = row.label;

            const value = document.createElement("span");
            value.className = "meta-value";
            value.textContent = row.value;

            item.appendChild(label);
            item.appendChild(value);
            meta.appendChild(item);
        });

        const footer = document.createElement("div");
        footer.className = "card-footer";

        const status = document.createElement("span");
        status.className = `status-badge status-${modpack.status}`;
        status.textContent = pickText(app.content.filters.statusOptions[modpack.status]);

        const download = document.createElement("a");
        download.className = "download-btn";
        download.href = modpack.downloadUrl;
        download.target = "_blank";
        download.rel = "noopener noreferrer";
        download.textContent = pickText(app.content.card.downloadCta);

        footer.appendChild(status);
        footer.appendChild(download);

        content.appendChild(header);
        content.appendChild(meta);
        content.appendChild(footer);

        card.appendChild(media);
        card.appendChild(content);

        return card;
    }

    function setSelectOptions(selectElement, options, selectedValue) {
        selectElement.innerHTML = "";

        options.forEach((item) => {
            const option = document.createElement("option");
            option.value = item.value;
            option.textContent = item.label;
            selectElement.appendChild(option);
        });

        const hasSelected = options.some((item) => item.value === selectedValue);
        selectElement.value = hasSelected ? selectedValue : options[0].value;

        if (selectElement === elements.mcVersionSelect) {
            app.state.selectedMcVersion = selectElement.value;
        }
        if (selectElement === elements.statusSelect) {
            app.state.selectedStatus = selectElement.value;
        }
    }

    function deriveFacets(modpacks) {
        const tags = new Set();
        const versions = new Set();

        modpacks.forEach((item) => {
            item.tags.forEach((tag) => tags.add(tag));
            versions.add(item.mcVersion);
        });

        return {
            tags: Array.from(tags).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" })),
            mcVersions: Array.from(versions).sort((a, b) => b.localeCompare(a, undefined, { numeric: true, sensitivity: "base" }))
        };
    }

    function normalizeModpacks(raw) {
        if (!Array.isArray(raw)) {
            console.warn("modpacks.json is not an array");
            return [];
        }

        const normalized = [];

        raw.forEach((entry, index) => {
            const status = typeof entry.status === "string" ? entry.status.trim().toLowerCase() : "";
            if (!VALID_DATA_STATUS.includes(status)) {
                console.warn(`Skipping modpack at index ${index}: invalid status`, entry);
                return;
            }

            const parsedDate = parseDateString(entry.updatedAt);
            if (!parsedDate) {
                console.warn(`Skipping modpack at index ${index}: invalid updatedAt`, entry);
                return;
            }

            const name = normalizeLocalizedValue(entry.name, "Unnamed Modpack");
            const description = normalizeLocalizedValue(entry.description, "");
            const id = asString(entry.id, slugify(name.en || name.nl || `modpack-${index + 1}`));
            const tags = Array.isArray(entry.tags)
                ? Array.from(new Set(entry.tags.map((t) => String(t).trim().toLowerCase()).filter(Boolean)))
                : [];

            normalized.push({
                id,
                featured: Boolean(entry.featured),
                status,
                name,
                description,
                version: asString(entry.version, "0.0.0"),
                mcVersion: asString(entry.mcVersion, "unknown"),
                loader: asString(entry.loader, "Unknown"),
                tags,
                fileSizeMb: asNumber(entry.fileSizeMb, 0),
                updatedAt: formatDateKey(parsedDate),
                updatedDateValue: parsedDate.getTime(),
                imageUrl: asString(entry.imageUrl, IMAGE_FALLBACK),
                downloadUrl: asString(entry.downloadUrl, "#")
            });
        });

        return normalized;
    }

    function normalizeUpdates(raw) {
        if (!Array.isArray(raw)) {
            console.warn("updates source is not an array");
            return [];
        }

        const normalized = [];

        raw.forEach((entry, index) => {
            const parsedDate = parseDateString(entry.date);
            if (!parsedDate) {
                console.warn(`Skipping update at index ${index}: invalid date`, entry);
                return;
            }

            normalized.push({
                id: asString(entry.id, `update-${index + 1}`),
                date: formatDateKey(parsedDate),
                dateValue: parsedDate.getTime(),
                title: normalizeLocalizedValue(entry.title, "Update"),
                summary: normalizeLocalizedValue(entry.summary, ""),
                link: typeof entry.link === "string" ? entry.link : ""
            });
        });

        normalized.sort((a, b) => b.dateValue - a.dateValue);
        return normalized;
    }

    async function fetchUpdatesWithGithubFallback() {
        const github = await fetchGithubReleases();
        if (github.data) {
            return github;
        }

        const local = await fetchJson("./assets/json/updates.json");
        if (!local.data) {
            return { data: null, error: github.error || local.error };
        }

        return local;
    }

    async function fetchGithubReleases() {
        try {
            const response = await fetch(GH_RELEASES_API, {
                headers: { "Accept": "application/vnd.github+json" },
                cache: "no-store"
            });

            if (!response.ok) {
                throw new Error(`GitHub API HTTP ${response.status}`);
            }

            const payload = await response.json();
            if (!Array.isArray(payload)) {
                throw new Error("GitHub releases payload is not an array");
            }

            const mapped = payload
                .filter((release) => !release.draft)
                .map((release) => {
                    const published = typeof release.published_at === "string" ? release.published_at.slice(0, 10) : "";
                    const date = parseDateString(published) ? published : formatDateKey(new Date());
                    const name = asString(release.name, asString(release.tag_name, "Release"));
                    const body = asString(release.body, "").split("\n").map((line) => line.trim()).filter(Boolean)[0] || "";

                    return {
                        id: asString(release.id ? String(release.id) : "", slugify(name)),
                        date,
                        title: { nl: name, en: name },
                        summary: {
                            nl: body || "Nieuwe release beschikbaar op GitHub.",
                            en: body || "New release is available on GitHub."
                        },
                        link: asString(release.html_url, "https://github.com/surgamingoninsulin/Minecraft-Modpacks/releases")
                    };
                });

            return { data: mapped, error: null };
        } catch (error) {
            return { data: null, error };
        }
    }

    function mergeContent(defaults, incoming) {
        if (!incoming || typeof incoming !== "object") {
            return defaults;
        }
        if (Array.isArray(defaults)) {
            return Array.isArray(incoming) ? incoming : defaults;
        }

        const result = { ...defaults };
        Object.keys(incoming).forEach((key) => {
            const incomingValue = incoming[key];
            const defaultValue = defaults[key];

            if (
                defaultValue && typeof defaultValue === "object" && !Array.isArray(defaultValue) &&
                incomingValue && typeof incomingValue === "object" && !Array.isArray(incomingValue)
            ) {
                result[key] = mergeContent(defaultValue, incomingValue);
            } else {
                result[key] = incomingValue;
            }
        });

        return result;
    }

    function normalizeLocalizedValue(value, fallbackValue) {
        if (value && typeof value === "object") {
            return {
                nl: asString(value.nl, fallbackValue),
                en: asString(value.en, value.nl || fallbackValue)
            };
        }

        const text = asString(value, fallbackValue);
        return { nl: text, en: text };
    }

    function pickText(value) {
        if (value && typeof value === "object") {
            return app.state.lang === "nl" ? (value.nl || value.en || "") : (value.en || value.nl || "");
        }
        return asString(value, "");
    }

    function showNote(element, text) {
        element.textContent = text;
        element.classList.remove("hidden");
    }

    function hideNote(element) {
        element.textContent = "";
        element.classList.add("hidden");
    }

    function setupRevealAnimations() {
        const nodes = document.querySelectorAll(".reveal");
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        if (prefersReducedMotion) {
            nodes.forEach((node) => node.classList.add("is-visible"));
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });

        nodes.forEach((node) => observer.observe(node));
    }

    function formatDate(dateKey) {
        const parsed = parseDateString(dateKey);
        if (!parsed) {
            return dateKey;
        }

        return new Intl.DateTimeFormat(app.state.lang === "nl" ? "nl-NL" : "en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            timeZone: "UTC"
        }).format(parsed);
    }

    function formatDateKey(dateObject) {
        const year = dateObject.getUTCFullYear();
        const month = String(dateObject.getUTCMonth() + 1).padStart(2, "0");
        const day = String(dateObject.getUTCDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    function parseDateString(raw) {
        if (typeof raw !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
            return null;
        }

        const [yy, mm, dd] = raw.split("-").map(Number);
        const date = new Date(Date.UTC(yy, mm - 1, dd));

        if (date.getUTCFullYear() !== yy || date.getUTCMonth() + 1 !== mm || date.getUTCDate() !== dd) {
            return null;
        }

        return date;
    }

    function normalizeText(value) {
        return String(value || "").toLowerCase().trim();
    }

    function slugify(value) {
        return normalizeText(value)
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-|-$/g, "") || "item";
    }

    function asString(value, fallback) {
        return typeof value === "string" && value.trim() ? value.trim() : fallback;
    }

    function asNumber(value, fallback) {
        const n = Number(value);
        return Number.isFinite(n) && n >= 0 ? n : fallback;
    }

    function loadLanguage() {
        const stored = localStorage.getItem(LANG_STORAGE_KEY);
        return stored === "en" ? "en" : "nl";
    }

    async function fetchJson(url) {
        try {
            const response = await fetch(url, { cache: "no-store" });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            return { data: await response.json(), error: null };
        } catch (error) {
            return { data: null, error };
        }
    }
})();
