"use client"

import { Api } from "@/config"
import { AxiosResponse } from "axios";
import { useEffect, useState } from "react";
import * as QRCode from "qrcode";
import { ClipLoader } from "react-spinners";

export default function Home() {
  const api = new Api;
  const [qrCode, setQrcode] = useState<any>(null);
  const [isLoged, setIsLoged] = useState(false)
  // const [messages, setMessages] = useState<string | undefined>([])

  const updateQrCode = async (data: string) => {
    const qr = await QRCode.toDataURL(data);
    setQrcode(qr)
  }

  useEffect(() => {
    (async () => {
      try {
        const response = await api.getQrcode() as AxiosResponse;
        updateQrCode(response.data)
      } catch (e) {
        setQrcode("Erro ao carregar qr-code")
        console.log(e)
      }
    })()
  }, []);

  const validLogin = setInterval(async () => {
    try {
      const response = await api.getStatus() as AxiosResponse;
      if (response?.data?.isLoged) {
        setIsLoged(true)
        clearInterval(validLogin)
      }
    } catch (e) {
      console.log("Erro ao solicitar status: ", e)
    }
  }, 3000)

  const validConection = async () => {
    try {
      const response = await api.getStatus() as AxiosResponse;
      console.log(response)
      if (!response?.data?.isLoged) {
        alert("Whatsapp desconectado")
        desconnect()

      }
    } catch (e) {
      alert("Erro ao verificar status")
      console.log(e)
    }
  }

  const desconnect = () => {
    window.location.reload()
  }

  return (
    <main>
      {!qrCode &&
      <div className="spinner">
        <p>Carregando qr-code</p>
        <ClipLoader size={200}/>
      </div>
      }

      {qrCode && !isLoged &&
        <div className="qr-code">
          <p>Leia o qr-code abaixo</p>
          <img src={qrCode} />
          <button onClick={desconnect}>Gerar novamente</button>
        </div>
      }



      {isLoged &&
        <div className="loged">
          <p>Você está logado!</p>

          <div className="container-buttons">
            <button onClick={validConection}>Testar conexão</button>
          </div>
        </div>
      }



    </main>
  );
}
