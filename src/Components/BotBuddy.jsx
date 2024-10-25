import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Settings, RefreshCcw, Moon, Sun, MessageSquare, Mic, MicOff, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Gemini API with your API key
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.error('API key not found. Please check your .env file');
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });
let chatHistory = null;

const BotBuddy = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const messagesEndRef = useRef(null);
  const [error, setError] = useState(null);
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  const chats = [
    { id: 1, title: "How to learn React?", date: "2024-10-25" },
    { id: 2, title: "Explain machine learning", date: "2024-10-25" },
    { id: 3, title: "JavaScript best practices", date: "2024-10-25" }
  ];
  const [activeChat, setActiveChat] = useState(1);

  // Initialize chat
  useEffect(() => {
    const initChat = async () => {
      try {
        const chat = await model.startChat();
        chatHistory = chat;
      } catch (err) {
        setError("Failed to initialize chat");
        console.error("Chat initialization error:", err);
      }
    };
    initChat();
  }, [activeChat]);

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Dark mode
  useEffect(() => {
    document.body.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const generateResponse = async (userInput) => {
    if (!chatHistory) {
      setError("Chat not initialized. Please try again.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await chatHistory.sendMessage(userInput);
      const response = await result.response;
      const text = response.text();
      
      setMessages(prev => [...prev, { role: 'assistant', content: text }]);
    } catch (err) {
      console.error("Error generating response:", err);
      setError("Failed to generate response. Please try again.");
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const userMessage = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    await generateResponse(userMessage.content);
  };
  
  return (
    <div className={`h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-purple-50 to-blue-50'}`}>
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden 
          ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <div className="p-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className={`font-bold text-xl ${darkMode ? 'text-white' : 'text-gray-800'}`}>Chat History</h2>
              <button onClick={() => setSidebarOpen(false)}>
                <PanelLeftClose className={`w-5 h-5 ${darkMode ? 'text-white' : 'text-gray-600'}`} />
              </button>
            </div>
            <div className="space-y-2">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => setActiveChat(chat.id)}
                  className={`p-3 rounded-lg cursor-pointer flex items-center gap-3 transition-colors
                    ${activeChat === chat.id 
                      ? (darkMode ? 'bg-purple-600' : 'bg-purple-100') 
                      : (darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100')}`}
                >
                  <MessageSquare className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                  <div>
                    <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{chat.title}</p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{chat.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className={`p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm flex items-center justify-between`}>
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(!sidebarOpen)}>
                {sidebarOpen ? (
                  <PanelLeftClose className={`w-6 h-6 ${darkMode ? 'text-white' : 'text-gray-600'}`} />
                ) : (
                  <PanelLeftOpen className={`w-6 h-6 ${darkMode ? 'text-white' : 'text-gray-600'}`} />
                )}
              </button>
              <div className="flex items-center gap-2">
                <Bot className={`w-8 h-8 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Bot Buddy AI 
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                {darkMode ? (
                  <Sun className="w-6 h-6 text-yellow-400" />
                ) : (
                  <Moon className="w-6 h-6 text-gray-600" />
                )}
              </button>
            </div>
          </div>

          {/* Chat Container */}
          <div className={`flex-1 overflow-hidden p-4 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
            <div className="h-full flex flex-col">
      {/* Inside the messages area*/}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex items-start gap-3 ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                <Bot className="w-5 h-5 text-purple-600" />
              </div>
            )}
            <div
              className={`rounded-2xl px-4 py-2 max-w-[85%] md:max-w-[80%] ${
                message.role === 'user'
                  ? 'bg-purple-600 text-white'
                  : (darkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800')
              }`}
            >
              {message.content}
            </div>
            {message.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className={`flex items-center gap-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <RefreshCcw className="w-4 h-4 animate-spin" />
            Generating response...
          </div>
        )}
        {error && <ErrorMessage message={error} />}
        <div ref={messagesEndRef} />
      </div>

              {/* Input Area */}
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className={`flex-1 p-4 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent
                    ${darkMode 
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-200 text-gray-800 placeholder-gray-500'}`}
                />
                <button
                  type="submit"
                  className="bg-purple-600 text-white p-4 rounded-xl hover:bg-purple-700 transition-colors flex items-center justify-center"
                  disabled={loading}
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BotBuddy;