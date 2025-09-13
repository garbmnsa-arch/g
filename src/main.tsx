import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.tsx'

const queryClient = new QueryClient()

// تسجيل Service Worker
const updateSW = registerSW({
  onNeedRefresh() {
    // يمكن إضافة تنبيه للتحديث هنا لاحقاً
    updateSW(true);
  },
  onOfflineReady() {
    console.log('التطبيق جاهز للعمل بدون إنترنت');
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        <App />
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
)
