"use client";

import { api } from '@/config'; 
import { useState, useEffect } from 'react';
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi'; // Opcional: ícones para melhor UI

interface DefaultMessage {
  id: number;
  text: string;
}

export default function DefaultMessagesPage() {
  const [messages, setMessages] = useState<DefaultMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados do Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<DefaultMessage | null>(null);
  const [inputText, setInputText] = useState("");

  useEffect(() => {
    fetchMessages();
  }, []);

  async function fetchMessages() {
    setIsLoading(true);
    try {
      const data = await api.getDefaultMessages(); // GET /whatsapp/default_messages/
      setMessages(data || []);
    } catch (err) {
      setError("Falha ao carregar mensagens.");
    } finally {
      setIsLoading(false);
    }
  }

  // Prepara modal para Adicionar
  const handleAddClick = () => {
    setSelectedMessage(null);
    setInputText("");
    setIsModalOpen(true);
  };

  // Prepara modal para Editar
  const handleEditClick = (msg: DefaultMessage) => {
    setSelectedMessage(msg);
    setInputText(msg.text);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!inputText.trim()) return;
    setIsProcessing(true);
    setError(null);

    try {
      if (selectedMessage) {
        // UPDATE: PUT /whatsapp/default_messages/:id
        const response = await api.updateMessages(selectedMessage.id, { message: inputText });
        setMessages(prev => prev.map(m => m.id === selectedMessage.id ? response.data : m));
      } else {
        // CREATE: POST /whatsapp/default_messages/
        const response = await api.addDefaultMessage({ message: inputText });
        setMessages(prev => [...prev, response.data]);
      }
      setIsModalOpen(false);
    } catch (err) {
      setError("Erro ao processar a requisição.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir esta mensagem?")) return;
    setIsProcessing(true);
    try {
      await api.deleteDefaultMessage(id); // DELETE /whatsapp/default_messages/:id
      setMessages(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      alert("Erro ao excluir mensagem.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500">Carregando mensagens...</div>;

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Mensagens Padrão</h1>
        <button
          onClick={handleAddClick}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
        >
          <FiPlus /> Adicionar Mensagem
        </button>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

      <div className="grid grid-cols-1 gap-4">
        {messages.map((msg) => (
          <div key={msg.id} className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex justify-between items-start gap-4">
            <p className="text-gray-700 whitespace-pre-wrap flex-1">{msg.text}</p>
            <div className="flex gap-2">
              <button
                onClick={() => handleEditClick(msg)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition"
                title="Editar"
              >
                <FiEdit2 size={20} />
              </button>
              <button
                onClick={() => handleDelete(msg.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-full transition"
                title="Excluir"
              >
                <FiTrash2 size={20} />
              </button>
            </div>
          </div>
        ))}
        {messages.length === 0 && <p className="text-center text-gray-400 py-10">Nenhuma mensagem cadastrada.</p>}
      </div>

      {/* Modal Unificado (Add/Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">
              {selectedMessage ? "Editar Mensagem" : "Nova Mensagem Padrão"}
            </h2>
            
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Digite o conteúdo da mensagem..."
              className="w-full h-48 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none mb-6 resize-none"
              disabled={isProcessing}
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition"
                disabled={isProcessing}
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={isProcessing || !inputText.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {isProcessing ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}