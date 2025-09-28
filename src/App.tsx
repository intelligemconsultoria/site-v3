import { useState, useEffect } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { Header } from "./components/Header";
import { HeroSection } from "./components/HeroSection";
import { AboutSection } from "./components/AboutSection";
import { SolutionsSection } from "./components/SolutionsSection";
import { CasesSection } from "./components/CasesSection";
import { BlogSection } from "./components/BlogSection";
import { CTASection } from "./components/CTASection";
import { Footer } from "./components/Footer";
import { BlogPage } from "./components/BlogPage";
import { BlogAdmin } from "./components/BlogAdmin";
import { ArticleReader } from "./components/ArticleReader";
import { CasesPage } from "./components/CasesPage";
import { CasesAdmin } from "./components/CasesAdmin";
import { CaseReader } from "./components/CaseReader";
import { ArticleEditor } from "./components/ArticleEditor";
import { CaseEditor } from "./components/CaseEditor";
import { GemFlowPage } from "./components/GemFlowPage";
import { GemInsightsPage } from "./components/GemInsightsPage";
import { GemMindPage } from "./components/GemMindPage";
import { MeetingsDashboard } from "./components/MeetingsDashboard";
import { AdminDashboard } from "./components/AdminDashboard";
import { Toaster } from "./components/ui/sonner";
import { FloatingMeetingWidget } from "./components/FloatingMeetingWidget";
import { MetaTags } from "./components/MetaTags";
import gemFlowLogo from "figma:asset/5175adeec9ce8271bb85bf293b9214728409a71a.png";
import gemInsightsLogo from "figma:asset/7dd46db1fefa5288c113180ade65c741fafebcce.png";
import gemMindLogo from "figma:asset/c856949ab322f91d15b5aaecc11426c61fe0ed10.png";

