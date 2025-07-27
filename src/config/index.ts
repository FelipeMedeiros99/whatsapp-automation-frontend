import axios, { Axios, AxiosError, AxiosResponse } from "axios"

export class Api{
  api;
  constructor(){
    this.api = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL,
      timeout: 15000,
      headers: {'X-Custom-Header': 'foobar'}
    })
  }

  async getQrcode(): Promise<AxiosResponse | AxiosError>{
    try{
      const qrCode = await this.api.get("connect");
      return qrCode;
    }catch(e){
      return e as AxiosError
    }
  
  }

}