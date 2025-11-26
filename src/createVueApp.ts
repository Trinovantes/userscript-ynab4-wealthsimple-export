import { createPinia } from 'pinia'
import { createApp } from 'vue'
import { useSettingsStore } from './store/useSettingsStore.ts'
import UserscriptApp from './components/UserscriptApp.vue'

export async function createVueApp() {
    const app = createApp(UserscriptApp)

    const pinia = createPinia()
    app.use(pinia)

    const store = useSettingsStore()
    await store.load()

    return app
}
