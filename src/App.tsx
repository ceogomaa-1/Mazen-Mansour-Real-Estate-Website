import { Navigate, Route, Routes } from 'react-router-dom';
import { SiteLayout } from './components/SiteLayout';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { PropertiesPage } from './pages/PropertiesPage';
import { PropertyDetailsPage } from './pages/PropertyDetailsPage';

export function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route path='/' element={<HomePage />} />
        <Route path='/home' element={<Navigate to='/' replace />} />
        <Route path='/properties' element={<PropertiesPage />} />
        <Route path='/properties/:slug' element={<PropertyDetailsPage />} />
        <Route path='/about' element={<AboutPage />} />
        <Route path='/contact' element={<ContactPage />} />
        <Route path='*' element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
