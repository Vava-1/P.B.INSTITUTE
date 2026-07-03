import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Toaster } from '@/components/ui/sonner'

const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))
const Courses = lazy(() => import('./pages/Courses'))
const CourseDetail = lazy(() => import('./pages/CourseDetail'))
const Enroll = lazy(() => import('./pages/Enroll'))
const Contact = lazy(() => import('./pages/Contact'))
const Faqs = lazy(() => import('./pages/Faqs'))
const News = lazy(() => import('./pages/News'))
const AdminLogin = lazy(() => import('./pages/AdminLogin'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const NotFound = lazy(() => import('./pages/NotFound'))

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-white" role="status" aria-live="polite">
    <div className="animate-spin w-8 h-8 border-4 border-brand border-t-transparent rounded-full" />
    <span className="sr-only">Loading…</span>
  </div>
)

export default function App() {
  return (
    <ErrorBoundary>
      {/* Skip-to-content link for keyboard/screen-reader users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-brand focus:text-white focus:rounded-md focus:shadow-lg"
      >
        Skip to content
      </a>
      <Suspense fallback={<PageLoader />}>
        <main id="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:slug" element={<CourseDetail />} />
            <Route path="/enroll" element={<Enroll />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faqs" element={<Faqs />} />
            <Route path="/news" element={<News />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/*" element={<AdminDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </Suspense>
      <Toaster position="top-right" richColors closeButton />
    </ErrorBoundary>
  )
}
