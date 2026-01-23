"use client";

import { useState } from "react";
import { fetchAPI } from "@/lib/api";

export default function Chat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const currentInput = input;
    setInput("");
    setMessages((prev) => [...prev, `Yo: ${currentInput}`]);

    try {
      const response = await fetchAPI("/query", {
        method: "POST",
        params: { q: currentInput }, // Enviamos 'q' como parámetro de URL
      });
      
      // Intentamos mostrar la respuesta de forma legible
      let reply = typeof response === "string" ? response : JSON.stringify(response);
      
      // La API devuelve { "answer": "..." }
      if (response && response.answer) {
          reply = response.answer;
      } else if (response && response.response) {
          reply = response.response;
      }
      
      setMessages((prev) => [...prev, `IA: ${reply}`]);
    } catch (error) {
      setMessages((prev) => [...prev, "Error: Falló la conexión"]);
      console.error(error);
    }
  };

  return (
    <div>
      <div style={{ border: "1px solid #ccc", padding: "10px", height: "300px", overflowY: "auto", marginBottom: "10px" }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ marginBottom: "5px" }}>{msg}</div>
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe tu mensaje..."
          style={{ width: "70%", marginRight: "5px" }}
        />
        <button type="submit">Enviar</button>
      </form>
    </div>
  );
}
