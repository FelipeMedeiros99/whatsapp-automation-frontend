import axios, { Axios, AxiosError, AxiosResponse } from "axios"

export class Api {
  api;
  constructor() {
    this.api = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL,
      headers: { 'X-Custom-Header': 'foobar' }
    })
  }

  async getQrcode(): Promise<AxiosResponse | AxiosError> {
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
}