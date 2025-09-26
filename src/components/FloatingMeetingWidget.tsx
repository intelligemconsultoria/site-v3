import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Calendar, X, MessageCircle } from "lucide-react";
import { MeetingRequestModal } from "./MeetingRequestModal";
import { useMeetingModal } from "../hooks/useMeetingModal";

interface FloatingMeetingWidgetProps {
  disabled?: boolean;
}

export function FloatingMeetingWidget({ disabled = false }: FloatingMeetingWidgetProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const { isOpen, openGeneralModal, closeModal, currentSolution, currentSource } = useMeetingModal({
    sourcePage: 'floating-widget'
  });

  // Mostrar widget após 3 segundos na página
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Verificar se já foi minimizado antes
  useEffect(() => {
    const wasMinimized = localStorage.getItem('meeting-widget-minimized');
    if (wasMinimized === 'true') {
      setIsMinimized(true);
    }
  }, []);

  const handleMinimize = () => {
    setIsMinimized(true);
    localStorage.setItem('meeting-widget-minimized', 'true');
  };

  const handleExpand = () => {
    setIsMinimized(false);
    localStorage.removeItem('meeting-widget-minimized');
  };

  const handleOpenModal = () => {
    openGeneralModal('floating-widget');
  };

  if (disabled || !isVisible) return null;

  return (
    <>
      {/* Widget Flutuante */}
      <div className="fixed bottom-6 right-6 z-50">
        {isMinimized ? (
          /* Versão Minimizada */
          <Button
            onClick={handleExpand}
            className="w-14 h-14 rounded-full bg-gradient-to-r from-emerald-400 to-blue-500 hover:from-emerald-500 hover:to-blue-600 text-white shadow-lg shadow-emerald-400/25 hover:shadow-emerald-400/40 transition-all duration-300 hover:scale-110"
          >
            <MessageCircle className="w-6 h-6" />
          </Button>
        ) : (
          /* Versão Expandida */
          <div className="bg-card/95 backdrop-blur-lg border border-border rounded-lg shadow-xl p-4 max-w-sm animate-in slide-in-from-bottom-2 duration-300">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-full flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-semibold text-sm">Agendar Conversa</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMinimize}
                className="w-6 h-6 p-0 hover:bg-muted/50"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Conteúdo */}
            <div className="space-y-3">
              <p className="text-sm text-foreground/70">
                Converse com nossos especialistas e descubra como transformar seus dados em vantagem competitiva.
              </p>

              <div className="flex items-center gap-2 text-xs text-foreground/60">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                  <span>Gratuito</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>30 min</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span>Online</span>
                </div>
              </div>

              <Button
                onClick={handleOpenModal}
                className="w-full bg-gradient-to-r from-emerald-400 to-blue-500 hover:from-emerald-500 hover:to-blue-600 text-white text-sm py-2"
              >
                Agendar Agora
              </Button>

              <div className="text-center">
                <button
                  onClick={handleMinimize}
                  className="text-xs text-foreground/50 hover:text-foreground/70 transition-colors"
                >
                  Ocultar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Agendamento */}
      <MeetingRequestModal
        isOpen={isOpen}
        onClose={closeModal}
        prefilledSolution={currentSolution}
        sourcePage={currentSource}
      />
    </>
  );
}