function AppContent() {
  const [currentPage, setCurrentPage] = useState<'home' | 'blog' | 'admin' | 'admin-dashboard' | 'meetings-dashboard' | 'article' | 'cases' | 'cases-admin' | 'case-detail' | 'article-editor' | 'case-editor' | 'gemflow' | 'geminsights' | 'gemmind'>('home');
  const [currentArticleSlug, setCurrentArticleSlug] = useState<string>('');
  const [currentCaseSlug, setCurrentCaseSlug] = useState<string>('');
  const [currentEditingArticleId, setCurrentEditingArticleId] = useState<string>('');
  const [currentEditingCaseId, setCurrentEditingCaseId] = useState<string>('');

  // Detectar rota da URL e navegar automaticamente
  useEffect(() => {
    const path = window.location.pathname;
    console.log('🔍 [App] Detectando rota:', path);
    
    if (path === '/admin') {
      console.log('✅ [App] Navegando para admin via URL');
      navigateToAdmin();
    } else if (path === '/blog') {
      console.log('✅ [App] Navegando para blog via URL');
      navigateToBlog();
    } else if (path === '/cases') {
      console.log('✅ [App] Navegando para cases via URL');
      navigateToCases();
    } else if (path === '/gemflow') {
      console.log('✅ [App] Navegando para gemflow via URL');
      navigateToGemFlow();
    } else if (path === '/geminsights') {
      console.log('✅ [App] Navegando para geminsights via URL');
      navigateToGemInsights();
    } else if (path === '/gemmind') {
      console.log('✅ [App] Navegando para gemmind via URL');
      navigateToGemMind();
    } else if (path.startsWith('/artigo/')) {
      // Detectar artigo específico via URL
      const slug = path.replace('/artigo/', '');
      console.log('✅ [App] Navegando para artigo via URL:', slug);
      navigateToArticle(slug);
    } else if (path.startsWith('/case/')) {
      // Detectar case específico via URL
      const slug = path.replace('/case/', '');
      console.log('✅ [App] Navegando para case via URL:', slug);
      navigateToCase(slug);
    } else if (path === '/') {
      console.log('✅ [App] Navegando para home via URL');
      navigateToHome();
    }
  }, []);

  const navigateToBlog = () => {
    window.scrollTo(0, 0);
    setCurrentPage('blog');
    window.history.pushState({}, '', '/blog');
  };
  const navigateToHome = () => {
    window.scrollTo(0, 0);
    setCurrentPage('home');
    window.history.pushState({}, '', '/');
  };
  const navigateToAdmin = () => {
    window.scrollTo(0, 0);
    setCurrentPage('admin');
    window.history.pushState({}, '', '/admin');
  };
  const navigateToAdminDashboard = () => {
    window.scrollTo(0, 0);
    setCurrentPage('admin-dashboard');
  };
  const navigateToMeetingsDashboard = () => {
    window.scrollTo(0, 0);
    setCurrentPage('meetings-dashboard');
  };
  const navigateToArticle = (slug: string) => {
    window.scrollTo(0, 0);
    setCurrentArticleSlug(slug);
    setCurrentPage('article');
    // Atualizar URL do navegador
    window.history.pushState({}, '', `/artigo/${slug}`);
  };
  const navigateToCases = () => {
    window.scrollTo(0, 0);
    setCurrentPage('cases');
  };
  const navigateToCasesAdmin = () => {
    window.scrollTo(0, 0);
    setCurrentPage('cases-admin');
  };
  const navigateToCase = (slug: string) => {
    window.scrollTo(0, 0);
    setCurrentCaseSlug(slug);
    setCurrentPage('case-detail');
    // Atualizar URL do navegador
    window.history.pushState({}, '', `/case/${slug}`);
  };
  
  const navigateToArticleEditor = (articleId?: string) => {
    window.scrollTo(0, 0);
    setCurrentEditingArticleId(articleId || '');
    setCurrentPage('article-editor');
  };
  
  const navigateToCaseEditor = (caseId?: string) => {
    window.scrollTo(0, 0);
    setCurrentEditingCaseId(caseId || '');
    setCurrentPage('case-editor');
  };

  const navigateToGemFlow = () => {
    window.scrollTo(0, 0);
    setCurrentPage('gemflow');
  };

  const navigateToGemInsights = () => {
    window.scrollTo(0, 0);
    setCurrentPage('geminsights');
  };

  const navigateToGemMind = () => {
    window.scrollTo(0, 0);
    setCurrentPage('gemmind');
  };

  const navigateToContact = () => {
    // Scroll para a seção de contato/CTA na home
    navigateToHome();
    setTimeout(() => {
      const ctaSection = document.querySelector('#contato');
      if (ctaSection) {
        ctaSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  if (currentPage === 'blog') {
    return (
      <BlogPage onBack={navigateToHome} onReadArticle={navigateToArticle} />
    );
  }

  if (currentPage === 'admin') {
    return (
      <BlogAdmin 
        onBack={navigateToHome} 
        onEditArticle={navigateToArticleEditor}
        onEditCase={navigateToCaseEditor}
      />
    );
  }

  if (currentPage === 'admin-dashboard') {
    return (
      <AdminDashboard 
        onBack={navigateToHome}
        onNavigateToEditor={(type) => {
          if (type === 'blog') navigateToAdmin();
          else if (type === 'cases') navigateToCasesAdmin();
          else if (type === 'meetings') navigateToMeetingsDashboard();
        }}
      />
    );
  }

  if (currentPage === 'meetings-dashboard') {
    return (
      <MeetingsDashboard onBack={navigateToAdminDashboard} />
    );
  }

  if (currentPage === 'article') {
    return (
      <ArticleReader 
        slug={currentArticleSlug} 
        onBack={navigateToBlog} 
        onBackToBlog={navigateToBlog} 
      />
    );
  }

  if (currentPage === 'cases') {
    return (
      <CasesPage onBack={navigateToHome} onReadCase={navigateToCase} />
    );
  }

  if (currentPage === 'cases-admin') {
    return (
      <CasesAdmin onBack={navigateToHome} />
    );
  }

  if (currentPage === 'case-detail') {
    return (
      <CaseReader 
        slug={currentCaseSlug} 
        onBack={navigateToCases} 
        onBackToCases={navigateToCases} 
      />
    );
  }

  if (currentPage === 'article-editor') {
    return (
      <ArticleEditor 
        articleId={currentEditingArticleId || undefined}
        onBack={navigateToAdmin} 
      />
    );
  }

  if (currentPage === 'case-editor') {
    return (
      <CaseEditor 
        caseId={currentEditingCaseId || undefined}
        onBack={navigateToAdmin} 
      />
    );
  }

  if (currentPage === 'gemflow') {
    return (
      <GemFlowPage 
        onBack={navigateToHome}
        onContact={navigateToContact}
        logo={gemFlowLogo}
      />
    );
  }

  if (currentPage === 'geminsights') {
    return (
      <GemInsightsPage 
        onBack={navigateToHome}
        onContact={navigateToContact}
        logo={gemInsightsLogo}
      />
    );
  }

  if (currentPage === 'gemmind') {
    return (
      <GemMindPage 
        onBack={navigateToHome}
        onContact={navigateToContact}
        logo={gemMindLogo}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <MetaTags />
      <Header 
        onNavigateToAdmin={navigateToAdmin} 
        onNavigateToBlog={navigateToBlog}
        onNavigateToCases={navigateToCases}
        onNavigateToCasesAdmin={navigateToCasesAdmin}
      />
      <HeroSection />
      <AboutSection />
      <SolutionsSection 
        onNavigateToGemFlow={navigateToGemFlow}
        onNavigateToGemInsights={navigateToGemInsights}
        onNavigateToGemMind={navigateToGemMind}
      />
      <CasesSection onNavigateToCases={navigateToCases} onReadCase={navigateToCase} />
      <BlogSection onNavigateToBlog={navigateToBlog} onReadArticle={navigateToArticle} />
      <CTASection />
      <Footer />
      
      {/* Widget Flutuante de Agendamento - apenas na home */}
      <FloatingMeetingWidget disabled={false} />
    </div>
  );
}

export default function App() {
  // Inicializar tema
  useEffect(() => {
    const savedTheme = localStorage.getItem('intelligem-theme') || 'dark';
    document.documentElement.classList.add(savedTheme);
  }, []);

  return (
    <AuthProvider>
      <AppContent />
      <Toaster />
    </AuthProvider>
  );
}