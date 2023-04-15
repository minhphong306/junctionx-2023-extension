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
        const raw = await fetch('https://google.com')
        const res = await raw.text();
        
        await chrome.scripting.executeScript({
            target: { tabId: (await getCurrentTab()).id },
            func: (res) => {
                alert(res);
            },
            args: [res],
        });
    }
});

chrome.action.onClicked.addListener(() => {
    chrome.runtime.openOptionsPage();
});
