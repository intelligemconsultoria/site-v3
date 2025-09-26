import { useState } from 'react';

interface UseMeetingModalProps {
  prefilledSolution?: 'GemFlow' | 'GemInsights' | 'GemMind' | 'All';
  sourcePage?: string;
}

export function useMeetingModal({ 
  prefilledSolution = 'All', 
  sourcePage = 'website' 
}: UseMeetingModalProps = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentSolution, setCurrentSolution] = useState<'GemFlow' | 'GemInsights' | 'GemMind' | 'All'>(prefilledSolution);
  const [currentSource, setCurrentSource] = useState(sourcePage);

  const openModal = (solution?: 'GemFlow' | 'GemInsights' | 'GemMind' | 'All', source?: string) => {
    if (solution) setCurrentSolution(solution);
    if (source) setCurrentSource(source);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  const openGemFlowModal = (source?: string) => {
    openModal('GemFlow', source || 'gemflow-page');
  };

  const openGemInsightsModal = (source?: string) => {
    openModal('GemInsights', source || 'geminsights-page');
  };

  const openGemMindModal = (source?: string) => {
    openModal('GemMind', source || 'gemmind-page');
  };

  const openGeneralModal = (source?: string) => {
    openModal('All', source || 'general');
  };

  return {
    isOpen,
    openModal,
    closeModal,
    openGemFlowModal,
    openGemInsightsModal,
    openGemMindModal,
    openGeneralModal,
    currentSolution,
    currentSource
  };
}