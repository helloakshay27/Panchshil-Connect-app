import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { PostHogProvider } from '@posthog/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import posthog from 'posthog-js'
import './index.css'
import App from './App.jsx'

// Initialize posthog BEFORE React renders so posthog.capture() calls inside
// useEffect hooks are never made on an uninitialized instance. When using
// apiKey + options directly in PostHogProvider, posthog.init() is called in a
// useEffect (after render), so child components that capture during their own
// mount effects race against init and those events get dropped.
const posthogToken = import.meta.env.VITE_POSTHOG_PROJECT_TOKEN
const posthogHost = import.meta.env.VITE_POSTHOG_HOST

// posthog.init(undefined) does not throw — it returns a client that silently
// drops every capture(). That failure mode is indistinguishable from "the
// instrumentation is broken", so say so loudly instead of guessing later.
if (!posthogToken || posthogToken === 'phc_replace_me') {
  console.error(
    '[PostHog] VITE_POSTHOG_PROJECT_TOKEN is not set — analytics is DISABLED ' +
      'and every event will be dropped. Copy .env.example to .env and restart ' +
      'the dev server (Vite inlines VITE_* at build time).'
  )
} else {
  posthog.init(posthogToken, {
    api_host: posthogHost,
    autocapture: false,
    capture_pageview: false, // handled manually by PostHogPageView
    disable_session_recording: true,
  })
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <PostHogProvider client={posthog}>
        <App />
      </PostHogProvider>
    </QueryClientProvider>
  </StrictMode>,
)
