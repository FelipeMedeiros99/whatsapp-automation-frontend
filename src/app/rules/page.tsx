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
      <div className="mx-auto max-w-7xl">
        {/* Header da Página */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Regras de Negócio (Prompt)
            </h1>
            <p className="text-base text-gray-600 mt-1">
              Gerencie as diretrizes de comportamento e conhecimento do
              assistente virtual.
            </p>
          </div>
          <button
            onClick={openModalForCreate}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-base font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            + Nova Regra
          </button>
        </div>

        {/* Tabela de Dados */}
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-left text-base">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-800">
                  Título / Gatilho
                </th>
                <th className="px-6 py-4 font-semibold text-gray-800">
                  Descrição (Uso da IA)
                </th>
                <th className="px-6 py-4 font-semibold text-gray-800 text-right">
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
                  <td className="px-6 py-5 font-medium text-gray-900 align-top max-w-[250px]">
                    {rule.title}
                  </td>
                  <td className="px-6 py-5 text-gray-700 align-top whitespace-pre-wrap max-w-2xl leading-relaxed">
                    {rule.description || (
                      <span className="italic text-gray-400">
                        Sem descrição
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-5 align-top text-right whitespace-nowrap">
                    <button
                      onClick={() => openModalForEdit(rule)}
                      className="mr-4 text-blue-600 hover:text-blue-800 font-semibold transition-colors cursor-pointer"
                    >
                      Editar
                    </button>
                    <button
                      disabled={rule.id === 1}
                      onClick={() => handleDelete(rule.id)}
                      className="text-red-600 hover:text-red-800 font-semibold transition-colors disabled:opacity-0 cursor-pointer disabled:cursor-auto "
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
                    className="px-6 py-10 text-center text-gray-500 text-lg"
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

      {/* Modal de Formulário (Quase Full-Screen) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 sm:p-6 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-[95vw] h-[95vh] rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col">
            <div className="px-8 py-5 border-b border-gray-200 flex justify-between items-center bg-gray-50 shrink-0">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingRuleId ? "Editar Regra" : "Criar Nova Regra"}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-800 transition-colors bg-gray-200 hover:bg-gray-300 rounded-full p-2"
                title="Fechar (Esc)"
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
              className="flex-1 overflow-y-auto p-8 flex flex-col gap-6"
            >
              <div>
                <label
                  htmlFor="title"
                  className="block text-base font-bold text-gray-800 mb-2"
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
                  className="w-full rounded-lg border border-gray-300 px-5 py-3 text-base text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/50 transition-colors shadow-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-base font-bold text-gray-800 mb-2"
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
                  className="w-full rounded-lg border border-gray-300 px-5 py-3 text-base text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/50 transition-colors shadow-sm leading-relaxed"
                />
              </div>

              <div className="flex-1 flex flex-col min-h-[300px]">
                <label
                  htmlFor="rule"
                  className="block text-base font-bold text-gray-800 mb-2"
                >
                  Conteúdo da Regra (Prompt Bruto)
                </label>
                <textarea
                  id="rule"
                  placeholder="Ex: - Check-in: A partir das 14h&#10;- Check-out: Até as 12h..."
                  value={formData.rule}
                  onChange={(e) =>
                    setFormData({ ...formData, rule: e.target.value })
                  }
                  className="w-full flex-1 rounded-lg border border-gray-300 px-5 py-4 text-base text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/50 transition-colors shadow-sm resize-none leading-relaxed"
                />
              </div>

              <div className="mt-4 flex justify-end gap-4 pt-6 border-t border-gray-200 shrink-0">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="px-6 py-3 text-base font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 transition-colors shadow-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 text-base font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center"
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
