const restoreSettings = async () => {
    const defaultSettings = await chrome.storage.local.get([
        'real-time-protection',
        'machine-learning-detecting',
        'auto-report',
        'enable-shopee-title',
        'enable-href',
    ]);

    document.querySelector('[value="real-time-protection"]').checked = defaultSettings['real-time-protection'];
    document.querySelector('[value="machine-learning-detecting"]').checked =
        defaultSettings['machine-learning-detecting'];
    document.querySelector('[value="auto-report"]').checked = defaultSettings['auto-report'];
    document.querySelector('[value="enable-shopee-title"]').checked = defaultSettings['enable-shopee-title'];
    document.querySelector('[value="enable-href"]').checked = defaultSettings['enable-href'];
};

const saveSettings = async () => {
    const realtimeProtection = document.querySelector('[value="real-time-protection"]').checked;
    const machineLearningDetecting = document.querySelector('[value="machine-learning-detecting"]').checked;
    const autoReport = document.querySelector('[value="auto-report"]').checked;
    const enableShopeeTitle = document.querySelector('[value="enable-shopee-title"]').checked;
    const enableHref = document.querySelector('[value="enable-href"]').checked;

    await chrome.storage.local.set({
        'real-time-protection': realtimeProtection,
        'machine-learning-detecting': machineLearningDetecting,
        'auto-report': autoReport,
        'enable-shopee-title': enableShopeeTitle,
        'enable-href': enableHref,
    });

    document.getElementById('btn-discard').style.display = 'none';

    // await chrome.runtime.sendMessage('update-context-menus');

    alert('Saved successfully');
};

const discardChanges = () => {
    window.location.reload();
};

document.addEventListener('DOMContentLoaded', restoreSettings);
document.getElementById('btn-save').addEventListener('click', saveSettings);
document.getElementById('btn-discard').addEventListener('click', discardChanges);
document.querySelectorAll('.all-settings input').forEach((inputTag) => {
    inputTag.addEventListener('change', () => {
        document.getElementById('btn-discard').style.display = 'initial';
    });
});

document.querySelector('[value="real-time-protection"]').addEventListener('change', () => {
    if (document.querySelector('[value="real-time-protection"]').checked) {
        document.querySelector('[value="machine-learning-detecting"]').disabled = false;
        document.querySelector('[value="machine-learning-detecting"]').checked = true;
    } else {
        document.querySelector('[value="machine-learning-detecting"]').disabled = true;
        document.querySelector('[value="machine-learning-detecting"]').checked = false;
    }
});
