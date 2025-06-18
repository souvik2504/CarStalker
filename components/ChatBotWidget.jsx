"use client";

import { useState } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleOpen = () => setOpen((prev) => !prev);

  const handleSend = async () => {
    if (!userInput.trim()) return;

    const newMessage = { role: "user", text: userInput };
    setMessages((prev) => [...prev, newMessage]);
    setUserInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({ prompt: userInput }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (res.ok && data?.response) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", text: data.response },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", text: " Something went wrong. Try again." },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: " Error connecting to server." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end space-y-1">
        
         <button
        onClick={toggleOpen}
        // className="fixed bottom-6 right-6 bg-white-600 border-2 text-black p-1 rounded-full shadow-lg hover:bg-white-700 z-50"
        aria-label="Open chatbot"
      >
        {!open && (
            <div className="bg-gray-600 text-white text-xs px-2 py-1 rounded shadow-md animate-bounce x-25%">
            Ask Me...
            </div>
         )}
        {open ? (<X />) :( <img src="chat-icon.png" alt="chat" className="w-18 h-12 transition-transform hover:scale-110"/> )}
      </button>
      
      </div>

      {/* Chat Panel */}
      {open && (
        <div className="fixed bottom-20 right-6 w-80 h-96 bg-white border rounded-lg shadow-lg flex flex-col z-50">
          <div className="p-3 border-b font-semibold text-blue-700">
            "Carlo" - Your Car Assistant
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-2 text-sm">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`p-2 rounded-md max-w-xs ${
                  msg.role === "user"
                    ? "bg-blue-100 ml-auto"
                    : "bg-gray-100 mr-auto"
                }`}
              >
                {msg.text}
              </div>
            ))}

            {loading && (
              <div className="text-gray-500 italic flex items-center gap-1">
                <Loader2 className="h-4 w-4 animate-spin" />
                Typing...
              </div>
            )}
          </div>

          <div className="p-2 border-t flex gap-2">
            <input
              type="text"
              placeholder="Ask something..."
              className="flex-1 border rounded px-2 py-1 text-sm"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              onClick={handleSend}
              className="text-blue-600 hover:text-blue-800"
              disabled={loading}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
