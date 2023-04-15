(async () => {
    const settings = await chrome.storage.local.get();

    if (settings['real-time-protection']) {
        let lastDetectCounts = 0;

        const intervalDetectLinks = async () => {
            const anchors = document.querySelectorAll('a');

            if (anchors.length != lastDetectCounts) {
                let links = [];

                [...anchors].forEach((item, index) => {
                    if (typeof item.href != 'string') return;

                    const protocol = item.href.split('/')[0];
                    const host = item.href.split('/')[2];

                    if (
                        protocol === location.protocol &&
                        (host === location.host || 'www.' + host === location.host || host === 'www.' + location.host)
                    ) {
                        return;
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
                        link.dom.style.backgroundColor = 'red';
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
        };
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
