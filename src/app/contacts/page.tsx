"use client";

import { useEffect, useState, useCallback } from "react";
import { api, IContact } from "../../config";

export default function ContactsPage() {
  const [contacts, setContacts] = useState<IContact[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchContacts = useCallback(async (isInitialLoad = false) => {
    if (isInitialLoad) setIsLoading(true);

    const data = await api.getContacts();
    setContacts(data);

    if (isInitialLoad) setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchContacts(true);

    const pollingInterval = setInterval(() => {
      fetchContacts(false);
    }, 5000);

    return () => clearInterval(pollingInterval);
  }, [fetchContacts]);

  const handleToggleBotStatus = async (
    contactNumber: string,
    currentStatus: boolean,
  ) => {
    const newStatus = !currentStatus;

    setContacts((prevContacts) =>
      prevContacts.map((contact) =>
        contact.number === contactNumber
          ? { ...contact, isBotStoped: newStatus }
          : contact,
      ),
    );

    const success = await api.updateContactBotStatus(contactNumber, newStatus);

    if (!success) {
      alert("Falha ao atualizar o status. Revertendo alteração.");
      setContacts((prevContacts) =>
        prevContacts.map((contact) =>
          contact.number === contactNumber
            ? { ...contact, isBotStoped: currentStatus }
            : contact,
        ),
      );
    }
  };

  // --- NOVO HANDLER DE EXCLUSÃO ---
  const handleDeleteContact = async (contactNumber: string) => {
    // 1. Barreira de Segurança (Confirmação)
    const isConfirmed = window.confirm(
      "Tem certeza que deseja remover este contato? Esta ação não pode ser desfeita.",
    );
    if (!isConfirmed) return;

    // 2. Snapshot do estado atual para possível Rollback
    const previousContacts = [...contacts];

    // 3. Atualização Otimista: Remove o contato da interface instantaneamente
    setContacts((prevContacts) =>
      prevContacts.filter((contact) => contact.number !== contactNumber),
    );

    // 4. Chamada à API
    const success = await api.deleteUser(contactNumber);

    // 5. Tratamento de Falha (Rollback)
    if (!success) {
      alert(
        "Falha de comunicação com a API ao tentar remover o contato. Os dados foram restaurados.",
      );
      setContacts(previousContacts);
    }
  };

  const formatTimestamp = (unixString: string) => {
    const date = new Date(Number(unixString) * 1000);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">
            Monitoramento de Contatos (WhatsApp)
          </h1>
          <span className="text-sm text-gray-500">
            Atualização automática a cada 5s
          </span>
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-700">
                  Nome / Contato
                </th>
                <th className="px-6 py-4 font-semibold text-gray-700">
                  ID de Roteamento (LID)
                </th>
                <th className="px-6 py-4 font-semibold text-gray-700">
                  Última Interação
                </th>
                <th className="px-6 py-4 font-semibold text-gray-700">
                  Status do Bot
                </th>
                <th className="px-6 py-4 font-semibold text-gray-700 text-center">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {contacts.map((contact) => (
                <tr
                  key={contact.number}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                    {contact.name || (
                      <span className="text-gray-400 italic">Desconhecido</span>
                    )}
                  </td>

                  <td className="px-6 py-4 font-mono text-xs text-gray-600 whitespace-nowrap">
                    {contact.number}
                  </td>

                  <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                    {formatTimestamp(contact.timestamp)}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    {/* Variável derivada para inverter a lógica negativa da API para uma lógica positiva na UI */}
                    {(() => {
                      const isBotActive = !contact.isBotStoped;

                      return (
                        <div className="flex items-center">
                          <button
                            onClick={() =>
                              handleToggleBotStatus(
                                contact.number,
                                contact.isBotStoped,
                              )
                            }
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                              isBotActive ? "bg-green-500" : "bg-gray-300"
                            }`}
                            role="switch"
                            aria-checked={isBotActive}
                          >
                            <span className="sr-only">
                              Alternar status do bot
                            </span>
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                isBotActive ? "translate-x-6" : "translate-x-1"
                              }`}
                            />
                          </button>
                          <span className="ml-3 text-xs font-medium text-gray-600">
                            {isBotActive ? "Bot ativado" : "Bot desativado"}
                          </span>
                        </div>
                      );
                    })()}
                  </td>

                  {/* Nova coluna de Ações */}
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => handleDeleteContact(contact.number)}
                      title="Excluir contato"
                      className="text-gray-400 hover:text-red-600 transition-colors focus:outline-none p-1 rounded hover:bg-red-50"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5 mx-auto"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}

              {contacts.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    Nenhum contato registrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
