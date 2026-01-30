"use client";

import { useState, FormEvent, useEffect, useRef, useCallback } from "react";
import { fetchAPI } from "@/lib/api";

type Msg = { role: "user" | "ai" | "sys"; content: string };

const SUGGESTIONS = [
  { icon: "📄", text: "Resumir documento", color: "text-blue-500", border: "border-blue-200" },
  { icon: "📊", text: "Analizar datos", color: "text-green-600", border: "border-green-200" },
  { icon: "📝", text: "Escribir correo", color: "text-orange-500", border: "border-orange-200" },
  { icon: "🎨", text: "Crear diseño", color: "text-purple-500", border: "border-purple-200" },
];

const Typewriter = ({ text, onUpdate, onComplete }: { text: string, onUpdate?: () => void, onComplete?: () => void }) => {
  const [d, setD] = useState("");
  useEffect(() => {
    const w = text.split(/(\s+)/);
    let i = 0;
    const t = setInterval(() => {
      setD(w.slice(0, ++i).join(""));
      onUpdate?.();
      if (i >= w.length) {
        clearInterval(t);
        onComplete?.();
      }
    }, 20);
    return () => clearInterval(t);
  }, [text, onUpdate, onComplete]);
  return <>{d}</>;
};

export default function Chat() {
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  
  const fileRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const hasMsgs = msgs.length > 0;

  const scrollToBottom = useCallback(() => endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }), []);
  const finishTyping = useCallback(() => setTyping(false), []);

  useEffect(() => scrollToBottom(), [msgs, loading, scrollToBottom]);

  useEffect(() => {
    const toggle = (e: any) => {
      if (e.type === "mousedown" && showMenu && !menuRef.current?.contains(e.target as Node) && !btnRef.current?.contains(e.target as Node)) setShowMenu(false);
      if (['dragenter', 'dragover', 'dragleave', 'drop'].includes(e.type)) {
        e.preventDefault();
        setDragActive(e.type === "dragenter" || e.type === "dragover");
      }
    };
    ['mousedown', 'dragenter', 'dragover', 'dragleave', 'drop'].forEach(ev => document.addEventListener(ev, toggle));
    return () => ['mousedown', 'dragenter', 'dragover', 'dragleave', 'drop'].forEach(ev => document.removeEventListener(ev, toggle));
  }, [showMenu]);

  const addMsg = (role: Msg["role"], content: string) => setMsgs(p => [...p, { role, content }]);

  const onUpload = (file: File) => {
    addMsg("sys", `Guardando "${file.name}"...`);
    setTimeout(() => addMsg("sys", `"${file.name}" guardado.`), 1000);
    setDragActive(false);
    setShowMenu(false);
  };

  const submit = async (e: FormEvent, txt?: string) => {
    e.preventDefault();
    const q = txt || input.trim();
    if (!q || loading || typing) return;
    setInput(""); setLoading(true); addMsg("user", q);
    
    try {
      const { answer, response, ...rest } = await fetchAPI("/query", { method: "POST", params: { q } });
      setTyping(true);
      addMsg("ai", answer || response || JSON.stringify(rest));
    } catch { addMsg("sys", "Error: Falló la conexión"); }
    finally { setLoading(false); }
  };

  const displayGroups = msgs.reduce((acc, m) => {
    if (m.role === "user" || !acc.length) acc.push([]);
    acc[acc.length - 1].push(m);
    return acc;
  }, [] as Msg[][]);



  return (
    <div className="relative min-h-screen bg-white font-sans text-gray-900">
      
      <div className={`absolute left-1/2 -translate-x-1/2 transition-all duration-500 z-10 ${hasMsgs ? "opacity-0 invisible top-0" : "top-40 opacity-100 visible"}`}>
        <div className="flex flex-col items-center gap-4">
          <img src="/logo.svg" alt="PromptGPA Logo" className="w-16 h-16 opacity-90" />
          <h1 className="text-4xl font-semibold tracking-tight text-gray-800">PromptGPA</h1>
        </div>
      </div>

      {/* Chat Messages Area */}
      <main className="w-full max-w-3xl mx-auto pt-24 pb-32 px-4 flex flex-col min-h-screen">
        {displayGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="w-full flex flex-col">
            {group.map((m, i) => (
              <div key={i} className={`mb-6 p-4 rounded-2xl max-w-[85%] w-fit leading-relaxed shadow-sm text-[15px] animate-in slide-in-from-bottom-2 fade-in duration-300 ${
                m.role === "user" ? "ml-auto bg-[#826dd2] text-white rounded-br-none" : 
                m.role === "sys" ? "mx-auto bg-gray-100 text-gray-500 text-xs py-1 px-3 rounded-full shadow-none" : 
                "bg-white border border-gray-100 text-gray-800 rounded-bl-none"
              }`}>
                {m.role === "ai" ? <Typewriter text={m.content} onUpdate={scrollToBottom} onComplete={finishTyping} /> : m.content}
              </div>
            ))}
            {groupIndex === displayGroups.length - 1 && loading && (
              <div className="flex items-center gap-2 text-gray-400 text-sm ml-4 mb-6 animate-pulse">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            )}
          </div>
        ))}
        <div ref={endRef} />
      </main>

      <div className={`fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-md transition-all duration-500 z-20 ${hasMsgs ? "h-28 border-t border-gray-100" : "h-0 opacity-0"}`} />

      <div className={`fixed left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-30 transition-all duration-700 cubic-bezier(0.2, 0.8, 0.2, 1) ${msgs.length ? "bottom-8" : "top-1/2 -translate-y-1/2"}`}>
        <form onSubmit={submit} className="relative w-full shadow-2xl rounded-full bg-white">
          <button
            ref={btnRef}
            type="button"
            onClick={() => setShowMenu(!showMenu)}
            aria-label="Toggle menu"
            className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-[#826dd2] transition-colors"
          >
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          </button>
          
          {/* Popup Menu */}
          {showMenu && (
            <div 
              ref={menuRef} 
              className="absolute bottom-full left-0 mb-3 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-2 zoom-in-95 origin-bottom-left"
            >
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
              >
                <span className="p-1.5 bg-blue-50 text-blue-600 rounded-md">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                </span>
                Subir documentos
              </button>
            </div>
          )}

          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={msgs.length ? "Envía un mensaje..." : "¿En qué puedo ayudarte hoy?"}
            disabled={loading || typing}
            aria-label="Chat input"
            className="w-full pl-16 pr-14 py-4 rounded-full border border-gray-200 text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#826dd2]/30 focus:border-[#826dd2] text-gray-800 placeholder-gray-400 bg-white transition-all"
          />
          
          <button 
            type="submit" 
            disabled={loading || typing || !input.trim()}
            aria-label="Send message"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-[#826dd2] text-white hover:bg-[#715bc7] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all shadow-md active:scale-95"
          >
            <svg className="w-5 h-5 transform rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path></svg>
          </button>
        </form>
        
        <input type="file" ref={fileRef} className="hidden" onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])} />

        {!msgs.length && (
          <div className="flex flex-wrap justify-center gap-3 mt-8 px-2 animate-in fade-in delay-200 duration-700">
            {SUGGESTIONS.map((s, i) => (
              <button 
                key={i}
                onClick={(e) => submit(e, s.text)}
                className={`group flex items-center gap-2 px-4 py-2.5 rounded-full border bg-white/50 backdrop-blur-sm text-sm font-medium text-gray-600 hover:bg-white hover:shadow-md transition-all duration-200 ${s.border}`}
              >
                <span className={`text-lg transition-transform group-hover:scale-110 ${s.color}`}>{s.icon}</span> 
                {s.text}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Drag Overlay */}
      {dragActive && (
        <div 
          className="fixed inset-0 z-50 bg-[#826dd2]/10 flex items-center justify-center backdrop-blur-sm animate-in fade-in duration-200"
          onDragLeave={(e) => !e.relatedTarget && setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            if(e.dataTransfer.files[0]) onUpload(e.dataTransfer.files[0]);
          }}
          onDragOver={(e) => e.preventDefault()}
        >
          <div className="transform transition-transform scale-100 animate-in zoom-in-95 duration-200 border-4 border-dashed border-[#826dd2] bg-white/80 rounded-3xl p-16 text-center shadow-2xl pointer-events-none">
            <svg className="w-20 h-20 mx-auto mb-6 text-[#826dd2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <h3 className="text-2xl font-bold text-[#826dd2] mb-2">Suelta tu archivo aquí</h3>
            <p className="text-gray-500">Lo procesaremos automáticamente</p>
          </div>
        </div>
      )}
    </div>
  );
}
