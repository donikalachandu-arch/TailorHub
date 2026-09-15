import React, { useState } from 'react';
import { X, Send, MessageSquare, User, Store } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ChatDrawerProps {
  order: any;
  isOpen: boolean;
  onClose: () => void;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({ order, isOpen, onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([
    { id: '1', sender_id: 'usr-tailor-1', sender_name: 'Ramesh Master Tailor', message: 'Hello! Fabric received. Cutting started today.', created_at: '10:15 AM' },
    { id: '2', sender_id: 'usr-cust-1', sender_name: 'Vikram Reddy', message: 'Great! Please make sure collar is slim fit.', created_at: '10:18 AM' }
  ]);
  const [inputText, setInputText] = useState('');

  if (!isOpen || !order) return null;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !user) return;

    const newMsg = {
      id: String(Date.now()),
      sender_id: user.id,
      sender_name: user.name,
      message: inputText.trim(),
      created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md h-[550px] p-6 text-white shadow-2xl flex flex-col justify-between relative">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Order Chat ({order.order_number})</h3>
              <p className="text-[10px] text-slate-400">Garment: {order.garment_type}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Stream */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
          {messages.map((m) => {
            const isMe = m.sender_id === user?.id;
            return (
              <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <span className="text-[10px] text-slate-400 mb-0.5">{m.sender_name}</span>
                <div
                  className={`p-3 rounded-2xl max-w-[80%] text-xs leading-relaxed ${
                    isMe
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-br-none shadow-md'
                      : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
                  }`}
                >
                  {m.message}
                </div>
                <span className="text-[9px] text-slate-500 mt-1">{m.created_at}</span>
              </div>
            );
          })}
        </div>

        {/* Input */}
        <form onSubmit={handleSendMessage} className="pt-3 border-t border-slate-800 flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message to tailor..."
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
