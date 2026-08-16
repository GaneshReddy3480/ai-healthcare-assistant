import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  ShieldAlert, 
  AlertTriangle, 
  Trash2, 
  User as UserIcon, 
  Pill, 
  RefreshCw, 
  Info,
  ChevronRight,
  HelpCircle,
  PhoneCall,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Languages
} from 'lucide-react';
import { ChatMessage, Medicine } from '../types';
import { api } from '../services/api';

interface AIChatViewProps {
  initialMedicineContext?: Medicine | null;
  onNavigateToMedicine?: (medicineName: string) => void;
}

export const AIChatView: React.FC<AIChatViewProps> = ({
  initialMedicineContext,
  onNavigateToMedicine
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeContext, setActiveContext] = useState<Medicine | null>(initialMedicineContext || null);
  const [isListening, setIsListening] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'es' | 'hi'>('en');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    activeContext 
      ? `What are common precautions for ${activeContext.name}?` 
      : 'What is paracetamol generally used for?',
    activeContext 
      ? `Can ${activeContext.name} be taken with food?` 
      : 'What should I ask my doctor about a new prescription?',
    'Explain the difference between generic and branded medicines.',
    'What are common signs of an allergic reaction to antibiotics?'
  ];

  // Speech Recognition setup
  const toggleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice dictation is supported on Chrome, Edge, and modern browsers.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = selectedLanguage === 'hi' ? 'hi-IN' : selectedLanguage === 'es' ? 'es-ES' : 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputMessage(prev => prev ? `${prev} ${transcript}` : transcript);
        }
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch (e) {
      console.error('Speech recognition error:', e);
      setIsListening(false);
    }
  };

  // Text-To-Speech
  const handleSpeakMessage = (msgId: string, text: string) => {
    if (!('speechSynthesis' in window)) return;
    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/\*\*/g, '').replace(/###/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.95;
    utterance.lang = selectedLanguage === 'hi' ? 'hi-IN' : selectedLanguage === 'es' ? 'es-ES' : 'en-US';
    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);
    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  // Initialize welcome message
  useEffect(() => {
    const welcomeText = activeContext
      ? `Hello! I am your MediFind AI Assistant. I see you are inquiring about **${activeContext.name}** (${activeContext.generic_name}).\n\nHow can I help you understand this medication's general uses, precautions, or administration today?`
      : `Hello! I am your MediFind AI Health Assistant.\n\nI can help you understand medicine information, common uses, typical precautions, dosages, and questions to ask your doctor or pharmacist.\n\n*What health or medicine topic would you like to explore?*`;

    setMessages([
      {
        id: 'msg-welcome',
        sender: 'assistant',
        text: welcomeText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggested_questions: suggestedQuestions
      }
    ]);
  }, [activeContext]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const history = messages
        .filter(m => m.sender === 'user' || m.sender === 'assistant')
        .slice(-4)
        .map(m => ({ sender: m.sender as 'user' | 'assistant', text: m.text }));

      const response = await api.askAIAssistant(
        text, 
        history, 
        activeContext ? `${activeContext.name} (${activeContext.generic_name})` : undefined
      );

      const botMsg: ChatMessage = {
        id: `msg-bot-${Date.now()}`,
        sender: 'assistant',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        is_emergency: response.is_emergency,
        suggested_questions: response.suggested_questions
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      console.error('AI assistant error:', err);
      const fallbackMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        sender: 'assistant',
        text: 'I apologize, but I encountered a momentary connection issue. Please consult your physician or licensed pharmacist for medical advice.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: 'Chat history cleared. How can I help you with your health or medicine questions today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggested_questions: suggestedQuestions
      }
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#FFFFFF] p-6 sm:p-8 rounded-3xl border border-[#DDE8D2] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DDE8D2] text-[#173B2B] text-xs font-bold mb-2">
            <Sparkles size={14} className="text-[#6B9B63]" />
            <span>AI Health & Medication Support</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-[#17231D]">
            Your Health Assistant
          </h2>
          <p className="text-xs sm:text-sm text-[#69736D] mt-1 max-w-2xl leading-relaxed">
            Ask general health questions and learn more about medicines, mechanisms, precautions, and wellness.
          </p>
        </div>

        {/* Clear Chat Button */}
        <button
          onClick={handleClearChat}
          className="self-start sm:self-center flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#F7F9F4] hover:bg-[#FDF0F0] text-[#69736D] hover:text-[#D95C5C] text-xs font-semibold border border-[#DDE8D2] transition-colors"
          title="Clear current conversation"
        >
          <Trash2 size={14} />
          <span>Clear Chat</span>
        </button>
      </div>

      {/* Visible Mandatory Medical Disclaimer */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-[#DDE8D2]/40 border border-[#6B9B63]/40 flex items-start gap-3 text-xs text-[#17231D]">
        <Info size={18} className="text-[#173B2B] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Medical Notice:</strong> AI-generated information is for general educational purposes and is not a substitute for advice, clinical diagnosis, or treatment from a qualified healthcare professional. If you have an acute emergency, call your local emergency helpline (108 / 112 / 911) immediately.
        </p>
      </div>

      {/* Active Medicine Context Chip if attached */}
      {activeContext && (
        <div className="p-3 rounded-2xl bg-white border border-[#DDE8D2] flex items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-2 text-xs">
            <Pill size={15} className="text-[#6B9B63]" />
            <span className="text-[#69736D]">Active Discussion Context:</span>
            <strong className="text-[#173B2B] font-bold">{activeContext.name}</strong>
            <span className="text-[#69736D] hidden sm:inline">({activeContext.generic_name})</span>
          </div>
          <button
            onClick={() => setActiveContext(null)}
            className="text-xs text-[#D95C5C] hover:underline font-semibold"
          >
            Clear Context
          </button>
        </div>
      )}

      {/* Chat Container */}
      <div className="bg-[#FFFFFF] rounded-3xl border border-[#DDE8D2] shadow-sm flex flex-col h-[480px] sm:h-[580px] lg:h-[650px] overflow-hidden">
        
        {/* Messages List */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            
            return (
              <div 
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-[#173B2B] text-[#DDE8D2] flex items-center justify-center shrink-0 mt-1 shadow-2xs">
                    <Bot size={17} />
                  </div>
                )}

                <div className={`max-w-[85%] sm:max-w-[75%] space-y-2`}>
                  {/* Bubble */}
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                    isUser
                      ? 'bg-[#173B2B] text-white rounded-br-xs shadow-xs'
                      : msg.is_emergency
                      ? 'bg-[#FFF0F0] text-[#17231D] border-2 border-[#D95C5C] rounded-bl-xs'
                      : 'bg-[#F7F9F4] text-[#17231D] border border-[#DDE8D2] rounded-bl-xs'
                  }`}>
                    {/* Emergency Alert Header if triggered */}
                    {msg.is_emergency && (
                      <div className="mb-3 p-2.5 rounded-xl bg-[#D95C5C] text-white flex items-center gap-2 font-bold text-xs">
                        <PhoneCall size={15} />
                        <span>EMERGENCY HELPLINE: Call 108 / 112 / 911 Now</span>
                      </div>
                    )}

                    {/* Markdown / Line Break Formatter */}
                    <div className="space-y-2 whitespace-pre-wrap">
                      {msg.text.split('\n\n').map((para, i) => (
                        <p key={i}>
                          {para.split('**').map((part, index) => 
                            index % 2 === 1 ? <strong key={index} className={isUser ? 'text-[#DDE8D2]' : 'text-[#173B2B]'}>{part}</strong> : part
                          )}
                        </p>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-black/5">
                      <span className={`text-[10px] ${isUser ? 'text-white/60' : 'text-[#69736D]'}`}>
                        {msg.timestamp}
                      </span>

                      {!isUser && (
                        <button
                          onClick={() => handleSpeakMessage(msg.id, msg.text)}
                          className="p-1 rounded-lg hover:bg-black/5 text-[#69736D] hover:text-[#173B2B] transition-colors flex items-center gap-1 text-[11px]"
                          title={speakingMsgId === msg.id ? "Stop voice" : "Listen aloud"}
                        >
                          {speakingMsgId === msg.id ? (
                            <VolumeX size={13} className="text-[#D95C5C] animate-pulse" />
                          ) : (
                            <Volume2 size={13} />
                          )}
                          <span>{speakingMsgId === msg.id ? 'Stop' : 'Listen'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Suggested follow-up chips */}
                  {msg.suggested_questions && msg.suggested_questions.length > 0 && !isLoading && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {msg.suggested_questions.map((q, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(q)}
                          className="text-[11px] font-medium text-[#173B2B] bg-[#DDE8D2]/40 hover:bg-[#DDE8D2] border border-[#6B9B63]/30 px-3 py-1 rounded-full transition-all text-left flex items-center gap-1 shadow-2xs"
                        >
                          <HelpCircle size={12} className="text-[#6B9B63]" />
                          <span>{q}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-[#6B9B63] text-white flex items-center justify-center shrink-0 mt-1 shadow-2xs">
                    <UserIcon size={16} />
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex gap-3 justify-start items-center animate-in fade-in">
              <div className="w-8 h-8 rounded-xl bg-[#173B2B] text-[#DDE8D2] flex items-center justify-center shrink-0">
                <Bot size={17} />
              </div>
              <div className="bg-[#F7F9F4] border border-[#DDE8D2] px-4 py-3 rounded-2xl flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#6B9B63] animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-[#6B9B63] animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 rounded-full bg-[#6B9B63] animate-bounce [animation-delay:0.4s]"></span>
                <span className="text-xs text-[#69736D] font-medium ml-2">Consulting clinical guidelines...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-[#F7F9F4] border-t border-[#DDE8D2] space-y-2">
          
          <div className="flex items-center justify-between text-[11px] px-1 text-[#69736D]">
            <div className="flex items-center gap-2">
              <Languages size={13} className="text-[#6B9B63]" />
              <span>Guidance Language:</span>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value as any)}
                className="bg-white border border-[#DDE8D2] rounded-lg px-2 py-0.5 text-xs text-[#17231D] font-medium focus:outline-none"
              >
                <option value="en">English (US)</option>
                <option value="es">Español</option>
                <option value="hi">हिंदी (Hindi)</option>
              </select>
            </div>
            {isListening && (
              <span className="text-[#D95C5C] font-bold animate-pulse flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#D95C5C]"></span>
                Listening to voice dictation...
              </span>
            )}
          </div>

          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              id="input-ai-chat"
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={activeContext ? `Ask about ${activeContext.name}...` : "Ask or speak your medicine query..."}
              disabled={isLoading}
              className="flex-1 px-4 py-3 rounded-2xl bg-white border border-[#DDE8D2] text-sm text-[#17231D] placeholder:text-[#69736D] focus:outline-none focus:border-[#173B2B] focus:ring-1 focus:ring-[#173B2B] transition-all shadow-2xs"
            />

            <button
              type="button"
              onClick={toggleVoiceInput}
              className={`p-3 rounded-2xl transition-all shadow-xs flex items-center justify-center ${
                isListening 
                  ? 'bg-[#D95C5C] text-white animate-pulse' 
                  : 'bg-white border border-[#DDE8D2] text-[#173B2B] hover:bg-[#DDE8D2]'
              }`}
              title={isListening ? "Stop Voice Input" : "Dictate with Voice"}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>

            <button
              id="btn-send-ai-chat"
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className={`p-3 rounded-2xl transition-all shadow-xs flex items-center justify-center ${
                inputMessage.trim() && !isLoading
                  ? 'bg-[#173B2B] text-white hover:bg-[#173B2B]/90 cursor-pointer'
                  : 'bg-[#DDE8D2] text-[#69736D] cursor-not-allowed opacity-60'
              }`}
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
