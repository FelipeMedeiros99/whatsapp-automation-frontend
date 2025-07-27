"use client"

import { Api } from "@/config"
import { AxiosResponse } from "axios";
import { useEffect, useState } from "react";
import * as QRCode from "qrcode";

export default function Home() {
  const api = new Api;
  const [qrCode, setQrcode] = useState<any>(null);

  useEffect(()=>{
    (async()=>{
      try{
        setQrcode("resposta recebida")
        const response = await api.getQrcode() as AxiosResponse;
        const qrCodeResponse = await QRCode.toDataURL(response.data);
        setQrcode(qrCodeResponse)
      }catch(e){
        setQrcode("Erro ao carregar qr-code")
      }
    })()
  }, []);

  return (
    <div>
      {qrCode && <img src={qrCode}/>}
      {!qrCode && <p>Carregando qr-code</p>}
    </div>
  );
}
