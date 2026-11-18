import './popup.scss'

const openButton = document.querySelector<HTMLButtonElement>('#open-viewer')
const versionLabel = document.querySelector<HTMLElement>('#version')

const openViewer = (): void => {
  chrome.tabs
    .create({ url: chrome.runtime.getURL('viewer.html') })
    .then(() => {
      window.close()
    })
    .catch(() => {
      window.close()
    })
}

if (openButton) {
  openButton.addEventListener('click', openViewer)
}

if (versionLabel) {
  versionLabel.textContent = `v${chrome.runtime.getManifest().version}`
}
