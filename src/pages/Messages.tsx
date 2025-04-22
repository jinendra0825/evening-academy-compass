
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MainLayout } from "@/components/layout/MainLayout";
import { MessageSquare } from "lucide-react";

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  sent_at: string;
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("messages").select("*").then(({ data }) => {
      setMessages(data || []);
      setLoading(false);
    });
  }, []);

  return (
    <MainLayout>
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><MessageSquare />Messages</h2>
        {loading ? (
          <p>Loading...</p>
        ) : messages.length === 0 ? (
          <p>No messages found.</p>
        ) : (
          <ul className="space-y-3">
            {messages.map((msg) => (
              <li key={msg.id} className="rounded border p-4 bg-white">
                <div className="text-sm text-gray-500">From: {msg.sender_id} &rarr; To: {msg.recipient_id}</div>
                <div>{msg.content}</div>
                <div className="text-xs text-gray-400">{new Date(msg.sent_at).toLocaleString()}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </MainLayout>
  );
}
