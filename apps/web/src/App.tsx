import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ModuleAwareWebsitePage from "./pages/ModuleAwareWebsitePage";
import ClientPage from "./pages/ClientPage";
import AdminPage from "./pages/AdminPage";
import StorePage from "./pages/StorePage";
import SubscriptionPage from "./pages/SubscriptionPage";
import SuperAdminPage from "./pages/SuperAdminPage";
import BusinessModulesPage from "./pages/BusinessModulesPage";
import TenantSiteContentPage from "./pages/TenantSiteContentPage";
import AboutPage from "./pages/site/AboutPage";
import ServicesListPage from "./pages/site/ServicesListPage";
import ServiceDetailPage from "./pages/site/ServiceDetailPage";
import TestimonialsPage from "./pages/site/TestimonialsPage";
import FaqPage from "./pages/site/FaqPage";
import ContactPage from "./pages/site/ContactPage";
import LocationPage from "./pages/site/LocationPage";
import PrivacyPage from "./pages/site/PrivacyPage";
import TermsPage from "./pages/site/TermsPage";
import BlogPage from "./pages/site/BlogPage";
import BlogPostPage from "./pages/site/BlogPostPage";
import GalleryPage from "./pages/site/GalleryPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/sara" replace />} />
        <Route path="/super-admin" element={<SuperAdminPage />} />
        <Route path="/super-admin/modulos" element={<BusinessModulesPage />} />
        <Route path="/:slug/admin/website" element={<TenantSiteContentPage />} />

        <Route path="/:slug" element={<ModuleAwareWebsitePage />} />
        <Route path="/:slug/sobre" element={<AboutPage />} />
        <Route path="/:slug/servicos" element={<ServicesListPage />} />
        <Route path="/:slug/servicos/:id" element={<ServiceDetailPage />} />
        <Route path="/:slug/depoimentos" element={<TestimonialsPage />} />
        <Route path="/:slug/faq" element={<FaqPage />} />
        <Route path="/:slug/contactos" element={<ContactPage />} />
        <Route path="/:slug/localizacao" element={<LocationPage />} />
        <Route path="/:slug/privacidade" element={<PrivacyPage />} />
        <Route path="/:slug/termos" element={<TermsPage />} />
        <Route path="/:slug/blog" element={<BlogPage />} />
        <Route path="/:slug/blog/:postSlug" element={<BlogPostPage />} />
        <Route path="/:slug/galeria" element={<GalleryPage />} />

        <Route path="/:slug/loja" element={<StorePage />} />
        <Route path="/:slug/reservas" element={<ClientPage />} />
        <Route path="/:slug/admin" element={<AdminPage />} />
        <Route path="/:slug/planos" element={<SubscriptionPage />} />
      </Routes>
    </BrowserRouter>
  );
}