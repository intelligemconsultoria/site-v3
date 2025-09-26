import { Separator } from "./ui/separator";
import intelligemLogo from "figma:asset/6b92ef4371fead8d661263f615c56e4cb4e3ce7f.png";

export function Footer() {
  return (
    <footer className="bg-gradient-to-t from-background to-muted border-t border-border">
      <div className="container mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="lg:col-span-1 space-y-6">
            <div className="flex items-center space-x-3">
              <img 
                src={intelligemLogo} 
                alt="IntelliGem" 
                className="w-12 h-12"
              />
              <span className="text-foreground font-semibold text-xl">IntelliGem</span>
            </div>
            <p className="text-foreground/60 text-sm leading-relaxed">
              Transformamos dados em decisões estratégicas através de soluções inteligentes de BI, IA e Automação.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.linkedin.com/company/108613157" target="_blank" rel="noopener noreferrer" className="text-foreground/60 hover:text-blue-400 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a href="https://www.instagram.com/intelligemconsult" target="_blank" rel="noopener noreferrer" className="text-foreground/60 hover:text-pink-400 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="text-foreground">Links Rápidos</h3>
            <ul className="space-y-3">
              <li><a href="#sobre" className="text-foreground/60 hover:text-foreground transition-colors text-sm">Sobre Nós</a></li>
              <li><a href="#solucoes" className="text-foreground/60 hover:text-foreground transition-colors text-sm">Soluções</a></li>
              <li><a href="#cases" className="text-foreground/60 hover:text-foreground transition-colors text-sm">Cases de Sucesso</a></li>
              <li><a href="#blog" className="text-foreground/60 hover:text-foreground transition-colors text-sm">Blog</a></li>
              <li><a href="#" className="text-foreground/60 hover:text-foreground transition-colors text-sm">Carreiras</a></li>
            </ul>
          </div>

          {/* Solutions */}
          <div className="space-y-6">
            <h3 className="text-foreground">Soluções</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-foreground/60 hover:text-emerald-400 transition-colors text-sm">GemFlow - Automação</a></li>
              <li><a href="#" className="text-foreground/60 hover:text-blue-400 transition-colors text-sm">GemInsights - BI</a></li>
              <li><a href="#" className="text-foreground/60 hover:text-purple-400 transition-colors text-sm">GemMind - IA</a></li>
              <li><a href="#" className="text-foreground/60 hover:text-foreground transition-colors text-sm">Consultoria</a></li>
              <li><a href="#" className="text-foreground/60 hover:text-foreground transition-colors text-sm">Suporte</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-6">
            <h3 className="text-foreground">Contato</h3>
            <ul className="space-y-3">
              <li className="text-foreground/60 text-sm flex items-center space-x-2">
                <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>contato@intelligem.com</span>
              </li>
              <li className="text-foreground/60 text-sm flex items-center space-x-2">
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>+55 (11) 9999-9999</span>
              </li>
              <li className="text-foreground/60 text-sm flex items-start space-x-2">
                <svg className="w-4 h-4 text-purple-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>São Paulo, SP - Brasil</span>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8 bg-border" />

        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-foreground/50 text-sm">
            © 2025 IntelliGem. Todos os direitos reservados.
          </p>
          <div className="flex space-x-6">
            <a href="#" className="text-foreground/50 hover:text-foreground text-sm transition-colors">Política de Privacidade</a>
            <a href="#" className="text-foreground/50 hover:text-foreground text-sm transition-colors">Termos de Uso</a>
            <a href="#" className="text-foreground/50 hover:text-foreground text-sm transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}