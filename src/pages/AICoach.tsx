import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { useAIQuota } from '@/hooks/useAIQuota';
import { sendMessageToAI, ChatMessage } from '@/services/geminiService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, ArrowRight, Send, Bot, User, Loader2, MessageSquare } from 'lucide-react';
import FitBarcaLogo from '@/components/FitBarcaLogo';
import LanguageSelector from '@/components/LanguageSelector';
import QuotaLimitModal from '@/components/ai/QuotaLimitModal';
import { toast } from '@/hooks/use-toast';

interface DisplayMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const AICoach = () => {
  const { t, isRtl, language } = useLanguage();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { currentCount, limit, isLimitReached, checkAndIncrement, isLoading: quotaLoading } = useAIQuota();
  
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const BackIcon = isRtl ? ArrowRight : ArrowLeft;

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    // Check quota first - show modal if limit reached
    if (isLimitReached) {
      setShowQuotaModal(true);
      return;
    }

    const userMessage = inputValue.trim();
    setInputValue('');

    // Add user message to display
    const userDisplayMessage: DisplayMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
    };
    setMessages(prev => [...prev, userDisplayMessage]);
    setIsLoading(true);

    // Check and increment quota atomically in database
    const quotaResult = await checkAndIncrement();
    
    if (!quotaResult.success) {
      // Quota exceeded - show modal and remove user message
      setMessages(prev => prev.filter(m => m.id !== userDisplayMessage.id));
      setShowQuotaModal(true);
      setIsLoading(false);
      return;
    }

    try {
      const response = await sendMessageToAI(userMessage, chatHistory, language);
      
      // Update chat history for context
      setChatHistory(prev => [
        ...prev,
        { role: 'user', content: userMessage },
        { role: 'assistant', content: response },
      ]);

      // Add assistant message to display
      const assistantDisplayMessage: DisplayMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
      };
      setMessages(prev => [...prev, assistantDisplayMessage]);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : t('aiCoachError');
      
      // Show toast for specific errors
      if (errorMsg.includes('Rate limit')) {
        toast({ title: "Rate Limited", description: errorMsg, variant: "destructive" });
      } else if (errorMsg.includes('credits')) {
        toast({ title: "Credits Exhausted", description: errorMsg, variant: "destructive" });
      }
      
      const errorMessage: DisplayMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: errorMsg,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading || quotaLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#004d98] via-[#0a1628] to-[#a50044] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#004d98] via-[#0a1628] to-[#a50044] flex flex-col" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Quota Modal */}
      <QuotaLimitModal 
        isOpen={showQuotaModal} 
        onClose={() => setShowQuotaModal(false)} 
      />

      {/* Header */}
      <header className="p-4 flex items-center justify-between border-b border-white/10 backdrop-blur-sm bg-black/20">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard')}
            className="min-w-[40px] min-h-[40px] text-white/80 hover:text-[#A50044] hover:bg-white/10 transition-all duration-200 rounded-full"
            aria-label={t('back')}
          >
            <BackIcon className="h-5 w-5" />
          </Button>
          <FitBarcaLogo />
        </div>
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold text-white hidden sm:block">{t('aiCoachTitle')}</h1>
          <LanguageSelector />
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-white/60 space-y-4">
            <Bot className="h-16 w-16 text-white/40" />
            <p className="text-lg">{t('aiCoachWelcome')}</p>
          </div>
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start gap-3 ${message.role === 'user' ? (isRtl ? 'flex-row-reverse' : 'flex-row') : ''}`}
          >
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              message.role === 'user' 
                ? 'bg-[#a50044]' 
                : 'bg-[#004d98]'
            }`}>
              {message.role === 'user' ? (
                <User className="h-4 w-4 text-white" />
              ) : (
                <Bot className="h-4 w-4 text-white" />
              )}
            </div>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
              message.role === 'user'
                ? 'bg-[#a50044]/80 text-white'
                : 'bg-white/10 backdrop-blur-sm text-white border border-white/20'
            }`}>
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#004d98] flex items-center justify-center">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/20">
              <Loader2 className="h-5 w-5 text-white animate-spin" />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-white/10 backdrop-blur-sm bg-black/20">
        <div className="max-w-4xl mx-auto space-y-2">
          {/* Daily Limit Counter */}
          <div className="flex items-center justify-between text-sm">
            <div className={`flex items-center gap-2 ${isLimitReached ? 'text-red-400' : 'text-white/60'}`}>
              <MessageSquare className="h-4 w-4" />
              <span>
                {t('dailyLimit')}: {currentCount}/{limit}
              </span>
            </div>
            {isLimitReached && (
              <button 
                onClick={() => setShowQuotaModal(true)}
                className="text-red-400 text-xs hover:text-red-300 transition-colors underline"
              >
                {t('dailyLimitReached')}
              </button>
            )}
          </div>
          
          {/* Input Row */}
          <div className="flex gap-3">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isLimitReached ? t('dailyLimitReached') : t('aiCoachPlaceholder')}
              disabled={isLoading || isLimitReached}
              className={`flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40 ${
                isLimitReached ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading || isLimitReached}
              className={`px-6 ${
                isLimitReached 
                  ? 'bg-gray-500 cursor-not-allowed opacity-50' 
                  : 'bg-[#a50044] hover:bg-[#cc0055]'
              } text-white`}
            >
              <Send className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">{t('aiCoachSend')}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AICoach;
