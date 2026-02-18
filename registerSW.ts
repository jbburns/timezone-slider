import { registerSW } from 'virtual:pwa-register'

export function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        registerSW({
            immediate: true,
            onNeedRefresh() {
                console.log('New content available, please refresh.')
            },
            onOfflineReady() {
                console.log('App ready to work offline.')
            },
        })
    }
}
