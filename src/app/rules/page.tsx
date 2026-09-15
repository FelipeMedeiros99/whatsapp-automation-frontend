"use client";

import { useEffect, useState, useCallback, FormEvent } from "react";
import { api, IBotRule } from "../../config"; // Ajuste o path

export default function BotRulesPage() {
  // Estados da Listagem
  const [rules, setRules] = useState<IBotRule[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Estados do Modal e Formulário
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [editingRuleId, setEditingRuleId] = useState<number | null>(null);

  // Estado controlado do formulário
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    rule: "",
  });

  // --- CARREGAMENTO INICIAL ---
  const fetchRules = useCallback(async () => {
    setIsLoading(true);
    const data = await api.getBotRules();
    setRules(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  // --- HANDLERS DO MODAL ---
  const openModalForCreate = () => {
    setFormData({ title: "", description: "", rule: "" });
    setEditingRuleId(null);
    setIsModalOpen(true);
  };

  const openModalForEdit = (rule: IBotRule) => {
    setFormData({
      title: rule.title,
      description: rule.description || "",
      rule: rule.rule || "",
    });
    setEditingRuleId(rule.id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ title: "", description: "", rule: "" });
    setEditingRuleId(null);
  };

  // --- HANDLERS DE CRUD ---
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert("O título é obrigatório.");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      title: formData.title,
      description: formData.description || null,
      rule: formData.rule || null,
    };

    if (editingRuleId) {
      // Atualização
      const updated = await api.updateBotRule(editingRuleId, payload);
      if (updated) {
        setRules((prev) =>
          prev.map((r) => (r.id === editingRuleId ? { ...r, ...payload } : r)),
        );
        closeModal();
      } else {
        alert("Erro ao atualizar. Verifique se o título já existe.");
      }
    } else {
      // Criação
      const created = await api.createBotRule(payload);
      if (created) {
        setRules((prev) => [...prev, created]);
        closeModal();
      } else {
        alert("Erro ao criar. O título pode já estar em uso.");
      }
    }

    setIsSubmitting(false);
  };

  const handleDelete = async (id: number) => {
    const isConfirmed = window.confirm(
      "Deseja realmente excluir esta regra? A IA deixará de utilizá-la imediatamente.",
    );
    if (!isConfirmed) return;

    // Atualização Otimista
    const previousRules = [...rules];
    setRules((prev) => prev.filter((r) => r.id !== id));

    const success = await api.deleteBotRule(id);
    if (!success) {
      alert("Falha ao excluir regra.");
      setRules(previousRules); // Rollback
    }
  };

  // --- RENDERIZAÇÃO ---
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
        {/* Header da Página */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Regras de Negócio (Prompt)
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Gerencie as diretrizes de comportamento e conhecimento do
              assistente virtual.
            </p>
          </div>
          <button
            onClick={openModalForCreate}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            + Nova Regra
          </button>
        </div>

        {/* Tabela de Dados */}
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-700">
                  Título / Gatilho
                </th>
                <th className="px-6 py-4 font-semibold text-gray-700">
                  Descrição (Uso da IA)
                </th>
                <th className="px-6 py-4 font-semibold text-gray-700 text-right">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rules.map((rule) => (
                <tr
                  key={rule.id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-gray-900 align-top max-w-[200px]">
                    {rule.title}
                  </td>
                  <td className="px-6 py-4 text-gray-600 align-top whitespace-pre-wrap max-w-md">
                    {rule.description || (
                      <span className="italic text-gray-400">
                        Sem descrição
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 align-top text-right whitespace-nowrap">
                    <button
                      onClick={() => openModalForEdit(rule)}
                      className="mr-3 text-blue-600 hover:text-blue-800 font-medium transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(rule.id)}
                      className="text-red-500 hover:text-red-700 font-medium transition-colors"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}

              {rules.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    Nenhuma regra cadastrada. Clique em "Nova Regra" para
                    iniciar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Formulário (Renderização Condicional) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-3xl rounded-xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">
                {editingRuleId ? "Editar Regra" : "Criar Nova Regra"}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex-1 overflow-y-auto p-6 flex flex-col gap-5"
            >
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-semibold text-gray-700 mb-1"
                >
                  Título <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  required
                  placeholder="Ex: Políticas Importantes"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-semibold text-gray-700 mb-1"
                >
                  Descrição / Gatilho (O que a IA deve saber para usar esta
                  regra)
                </label>
                <textarea
                  id="description"
                  rows={2}
                  placeholder="Ex: Utilize para responder sobre horários de entrada e saída..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>

              <div className="flex-1 flex flex-col">
                <label
                  htmlFor="rule"
                  className="block text-sm font-semibold text-gray-700 mb-1"
                >
                  Conteúdo da Regra (Prompt Bruto)
                </label>
                <textarea
                  id="rule"
                  rows={8}
                  placeholder="Ex: - Check-in: A partir das 14h&#10;- Check-out: Até as 12h..."
                  value={formData.rule}
                  onChange={(e) =>
                    setFormData({ ...formData, rule: e.target.value })
                  }
                  className="w-full flex-1 min-h-[200px] font-mono text-sm rounded-md border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors resize-y"
                />
              </div>

              <div className="mt-2 flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isSubmitting ? "Salvando..." : "Salvar Regra"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
