"use client";

import { api } from "@/config"; 
import { useState, useEffect, useRef, useCallback } from "react";
import * as QRCode from "qrcode";
import { ClipLoader } from "react-spinners"; 

type ConnectionStatus = 'initializing' | 'loading_qr' | 'displaying_qr' | 'connected' | 'error';

export default function Home() {

  const [status, setStatus] = useState<ConnectionStatus>('initializing');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false); 
  const statusCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  
  const generateQrCode = useCallback(async (data: string) => {
    try {
      const url = await QRCode.toDataURL(data);
      setQrCodeDataUrl(url);
      setStatus('displaying_qr');
      setErrorMessage(null);
    } catch (error) {
      console.error("Erro ao gerar QR code:", error);
      setErrorMessage("Falha ao gerar a imagem do QR Code.");
      setStatus('error');
    }
  }, []);

  const fetchQrCode = useCallback(async () => {
    console.log("Tentando buscar QR Code...");
    setQrCodeDataUrl(null);
    if (statusCheckIntervalRef.current) {
      clearInterval(statusCheckIntervalRef.current);
    }
    setStatus('loading_qr');
    setErrorMessage(null);

    try {
      const response = await api.getQrcode();
      if (response && response?.data) {
        await generateQrCode(response?.data);
      } else {
        throw new Error("Resposta inválida da API ao buscar QR Code.");
      }
    } catch (error: any) {
      console.error("Erro ao buscar QR code:", error);
      setErrorMessage(error.message || "Erro ao buscar QR code. Verifique o servidor.");
      setStatus('error');
    }
  }, [generateQrCode]);

  
  const checkStatus = useCallback(async () => {
    console.log("Verificando status (polling)...");
    try {
      const response = await api.getStatus();
      if (response && typeof response.data?.isLoged === 'boolean') {
        if (response.data.isLoged) {
          if (status !== 'connected') { 
             console.log("Status: Conectado.");
             setStatus('connected');
             setQrCodeDataUrl(null);
             setErrorMessage(null);
             if (statusCheckIntervalRef.current) {
               clearInterval(statusCheckIntervalRef.current);
             }
          }
        } else {
          
          if (status === 'connected') {
             console.log("Status: Desconectado detectado pelo polling. Buscando novo QR Code.");
             fetchQrCode(); 
          } else {
             console.log("Status: Desconectado. (Aguardando QR Code ou leitura)");
          }
        }
      } else {
        console.warn("Resposta inválida da API ao verificar status.");
      }
    } catch (error: any) {
      console.error("Erro ao verificar status (polling):", error);
      setErrorMessage(error.message || "Erro ao verificar status. Servidor pode estar offline.");
      setStatus('error');
      if (statusCheckIntervalRef.current) {
        clearInterval(statusCheckIntervalRef.current);
      }
    }
  }, [api, status, fetchQrCode]); 

  
  const handleTestConnectionClick = useCallback(async () => {
    setIsTestingConnection(true); 
    setErrorMessage(null); 
    console.log("Testando conexão manualmente...");

    try {
      const response = await api.getStatus();
      if (response && typeof response.data?.isLoged === 'boolean') {
        if (response.data.isLoged) {
          alert("✅ Whatsapp conectado!");
          setStatus('connected'); 
        } else {
          alert("🔌 Whatsapp desconectado. Gerando novo QR Code...");
          await fetchQrCode(); 
        }
      } else {
        throw new Error("Resposta inválida da API ao testar conexão.");
      }
    } catch (error: any) {
      console.error("Erro ao testar conexão:", error);
      alert(`❌ Erro ao testar conexão: ${error.message || 'Verifique o servidor.'}`);
      setErrorMessage(error.message || "Erro ao testar conexão.");
      setStatus('error'); 
    } finally {
      setIsTestingConnection(false); 
    }
  }, [api, fetchQrCode]); 

  
  useEffect(() => {
    setStatus('initializing');
    api.getStatus().then(res => { 
      if (!res?.data?.isLoged) {
        fetchQrCode();
      } else {
        setStatus('connected');
      }
    }).catch(() => {
      setErrorMessage("Falha ao obter status inicial. Servidor pode estar offline.");
      setStatus('error');
    });

    return () => {
      if (statusCheckIntervalRef.current) {
        clearInterval(statusCheckIntervalRef.current);
      }
    };
  
  }, []); 

  useEffect(() => {
    if (statusCheckIntervalRef.current) {
      clearInterval(statusCheckIntervalRef.current);
    }
    if (status === 'displaying_qr') {
      console.log("Iniciando polling de status...");
      statusCheckIntervalRef.current = setInterval(checkStatus, 3000);
    }
    return () => {
      if (statusCheckIntervalRef.current) {
        console.log("Parando polling de status...");
        clearInterval(statusCheckIntervalRef.current);
      }
    };
  }, [status, checkStatus]);

  
  const renderContent = () => {
    switch (status) {
      
      case 'initializing':
      case 'loading_qr':
        return (
          <div className="flex flex-col items-center justify-center text-center p-8">
            <p className="text-lg font-semibold text-gray-600 mb-4">
              {status === 'initializing' ? 'Verificando conexão...' : 'Carregando QR Code...'}
            </p>
            <ClipLoader size={100} color={"#3B82F6"} />
          </div>
        );

      case 'error':
        return (
          <div className="flex flex-col items-center justify-center text-center p-8 bg-red-50 border border-red-200 rounded-lg shadow">
            <p className="text-xl font-semibold text-red-700 mb-4">⚠️ Erro de Conexão</p>
            <p className="text-red-600 mb-6">{errorMessage || 'Ocorreu um erro desconhecido.'}</p>
            <button
              onClick={fetchQrCode}
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out"
            >
              Tentar Novamente
            </button>
          </div>
        );

      case 'displaying_qr':
        return (
          <div className="flex flex-col items-center text-center p-8 bg-white rounded-lg shadow-md">
            <p className="text-lg font-semibold text-gray-700 mb-4">Leia o QR Code abaixo com seu WhatsApp:</p>
            {qrCodeDataUrl ? (
              <img src={qrCodeDataUrl} alt="WhatsApp QR Code" className="w-64 h-64 border border-gray-300 rounded mb-6" />
            ) : (
              <p className="text-red-500">Erro ao exibir QR Code.</p>
            )}
            <button
              onClick={fetchQrCode}
              className="px-6 py-2 bg-gray-500 text-white font-semibold rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition duration-150 ease-in-out"
            >
              Gerar Novo QR Code
            </button>
            <p className="text-sm text-gray-500 mt-4">Aguardando leitura...</p>
          </div>
        );


      case 'connected':
        return (
          <div className="flex flex-col items-center text-center p-8 bg-green-50 border border-green-200 rounded-lg shadow">
            <p className="text-2xl font-bold text-green-700 mb-6">✅ Conectado!</p>
            <p className="text-gray-600 mb-6">Seu bot está conectado ao WhatsApp.</p>
            <div className="flex space-x-4">
              <button
                onClick={handleTestConnectionClick} 
                disabled={isTestingConnection} 
                className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-wait" // Estilo de desabilitado
              >
                {isTestingConnection ? 'Testando...' : 'Testar Conexão'}
              </button>
              <button
                onClick={fetchQrCode}
                className="px-6 py-2 bg-yellow-500 text-white font-semibold rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 transition duration-150 ease-in-out disabled:opacity-50"
              >
                Reconectar (Gerar Novo QR)
              </button>
            </div>
          </div>
        );

      default:
        return <p>Estado desconhecido.</p>;
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      {renderContent()}
    </main>
  );
}

