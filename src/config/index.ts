import axios, { Axios, AxiosError, AxiosResponse } from "axios"

export class Api {
  api;
  constructor() {
    this.api = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL,
      timeout: 10*60*1000,
      headers: { 'X-Custom-Header': 'foobar' }
    })
  }

  async getQrcode(){
    const qrCode = await this.api.get("connect");
    return qrCode;
  }

  async getStatus() {
    return await this.api.get("status")
  }

  async desconnect() {
    try {
      return await this.api.get("desconnect")
    } catch (e) {
      return e
    }
  }

  async getAllRestriction(){
    try{
      const restrictionResponse: AxiosResponse = await this.api.get("restriction")
      return restrictionResponse.data;
    }catch(e){
      console.log("Erro ao buscar restrições: ", e)
      return null
    }
  }

  async updateRestriction(id: number, data: {restriction?: string, restrictionNumber?: number}){
    try{
      const response: AxiosResponse = await this.api.put(`restriction/${id}`, data)
      return response;
    }catch(e){
      console.log("Erro ao atualizar restrições: ", e)
      return null
    }
  }
}

export const api = new Api();