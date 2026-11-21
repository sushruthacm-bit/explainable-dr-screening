import React, { useState } from 'react';
import { MessageCircleQuestion, Send, X, AlertTriangle } from 'lucide-react';

export const FloatingPatientChatbot = ({ screeningData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Namaste! I am your ROSHNI Eye Health Assistant. You can ask me what is in your simplified retinal report, understand diabetic retinopathy stages, or get diabetes eye care tips. How can I help you today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const q = input.trim();
    const userMsg = { id: Date.now(), sender: 'user', text: q };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      let reply = '';
      const l = q.toLowerCase();

      if (l.includes('moderate') || l.includes('report') || l.includes('result') || l.includes('od') || l.includes('os')) {
        reply = 'According to your latest scan, your Right Eye (OD) shows Moderate Non-Proliferative Diabetic Retinopathy (tiny microvascular ballooning/exudates), while your Left Eye (OS) shows Mild changes. Vision is preserved, but clinical checkup in 4-6 months is strongly recommended.';
      } else if (l.includes('diabetic retinopathy') || l.includes('dr') || l.includes('what is')) {
        reply = 'Diabetic Retinopathy happens when prolonged high blood sugar weakens the delicate micro-vessels in the retina (back of the eye). It often has no symptoms in early stages, which is why annual retinal imaging is lifesaving!';
      } else if (l.includes('diet') || l.includes('food') || l.includes('sugar') || l.includes('eat')) {
        reply = 'Keep blood sugar stable! Emphasize green vegetables, whole grains, lentils, methi, and antioxidant-rich foods. Minimize white rice, sweets, refined flours, and sugary drinks to keep HbA1c below 7.0%.';
      } else if (l.includes('pain') || l.includes('blind') || l.includes('emergency') || l.includes('sudden') || l.includes('injection') || l.includes('surgery')) {
        reply = '⚠️ IMPORTANT: If you experience sudden vision loss, flashes of light, a dark shadow, or severe eye pain, this may be an acute retinal condition. Please contact your ophthalmologist or visit an emergency eye hospital immediately!';
      } else {
        reply = 'I have analyzed your query based on diabetic eye health guidelines. For specific medical changes or prescriptions, please consult your doctor. If you notice any sudden change in eyesight, contact your doctor immediately.';
      }

      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: reply }]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-terracotta to-sage text-white font-bold text-xs shadow-xl hover:scale-105 active:scale-95 transition-all"
        >
          <div className="w-6 h-6 rounded-full bg-white text-terracotta flex items-center justify-center font-black text-sm">
            ?
          </div>
          <span>Ask ROSHNI Eye Assistant</span>
        </button>
      )}

      {isOpen && (
        <div className="card-earth rounded-3xl bg-white border border-sand w-80 sm:w-96 h-[460px] flex flex-col shadow-2xl overflow-hidden animate-pop">
          <div className="p-3.5 bg-gradient-to-r from-terracotta/90 to-sage/90 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-white text-terracotta flex items-center justify-center text-xs font-bold">
                R
              </div>
              <div>
                <h4 className="font-bold text-xs">ROSHNI Retina Companion</h4>
                <span className="text-[10px] text-ivory-100">&bull; AI Eye Education</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white hover:text-sand text-lg font-bold">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 p-3.5 overflow-y-auto space-y-2.5 text-xs bg-ivory-50/50">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${m.sender === 'user' ? 'bg-sage-600 text-white rounded-br-none' : 'bg-white text-earth-800 border border-sand-light rounded-bl-none shadow-xs'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="text-[11px] text-earth-400 italic">ROSHNI Assistant is typing...</div>
            )}
          </div>

          <form onSubmit={handleSend} className="p-2.5 bg-white border-t border-sand-light flex gap-2">
            <input
              type="text"
              placeholder="Ask about your report, diet, or eye symptoms..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 p-2 rounded-xl border border-sand text-xs text-earth-700 bg-ivory-50/50 focus:outline-none"
            />
            <button type="submit" className="px-3 py-2 rounded-xl bg-terracotta text-white font-bold text-xs shadow-xs">
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default FloatingPatientChatbot;