// "use client"

// import { api } from "@/config"
// import { AxiosResponse } from "axios";
// import { useEffect, useRef, useState } from "react";
// import * as QRCode from "qrcode";
// import { ClipLoader } from "react-spinners";

// export default function Home() {
//   const validIdUserIsLoged = useRef<NodeJS.Timeout | null>(null)
//   const [qrCode, setQrcode] = useState<any>(null);
//   const [isLoged, setIsLoged] = useState(false);
//   const [isError, setIsError] = useState(false);
//   const [isLoadingQrCode, setIsLoadingQrCode] = useState(false);
//   // const [messages, setMessages] = useState<string | undefined>([])

//   const updateQrCode = async (data: string) => {
//     const qr = await QRCode.toDataURL(data);
//     setQrcode(qr)
//   }

//   const connect = async () => {
//     setQrcode(null);
//     setIsLoged(false);
//     setIsError(false);

//     try {
//       setIsLoadingQrCode(true)
//       const response = await api.getQrcode() as AxiosResponse;
//       await updateQrCode(response.data)
//       setIsLoadingQrCode(false)
//     } catch (e) {
//       // setQrcode("Erro ao carregar qr-code")
//       // alert("Erro ao carregar qr-code")
//       setIsError(true)
//       if (validIdUserIsLoged?.current) clearInterval(validIdUserIsLoged?.current);
//     }
//   }

