"use client";

import { useEffect, useState, useCallback } from "react";
import { api, IContact } from "../../config/";

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
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {contacts.map((contact) => (
                <tr
                  key={contact.number}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  {/* Nova coluna de Nome */}
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                    {contact.name || (
                      <span className="text-gray-400 italic">Desconhecido</span>
                    )}
                  </td>

                  {/* Coluna do Número (@lid) reposicionada e com fonte monoespaçada */}
                  <td className="px-6 py-4 font-mono text-xs text-gray-600 whitespace-nowrap">
                    {contact.number}
                  </td>

                  <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                    {formatTimestamp(contact.timestamp)}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() =>
                        handleToggleBotStatus(
                          contact.number,
                          contact.isBotStoped,
                        )
                      }
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        contact.isBotStoped ? "bg-red-500" : "bg-green-500"
                      }`}
                      role="switch"
                      aria-checked={!contact.isBotStoped}
                    >
                      <span className="sr-only">Alternar status do bot</span>
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          contact.isBotStoped
                            ? "translate-x-6"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                    <span className="ml-3 inline-block text-xs font-medium text-gray-500 align-text-bottom">
                      {contact.isBotStoped ? "Pausado" : "Ativo"}
                    </span>
                  </td>
                </tr>
              ))}

              {contacts.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
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
