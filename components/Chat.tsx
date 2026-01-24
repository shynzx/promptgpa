"use client";

import { useState, FormEvent } from "react";
import { fetchAPI } from "@/lib/api";
import FileDropzone from "@/components/FileDropzone";

export default function Chat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addMsg = (text: string) => setMessages(p => [...p, text]);

  const onUpload = (file: File) => {
    addMsg(`Sistema: Guardando "${file.name}"...`);
    setTimeout(() => addMsg(`Sistema: "${file.name}" guardado.`), 1000);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const q = input;
    setInput("");
    setLoading(true);
    addMsg(`Yo: ${q}`);

    try {
      const res = await fetchAPI("/query", { method: "POST", params: { q } });
      addMsg(`IA: ${res.answer || res.response || JSON.stringify(res)}`);
    } catch {
      addMsg("Error: Falló la conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="border border-gray-300 rounded-lg p-3 h-80 overflow-y-auto bg-white shadow-sm font-sans text-sm">
        {messages.map((m, i) => <div key={i} className="mb-2 border-b border-gray-100 pb-1 last:border-0">{m}</div>)}
        {loading && <div className="text-gray-400 italic">Escribiendo...</div>}
      </div>

      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe tu mensaje..."
          disabled={loading}
          className="flex-1 border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button 
          type="submit" 
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Enviar
        </button>
      </form>

      <FileDropzone onFileSelect={onUpload} />
    </div>
  );
}
