"use client"; 

import { api, Api } from '@/config';
import { useState, useEffect } from 'react';

interface Restriction{
  id: number; 
  title: string; 
  restriction: string
}

export default function RestrictionPage() {
  const [restriction, setRestriction] = useState<Restriction | null>(null);
  const [editedText, setEditedText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRestriction() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await api.getRestriction(); 
        if(!data) throw new Error("Falha ao buscar restrição")

        setRestriction(data);
        setEditedText(data.restriction); 
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchRestriction();
  }, []); 

  
  const handleEditClick = () => {
    if (restriction) {
      setEditedText(restriction.restriction); 
      setIsModalOpen(true);
      setError(null); 
    }
  };

  
  const handleCancelClick = () => {
    setIsModalOpen(false);
  };

  
  const handleConfirmClick = async () => {
    if (!restriction) return;

    setIsUpdating(true);
    setError(null);
    try {
      console.log(restriction)
      const response = await api.updateRestriction(restriction.id, {restriction: editedText})
      console.log(response)
      if (!response) {
        throw new Error('Falha ao atualizar a restrição.');
      }
      setRestriction(response.data); 
      setIsModalOpen(false); 
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido ao salvar.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Configuração da Restrição da IA</h1>

      {isLoading && (
        <div className="text-center text-gray-500">
          Carregando configuração...
        </div>
      )}

      {error && !isModalOpen && ( 
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Erro: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      
      {!isLoading && restriction && (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Restrição Atual:</h2>
          
          <div className="bg-gray-50 p-4 rounded border border-gray-300 text-gray-800 whitespace-pre-wrap min-h-[100px] max-h-[400px] overflow-y-auto mb-6">
            {restriction.restriction}
          </div>
          <button
            onClick={handleEditClick}
            disabled={isLoading || isUpdating}
            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
          >
            Editar Restrição
          </button>
        </div>
      )}

      
      {isModalOpen && (
          <div className="fixed inset-0 bg-[#c7c7c750] bg-opacity-50 flex items-center justify-center z-50 p-4">
          
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl relative">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Editar Restrição</h2>

            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                 <strong className="font-bold">Erro: </strong>
                 <span className="block sm:inline">{error}</span>
              </div>
            )}

            <textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              disabled={isUpdating}
              className="w-full h-64 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y mb-4 disabled:bg-gray-100"
              placeholder="Digite a nova restrição da IA aqui..."
            />

            <div className="flex w-full flex-row! gap-3">
              <button
                onClick={handleCancelClick}
                disabled={isUpdating}
                className="px-4 py-2 bg-red-500 text-white font-semibold rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-50 transition duration-150 ease-in-out"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmClick}
                disabled={isUpdating}
                className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
              >
                {isUpdating ? 'Salvando...' : 'Confirmar Alterações'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}