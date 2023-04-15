async function getCurrentTab() {
    let queryOptions = { active: true, lastFocusedWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}

chrome.runtime.onInstalled.addListener(async () => {
    const defaultSettings = {
        'real-time-protection': true,
        'machine-learning-detecting': true,
        'auto-report': false,
        'enable-shopee-title': true,
        'enable-href': true,
    };
    await chrome.storage.local.set(defaultSettings);

    chrome.contextMenus.create({
        id: 'reveal',
        title: 'View detail link',
        contexts: ['link'],
    });

    chrome.contextMenus.create({
        id: 'report',
        title: 'Report link',
        contexts: ['link'],
    });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.mess === 'check-urls') {
        (async () => {
            const raw = await fetch('https://congcu.org/junctionx-be/check-url.php', {
                method: 'POST',
                body: JSON.stringify({ urls: request.urls.map((item) => ({ id: item.id, url: item.url })) }),
            });

            const res = await raw.json();

            sendResponse(res);
        })();

        return true;
    }
});

chrome.contextMenus.onClicked.addListener(async (info) => {
    if (info.menuItemId === 'reveal') {
        await chrome.scripting.executeScript({
            target: { tabId: (await getCurrentTab()).id },
            func: (info) => {
                alert(`The actual link is: ${info.linkUrl}`);
            },
            args: [info],
        });
    } else if (info.menuItemId === 'report') {
        await chrome.scripting.executeScript({
            target: { tabId: (await getCurrentTab()).id },
            func: (info) => {
                alert(`Reported link successfully`);
            },
            args: [info],
        });
    }
});

chrome.action.onClicked.addListener(() => {
    chrome.runtime.openOptionsPage();
});
