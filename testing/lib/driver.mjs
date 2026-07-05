import puppeteer from 'puppeteer';

/**
 * Shared browser driver for regression tests -- factored out of the
 * disposable scripts written ad hoc throughout the "semi-vanilla world
 * templates" session so future checks don't re-derive the same auth-seeding
 * and navigation boilerplate every time.
 */

export const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

/** Launch a browser + page with console/response error capture wired up. */
export const launch = async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    const errors = [];
    page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
    page.on('console', (msg) => {
        if (msg.type() === 'error') errors.push(`console: ${msg.text()}`);
    });
    page.on('response', (res) => {
        if (res.status() >= 400) errors.push(`http${res.status()}: ${res.url()}`);
    });

    return { browser, page, errors };
};

/** Seed session auth so tests skip the login screen entirely. */
export const seedAuth = async (page) => {
    await page.goto(`${BASE_URL}/authentication`, { waitUntil: 'networkidle0' });
    await page.evaluate(() => {
        const profile = {
            id: 1,
            name: 'David',
            level: 'baronet',
            options: { brickQuality: 'high', renderer: 'hardware', dialogue: 'off', music: 'off' },
        };
        sessionStorage.setItem('knights-kingdom-auth', JSON.stringify({ selectedProfile: profile }));
    });
};

const ITEMS_PER_PAGE = 9;

/**
 * Navigate to the world-select screen and confirm the world at `worldIndex`
 * (0-based grid position -- World 1 is index 0). Lands on /start-stack/main-game.
 * Paginates first if worldIndex falls on a later page (grid shows 9 at a time).
 */
export const selectWorld = async (page, worldIndex) => {
    await page.goto(`${BASE_URL}/start-stack/start`, { waitUntil: 'networkidle0' });

    const page_ = Math.floor(worldIndex / ITEMS_PER_PAGE);
    const indexOnPage = worldIndex % ITEMS_PER_PAGE;
    for (let i = 0; i < page_; i += 1) {
        const downArrow = await page.$('[class*="downArrowHolder"]');
        if (!downArrow) {
            throw new Error(`Down-arrow pagination control not found (needed page ${page_})`);
        }
        // eslint-disable-next-line no-await-in-loop
        await downArrow.click();
        // eslint-disable-next-line no-await-in-loop
        await new Promise((r) => setTimeout(r, 200));
    }

    const items = await page.$$('[class*="WorldBody_item"]');
    if (!items[indexOnPage]) {
        throw new Error(`World index ${worldIndex} not found (only ${items.length} slots on page ${page_})`);
    }
    await items[indexOnPage].click();
    await new Promise((r) => setTimeout(r, 300));
    const confirmBtn = await page.$('img[alt="Confirm"]');
    if (!confirmBtn) {
        throw new Error('Confirm button not found on world-select screen');
    }
    await confirmBtn.click();
    await new Promise((r) => setTimeout(r, 300));
};

/** Wait for the main-game canvas to finish its initial load. */
export const waitForMapLoad = async (page, ms = 8000) => {
    await new Promise((r) => setTimeout(r, ms));
};

// World N (1-based) -> template-0N directly; index is 0-based (World 1 = index 0).
export const NAMED_TEMPLATE_CHARACTERS = {
    0: { templateId: 'template-01', name: 'SCL M/F : QL01', matchedModelId: 'minifigqueenleonora01' },
    4: { templateId: 'template-05', name: 'SCL Bomb : L4105278', matchedModelId: 'l4105278' },
    5: { templateId: 'template-06', name: 'SCL Vehicle : OC6032', matchedModelId: 'oc6032' },
};
