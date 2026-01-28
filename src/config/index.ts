import axios, { AxiosInstance, AxiosResponse } from "axios"

export class Api {
  api: AxiosInstance; // Tipagem correta para a instância do Axios

  constructor() {
    this.api = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL,
      timeout: 10 * 60 * 1000,
      headers: { 'X-Custom-Header': 'foobar' }
    })
  }

  // --- MÉTODOS DE CONEXÃO ---
  async getQrcode() {
    return await this.api.get("connect");
  }

  async getStatus() {
    return await this.api.get("status");
  }

  async desconnect() {
    try {
      return await this.api.get("disconnect");
    } catch (e) {
      return e;
    }
  }

  // --- MÉTODOS DE RESTRIÇÃO ---
  async getAllRestriction() {
    try {
      const restrictionResponse: AxiosResponse = await this.api.get("restriction");
      return restrictionResponse.data;
    } catch (e) {
      console.log("Erro ao buscar restrições: ", e);
      return null;
    }
  }

  async updateRestriction(id: number, data: { restriction?: string, restrictionNumber?: number }) {
    try {
      const response: AxiosResponse = await this.api.put(`restriction/${id}`, data);
      return response;
    } catch (e) {
      console.log("Erro ao atualizar restrições: ", e);
      return null;
    }
  }

  // --- MÉTODOS DE MENSAGENS PADRÃO (ADICIONADOS) ---

  async getDefaultMessages() {
    try {
      const response: AxiosResponse = await this.api.get("default_messages/");
      // Retornamos apenas os dados (o array de mensagens)
      return response.data;
    } catch (e) {
      console.log("Erro ao buscar mensagens padrão: ", e);
      return null;
    }
  }

  async addDefaultMessage(data: { message: string }) {
    try {
      // POST /default_messages/
      const response: AxiosResponse = await this.api.post("default_messages/", data);
      return response;
    } catch (e) {
      console.log("Erro ao adicionar mensagem padrão: ", e);
      throw e;
    }
  }

  async updateMessages(id: number, data: { message: string }) {
    try {
      // PUT /default_messages/:id
      const response: AxiosResponse = await this.api.put(`default_messages/${id}`, data);
      return response;
    } catch (e) {
      console.log("Erro ao atualizar mensagem padrão: ", e);
      throw e;
    }
  }

  async deleteDefaultMessage(id: number) {
    try {
      // DELETE /whatsapp/default_messages/:id
      const response: AxiosResponse = await this.api.delete(`default_messages/${id}`);
      return response;
    } catch (e) {
      console.log("Erro ao deletar mensagem padrão: ", e);
      throw e;
    }
  }
}

export const api = new Api();