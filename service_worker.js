async function getCurrentTab() {
    let queryOptions = { active: true, lastFocusedWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}

async function updateContextMenus() {
    const settings = await chrome.storage.local.get();
    if (!settings['real-time-protection']) {
        chrome.contextMenus.remove('real-time-protection');
    } else {
        chrome.contextMenus.create({
            id: 'real-time-protection',
            title: 'Real-time Protection',
        });
    }
}

chrome.runtime.onInstalled.addListener(async () => {
    const defaultSettings = {
        'real-time-protection': true,
        'machine-learning-detecting': true,
        'auto-report': false,
        'enable-shopee-title': true,
        'enable-href': false,
    };
    await chrome.storage.local.set(defaultSettings);

    if (defaultSettings['real-time-protection']) {
        chrome.contextMenus.create({
            id: 'real-time-protection',
            title: 'Real-time Protection',
        });
    }

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

chrome.runtime.onMessage.addListener(async (mess) => {
    if (mess === 'update-context-menus') {
        await updateContextMenus();
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
