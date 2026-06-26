import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router'
import { RouteProgressBar } from './components/RouteProgressBar'

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
  <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="animate-spin w-8 h-8 border-4 border-[#5E17EB] border-t-transparent rounded-full" />
  </div>
)

export default function App() {
  return (
    <RouteProgressBar />
    <Suspense fallback={<PageLoader />}>
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
    </Suspense>
  )
}
