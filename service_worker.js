async function getCurrentTab() {
    let queryOptions = { active: true, lastFocusedWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    console.log(tab);
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

    chrome.contextMenus.create({
        id: 'ocr-detect',
        title: 'Detect phishing links in image',
        contexts: ['image'],
    });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.mess === 'check-urls') {
        (async () => {
            try {
                const raw = await fetch('https://api.vntravelmate.com/check-multi', {
                    method: 'POST',
                    body: JSON.stringify({
                        urls: request.urls.map((item) => ({ id: item.id, url: item.url })),
                        use_ml: request.use_ml,
                    }),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                const res = await raw.json();
                console.log(res);
                sendResponse(res);
            } catch (error) {
                console.log(error);
                sendResponse(null);
            }
        })();

        return true;
    }
});

chrome.contextMenus.onClicked.addListener(async (info) => {
    const currTab = await getCurrentTab();

    if (info.menuItemId === 'reveal') {
        await chrome.scripting.executeScript({
            target: { tabId: currTab.id },
            func: (info) => {
                alert(`The actual link is: ${info.linkUrl}`);
            },
            args: [info],
        });
    } else if (info.menuItemId === 'report') {
        // const raw = await fetch('https://google.com');
        // const res = await raw.text();

        await chrome.scripting.executeScript({
            target: { tabId: currTab.id },
            func: () => {
                alert('Report successfully');
            },
        });
    } else if (info.menuItemId === 'ocr-detect') {
        await chrome.scripting.executeScript({
            target: { tabId: currTab.id },
            func: async (info) => {
                async function srcToFile(src) {
                    return fetch(src)
                        .then(function (res) {
                            return res.arrayBuffer();
                        })
                        .then(function (buf) {
                            return new File([buf], 'temp', { type: 'image' });
                        });
                }

                if (info.srcUrl.slice(0, 4) === 'data') {
                    const file = await srcToFile(info.srcUrl);
                    console.log(file);
                }
            },
            args: [info],
        });
    }
});

chrome.action.onClicked.addListener(() => {
    chrome.runtime.openOptionsPage();
});
