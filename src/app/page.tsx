"use client"

import { Api } from "@/config"
import { AxiosResponse } from "axios";
import { useEffect, useRef, useState } from "react";
import * as QRCode from "qrcode";
import { ClipLoader } from "react-spinners";

export default function Home() {
  const api = new Api;
  const validIdUserIsLoged = useRef<NodeJS.Timeout | null>(null)
  const [qrCode, setQrcode] = useState<any>(null);
  const [isLoged, setIsLoged] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isLoadingQrCode, setIsLoadingQrCode] = useState(false);
  // const [messages, setMessages] = useState<string | undefined>([])

  const updateQrCode = async (data: string) => {
    const qr = await QRCode.toDataURL(data);
    setQrcode(qr)
  }

  const connect = async () => {
    setQrcode(null);
    setIsLoged(false);
    setIsError(false);

    try {
      setIsLoadingQrCode(true)
      const response = await api.getQrcode() as AxiosResponse;
      await updateQrCode(response.data)
      setIsLoadingQrCode(false)
    } catch (e) {
      // setQrcode("Erro ao carregar qr-code")
      // alert("Erro ao carregar qr-code")
      setIsError(true)
      if (validIdUserIsLoged?.current) clearInterval(validIdUserIsLoged?.current);
    }
  }

  useEffect(() => {
    validIdUserIsLoged.current = setInterval(async () => {
      try {
        if (!isLoadingQrCode) {
          const response = await api.getStatus() as AxiosResponse;
          if (response?.data?.isLoged) {
            if (validIdUserIsLoged?.current) {
              clearInterval(validIdUserIsLoged?.current)

            };
            setIsError(false)
            setIsLoged(true)
          }
        }
      } catch (e) {
        setIsError(true)
        if (validIdUserIsLoged?.current) clearInterval(validIdUserIsLoged?.current);
      }
    }, 3000)

  }, [qrCode])


  const validConection = async () => {
    try {
      const response = await api.getStatus() as AxiosResponse;
      if (response?.data?.isLoged === false) {
        alert("Whatsapp desconectado")
        await connect()
      } else {
        alert("Whatsapp conectado")
      }
    } catch (e) {
      setIsError(true)
      if (validIdUserIsLoged?.current) clearInterval(validIdUserIsLoged?.current);
    }
  }

  useEffect(() => {
    (async () => {
      try {
        const response = await api.getStatus() as AxiosResponse;
        if (response?.data?.isLoged === false) {
          await connect()
        } else {
          setIsLoged(true)
          setQrcode(null)
        };
      } catch (e) {
        setIsError(true)
        if (validIdUserIsLoged?.current) clearInterval(validIdUserIsLoged?.current);
      }
    })()
  }, []);

  return (
    <main>
      {!qrCode && !isLoged && !isError &&
        <div className="spinner">
          <p>Carregando qr-code</p>
          <ClipLoader size={200} />
        </div>
      }

      {isError && !qrCode && !isLoged &&
        <div className="connection-error">
          <p>Erro ao se comunicar com o servidor, reinicie-o e tente novamente</p>
          <button onClick={connect}>Tentar novamente</button>
        </div>
      }

      {qrCode && !isLoged && !isError &&
        <div className="qr-code">
          <p>Leia o qr-code abaixo</p>
          <img src={qrCode} />
          <button onClick={connect}>Gerar novamente</button>
        </div>
      }



      {
        isLoged && !isError &&
        // true &&
        <div className="loged">
          <p>Você está logado!</p>

          <div className="container-buttons">
            <button onClick={validConection}>Testar conexão</button>
            <button onClick={connect}>Reconectar</button>
          </div>
        </div>
      }
    </main>
  );
}