//   useEffect(() => {
//     validIdUserIsLoged.current = setInterval(async () => {
//       try {
//         if (!isLoadingQrCode) {
//           const response = await api.getStatus() as AxiosResponse;
//           if (response?.data?.isLoged) {
//             if (validIdUserIsLoged?.current) {
//               clearInterval(validIdUserIsLoged?.current)

//             };
//             setIsError(false)
//             setIsLoged(true)
//           }
//         }
//       } catch (e) {
//         setIsError(true)
//         if (validIdUserIsLoged?.current) clearInterval(validIdUserIsLoged?.current);
//       }
//     }, 3000)

//   }, [qrCode])


//   const validConection = async () => {
//     try {
//       const response = await api.getStatus() as AxiosResponse;
//       if (response?.data?.isLoged === false) {
//         alert("Whatsapp desconectado")
//         await connect()
//       } else {
//         alert("Whatsapp conectado")
//       }
//     } catch (e) {
//       setIsError(true)
//       if (validIdUserIsLoged?.current) clearInterval(validIdUserIsLoged?.current);
//     }
//   }

//   useEffect(() => {
//     (async () => {
//       try {
//         const response = await api.getStatus() as AxiosResponse;
//         if (response?.data?.isLoged === false) {
//           await connect()
//         } else {
//           setIsLoged(true)
//           setQrcode(null)
//         };
//       } catch (e) {
//         setIsError(true)
//         if (validIdUserIsLoged?.current) clearInterval(validIdUserIsLoged?.current);
//       }
//     })()
//   }, []);

//   return (
//     <main>
//       {!qrCode && !isLoged && !isError &&
//         <div className="spinner">
//           <p>Carregando qr-code</p>
//           <ClipLoader size={200} />
//         </div>
//       }

//       {isError && !qrCode && !isLoged &&
//         <div className="connection-error">
//           <p>Erro ao se comunicar com o servidor, reinicie-o e tente novamente</p>
//           <button onClick={connect}>Tentar novamente</button>
//         </div>
//       }

//       {qrCode && !isLoged && !isError &&
//         <div className="qr-code">
//           <p>Leia o qr-code abaixo</p>
//           <img src={qrCode} />
//           <button onClick={connect}>Gerar novamente</button>
//         </div>
//       }



//       {
//         isLoged && !isError &&
//         // true &&
//         <div className="loged">
//           <p>Você está logado!</p>

//           <div className="container-buttons">
//             <button onClick={validConection}>Testar conexão</button>
//             <button onClick={connect}>Reconectar</button>
//           </div>
//         </div>
//       }
//     </main>
//   );
// }
