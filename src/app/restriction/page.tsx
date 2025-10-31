"use client"; 

import { api } from '@/config'; // Assumindo que seu 'api' service está configurado
import { useState, useEffect } from 'react';

// A interface do seu banco de dados
interface Restriction {
  id: number; 
  title: string; 
  restriction: string | null;
  restrictionNumber: number | null; 
}

// O "dicionário" para nomes amigáveis (você já tinha)
const friendlyNames: { [key: string]: string } = {
  mainPrompt: "Prompt Principal da IA (Restrições)",
  historyLimit: "Limite de Histórico (Nº de Mensagens)",
  transferPhrase: "Frase de Transferência Padrão",
  dbCleanupDays: "Dias para Limpeza do Banco",
  responseDelay: "Delay da Resposta (em segundos)",
};

export default function RestrictionPage() {
  
  // Estado para todas as restrições
  const [restrictions, setRestrictions] = useState<Restriction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estado para o Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Guarda o item que está sendo editado no modal
  const [selectedRestriction, setSelectedRestriction] = useState<Restriction | null>(null);
  // Guarda o valor (string ou numero) que está no campo do modal
  const [editedValue, setEditedValue] = useState<string>(""); 

  // Busca todos os dados na primeira carga
  useEffect(() => {
    async function fetchRestrictions() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await api.getAllRestriction(); // Sua função que busca tudo
        if(!data) throw new Error("Falha ao buscar restrições");
        setRestrictions(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchRestrictions();
  }, []); 

  
  // Abre o modal e configura os valores para edição
  const handleEditClick = (item: Restriction) => {
    setSelectedRestriction(item);
    
    // Define o valor inicial do campo de edição
    if (item.restriction !== null) {
      setEditedValue(item.restriction);
    } else if (item.restrictionNumber !== null) {
      setEditedValue(String(item.restrictionNumber)); // Converte número para string para o input
    } else {
      setEditedValue("");
    }
    
    setIsModalOpen(true);
    setError(null);
  };

  
  const handleCancelClick = () => {
    setIsModalOpen(false);
    setSelectedRestriction(null);
    setError(null);
  };

  
  // Lógica para salvar o item específico que está no modal
  const handleConfirmClick = async () => {
    if (!selectedRestriction) return;

    setIsUpdating(true);
    setError(null);

    // Prepara o objeto de dados parciais para a API
    let updateData: {restriction?: string, restrictionNumber?: number} = {};
    if (selectedRestriction.restriction !== null) {
      updateData.restriction = editedValue;
    } else if(!!selectedRestriction.restrictionNumber){
      // Converte a string do input de volta para número
      updateData.restrictionNumber = editedValue === '' ? undefined : Number(editedValue);
    }

    try {
      // Chama a API de atualização (PUT /whatsapp/restriction/:id)
      const response = await api.updateRestriction(selectedRestriction.id, updateData);
      if (!response || !response.data) { // Assumindo que a API retorna { data: ... }
        throw new Error('Falha ao atualizar a restrição.');
      }

      // Atualiza o estado local para a UI refletir a mudança imediatamente
      setRestrictions(prevRestrictions =>
        prevRestrictions.map(r =>
          r.id === selectedRestriction.id ? { ...r, ...response.data } : r
        )
      );
      
      handleCancelClick(); // Fecha o modal
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido ao salvar.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Separa o prompt principal das outras configurações
  const mainPrompt = restrictions.find(r => r.title === 'mainPrompt');
  const otherRestrictions = restrictions.filter(r => r.title !== 'mainPrompt');

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 md:p-8 text-center text-gray-500">
        Carregando configurações...
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Configurações do Bot</h1>

      {error && !isModalOpen && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Erro: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Card de Destaque para o MainPrompt */}
      {mainPrompt && (
        <div className="bg-white p-6 rounded-lg shadow-lg border-2 border-blue-500 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-700">
              {friendlyNames[mainPrompt.title]}
            </h2>
            <button
              onClick={() => handleEditClick(mainPrompt)}
              disabled={isLoading || isUpdating}
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition duration-150 ease-in-out"
            >
              Editar Prompt
            </button>
          </div>
          <div className="bg-gray-50 p-4 rounded border border-gray-300 text-gray-800 whitespace-pre-wrap min-h-[100px] max-h-[400px] overflow-y-auto">
            {mainPrompt.restriction}
          </div>
        </div>
      )}

      {/* Grid para as Outras Configurações */}
      <h2 className="text-xl font-bold mb-4 text-gray-800">Outras Configurações</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {otherRestrictions.map((item) => (
          <div key={item.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-2 text-gray-700">
                {friendlyNames[item.title] || item.title}:
              </h3>
              <div className="text-md text-gray-900 mb-4">
                {/* Mostra o valor do texto OU o valor numérico */}
                {item.restriction !== null ? `"${item.restriction}"` : item.restrictionNumber}
              </div>
            </div>
            <button
              onClick={() => handleEditClick(item)}
              disabled={isLoading || isUpdating}
              className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 transition duration-150 ease-in-out"
            >
              Editar
            </button>
          </div>
        ))}
      </div>

      {/* O Modal de Edição (controlado pelo estado) */}
      {isModalOpen && selectedRestriction && (
          <div className="fixed inset-0 bg-[#c7c7c750] bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl relative">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              Editar: {friendlyNames[selectedRestriction.title] || selectedRestriction.title}
            </h2>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                 <strong className="font-bold">Erro: </strong>
                 <span className="block sm:inline">{error}</span>
              </div>
            )}

            {/* Renderiza o input correto (textarea OU input numérico) */}
            {selectedRestriction.restriction !== null && (
              <textarea
                value={editedValue}
                onChange={(e) => setEditedValue(e.target.value)}
                disabled={isUpdating}
                className="w-full h-64 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y mb-4 disabled:bg-gray-100"
              />
            )}
            {selectedRestriction.restrictionNumber !== null && (
              <input
                type="number"
                step={selectedRestriction.title === "responseDelay" ? "0.1" : "1"}
                value={editedValue}
                onChange={(e) => setEditedValue(e.target.value)}
                disabled={isUpdating}
                className="w-full max-w-xs p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 mb-4"
              />
            )}

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

// "use client"; 

// import { api } from '@/config'; //
// import { useState, useEffect } from 'react';



// interface Restriction {
//   id: number; 
//   title: string; 
//   restriction: string | null;
//   restrictionNumber: number | null; 
// }


// const friendlyNames: { [key: string]: string } = {
//   mainPrompt: "Prompt Principal da IA (Restrições)",
//   historyLimit: "Limite de Histórico (Nº de Mensagens)",
//   transferPhrase: "Frase de Transferência Padrão",
//   dbCleanupDays: "Dias para Limpeza do Banco",
//   responseDelay: "Delay da Resposta (em segundos)",
// };

// export default function RestrictionPage() {
  
//   const [restrictions, setRestrictions] = useState<Restriction[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isUpdating, setIsUpdating] = useState(false);
//   const [error, setError] = useState<string | null>(null);

  
//   useEffect(() => {
//     async function fetchRestrictions() {
//       setIsLoading(true);
//       setError(null);
//       try {
        
//         const data = await api.getAllRestriction(); 
//         if(!data) throw new Error("Falha ao buscar restrições");

//         setRestrictions(data);
//       } catch (err) {
//         setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
//       } finally {
//         setIsLoading(false);
//       }
//     }
//     fetchRestrictions();
//   }, []); 

  
  
//   const handleEdit = (index: number, field: 'restriction' | 'restrictionNumber', value: string | number) => {
    
//     const newRestrictions = restrictions.map((item, i) => {
//       if (i === index) {
        
//         if (field === 'restriction') {
//           return { ...item, restriction: value as string };
//         } else if (field === 'restrictionNumber') {
          
//           return { ...item, restrictionNumber: value === '' ? null : Number(value) };
//         }
//       }
//       return item;
//     });
//     setRestrictions(newRestrictions); 
//   };

  
  
//   const handleSaveAll = async () => {
//     setIsUpdating(true);
//     setError(null);
//     try {
      
      
//       const updatePromises = restrictions.map(item => {
        
//         if(item.restriction){
//           return api.updateRestriction(item.id, {restriction: item?.restriction}); 
//         }else if(item.restrictionNumber){
//           return api.updateRestriction(item.id, {restrictionNumber: item?.restrictionNumber})
//         }
//       });

//       await Promise.all(updatePromises);
      
      
//       alert("Configurações salvas com sucesso!");

//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido ao salvar.');
//     } finally {
//       setIsUpdating(false);
//     }
//   };

//   if (isLoading) {
//     return (
//       <div className="container mx-auto p-4 md:p-8 text-center text-gray-500">
//         Carregando configurações...
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto p-4 md:p-8">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-bold text-gray-800">Configurações do Bot</h1>
//         <button
//           onClick={handleSaveAll}
//           disabled={isLoading || isUpdating}
//           className="px-6 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
//         >
//           {isUpdating ? 'Salvando...' : 'Salvar Alterações'}
//         </button>
//       </div>

//       {error && (
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
//           <strong className="font-bold">Erro: </strong>
//           <span className="block sm:inline">{error}</span>
//         </div>
//       )}

//       <div className="space-y-6">
//         {restrictions.map((item, index) => (
//           <div key={item.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            
//             <label className="text-lg font-semibold mb-3 text-gray-700 block">
//               {friendlyNames[item.title] || item.title}
//             </label>

//             {item.restriction !== null && (
//               <textarea
//                 value={item.restriction}
//                 onChange={(e) => handleEdit(index, 'restriction', e.target.value)}
//                 disabled={isUpdating}
//                 className="w-full h-48 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y disabled:bg-gray-100"
//                 placeholder="Digite o valor aqui..."
//               />
//             )}

//             {item.restrictionNumber !== null && (
//               <input
//                 type="number"
//                 step="0.1" 
//                 value={item.restrictionNumber}
//                 onChange={(e) => handleEdit(index, 'restrictionNumber', e.target.value)}
//                 disabled={isUpdating}
//                 className="w-full max-w-xs p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
//                 placeholder="0"
//               />
//             )}
            
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// "use client"; 

// import { api, Api } from '@/config';
// import { useState, useEffect } from 'react';

// interface Restriction{
//   id: number; 
//   title: string; 
//   restriction: string
// }

// export default function RestrictionPage() {
//   const [restriction, setRestriction] = useState<Restriction | null>(null);
//   const [editedText, setEditedText] = useState('');
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isUpdating, setIsUpdating] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     async function fetchRestriction() {
//       setIsLoading(true);
//       setError(null);
//       try {
//         const data = await api.getRestriction(); 
//         if(!data) throw new Error("Falha ao buscar restrição")

//         setRestriction(data);
//         setEditedText(data.restriction); 
//       } catch (err) {
//         setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
//       } finally {
//         setIsLoading(false);
//       }
//     }

//     fetchRestriction();
//   }, []); 

  
//   const handleEditClick = () => {
//     if (restriction) {
//       setEditedText(restriction.restriction); 
//       setIsModalOpen(true);
//       setError(null); 
//     }
//   };

  
//   const handleCancelClick = () => {
//     setIsModalOpen(false);
//   };

  
//   const handleConfirmClick = async () => {
//     if (!restriction) return;

//     setIsUpdating(true);
//     setError(null);
//     try {
//       console.log(restriction)
//       const response = await api.updateRestriction(restriction.id, {restriction: editedText})
//       console.log(response)
//       if (!response) {
//         throw new Error('Falha ao atualizar a restrição.');
//       }
//       setRestriction(response.data); 
//       setIsModalOpen(false); 
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido ao salvar.');
//     } finally {
//       setIsUpdating(false);
//     }
//   };

//   return (
//     <div className="container mx-auto p-4 md:p-8">
//       <h1 className="text-2xl font-bold mb-6 text-gray-800">Configuração da Restrição da IA</h1>

//       {isLoading && (
//         <div className="text-center text-gray-500">
//           Carregando configuração...
//         </div>
//       )}

//       {error && !isModalOpen && ( 
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
//           <strong className="font-bold">Erro: </strong>
//           <span className="block sm:inline">{error}</span>
//         </div>
//       )}

      
//       {!isLoading && restriction && (
//         <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
//           <h2 className="text-xl font-semibold mb-4 text-gray-700">Restrição Atual:</h2>
          
//           <div className="bg-gray-50 p-4 rounded border border-gray-300 text-gray-800 whitespace-pre-wrap min-h-[100px] max-h-[400px] overflow-y-auto mb-6">
//             {restriction.restriction}
//           </div>
//           <button
//             onClick={handleEditClick}
//             disabled={isLoading || isUpdating}
//             className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
//           >
//             Editar Restrição
//           </button>
//         </div>
//       )}

      
//       {isModalOpen && (
//           <div className="fixed inset-0 bg-[#c7c7c750] bg-opacity-50 flex items-center justify-center z-50 p-4">
          
//           <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl relative">
//             <h2 className="text-xl font-bold mb-4 text-gray-800">Editar Restrição</h2>

            
//             {error && (
//               <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
//                  <strong className="font-bold">Erro: </strong>
//                  <span className="block sm:inline">{error}</span>
//               </div>
//             )}

//             <textarea
//               value={editedText}
//               onChange={(e) => setEditedText(e.target.value)}
//               disabled={isUpdating}
//               className="w-full h-64 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y mb-4 disabled:bg-gray-100"
//               placeholder="Digite a nova restrição da IA aqui..."
//             />

//             <div className="flex w-full flex-row! gap-3">
//               <button
//                 onClick={handleCancelClick}
//                 disabled={isUpdating}
//                 className="px-4 py-2 bg-red-500 text-white font-semibold rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-50 transition duration-150 ease-in-out"
//               >
//                 Cancelar
//               </button>
//               <button
//                 onClick={handleConfirmClick}
//                 disabled={isUpdating}
//                 className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
//               >
//                 {isUpdating ? 'Salvando...' : 'Confirmar Alterações'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }