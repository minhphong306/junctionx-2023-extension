(async () => {
    const settings = await chrome.storage.local.get();

    if (settings['real-time-protection']) {
        let lastDetectCounts = 0;

        const intervalDetectLinks = async () => {
            const anchors = document.querySelectorAll('a');

            if (anchors.length != lastDetectCounts) {
                let links = [];

                [...anchors].forEach((item, index) => {
                    if (isValidUrl(item.textContent) && item.href != item.textContent) {
                        item.style.background = 'red';
                    }
                    links.push({
                        id: index + 1,
                        url: item.href,
                        dom: item,
                    });
                });
                const res = await chrome.runtime.sendMessage({
                    mess: 'check-urls',
                    urls: links,
                });

                for (let link of links) {
                    if (res.phishings.includes(link.id)) {
                        link.dom.style.background = 'red';
                    }
                }

                lastDetectCounts = anchors.length;
            }
        };

        setInterval(intervalDetectLinks, 5000);
    }

    if (settings['enable-href']) {
        const replaceFakeUrl = () => {
            const anchors = document.querySelectorAll('a');
            [...anchors].forEach((item) => {
                const text = item.textContent.trim();
                if (isValidUrl(text) && item.href != text) {
                    item.textContent = item.href;
                }
            });
        }
        setInterval(replaceFakeUrl, 3000);
    }
})();

function isValidUrl(urlString) {
    try {
        return Boolean(new URL(urlString));
    } catch (e) {
        return false;
    }
}
