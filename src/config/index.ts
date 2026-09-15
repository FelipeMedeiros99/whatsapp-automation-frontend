import axios, { AxiosInstance, AxiosResponse } from "axios";

export interface IContact {
  number: string;
  timestamp: string;
  isBotStoped: boolean;
  name?: string;
  wasWelcome: boolean;
  lastMessageFromBot: boolean;
  timeoutId: string | null;
}

// Adicione a interface no topo do arquivo
export interface IBotRule {
  id: number;
  title: string;
  description: string | null;
  rule: string | null;
}

export class Api {
  api: AxiosInstance; // Tipagem correta para a instância do Axios

  constructor() {
    this.api = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL,
      timeout: 10 * 60 * 1000,
      headers: { "X-Custom-Header": "foobar" },
    });
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
      const restrictionResponse: AxiosResponse =
        await this.api.get("restriction");
      return restrictionResponse.data;
    } catch (e) {
      console.log("Erro ao buscar restrições: ", e);
      return null;
    }
  }

  async updateRestriction(
    id: number,
    data: { restriction?: string; restrictionNumber?: number },
  ) {
    try {
      const response: AxiosResponse = await this.api.put(
        `restriction/${id}`,
        data,
      );
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
      const response: AxiosResponse = await this.api.post(
        "default_messages/",
        data,
      );
      return response;
    } catch (e) {
      console.log("Erro ao adicionar mensagem padrão: ", e);
      throw e;
    }
  }

  async updateMessages(id: number, data: { message: string }) {
    try {
      // PUT /default_messages/:id
      const response: AxiosResponse = await this.api.put(
        `default_messages/${id}`,
        data,
      );
      return response;
    } catch (e) {
      console.log("Erro ao atualizar mensagem padrão: ", e);
      throw e;
    }
  }

  async deleteDefaultMessage(id: number) {
    try {
      // DELETE /whatsapp/default_messages/:id
      const response: AxiosResponse = await this.api.delete(
        `default_messages/${id}`,
      );
      return response;
    } catch (e) {
      console.log("Erro ao deletar mensagem padrão: ", e);
      throw e;
    }
  }

  async getContacts(): Promise<IContact[]> {
    try {
      const response: AxiosResponse = await this.api.get("users");
      return response.data;
    } catch (e) {
      console.error("Erro ao buscar contatos: ", e);
      // Retornar array vazio em caso de erro previne quebras no frontend (map of undefined)cd
      return [];
    }
  }

  async updateContactBotStatus(
    number: string,
    isBotStoped: boolean,
  ): Promise<boolean> {
    try {
      // O encodeURIComponent é crítico aqui para que o "@lid" não quebre a rota da API
      const safeNumber = encodeURIComponent(number);
      await this.api.put(`users/${safeNumber}`, { isBotStoped });
      return true;
    } catch (e) {
      console.error(`Erro ao atualizar contato ${number}: `, e);
      return false;
    }
  }

  async deleteUser(number: string) {
    try {
      const safeNumber = encodeURIComponent(number);
      await this.api.delete(`users/${safeNumber}`);
      return true;
    } catch (e) {
      console.error(`Erro ao deletar contato ${number}: `, e);
      return false;
    }
  }

  async getBotRules(): Promise<IBotRule[]> {
    try {
      const response = await this.api.get("bot-rules/");
      return response.data;
    } catch (e) {
      console.error("Erro ao buscar regras: ", e);
      return [];
    }
  }

  async createBotRule(data: Omit<IBotRule, "id">): Promise<IBotRule | null> {
    try {
      const response = await this.api.post("bot-rules/", data);
      return response.data;
    } catch (e) {
      console.error("Erro ao criar regra: ", e);
      return null;
    }
  }

  async updateBotRule(
    id: number,
    data: Partial<IBotRule>,
  ): Promise<IBotRule | null> {
    try {
      const response = await this.api.put(`bot-rules/${id}`, data);
      return response.data;
    } catch (e) {
      console.error(`Erro ao atualizar regra ${id}: `, e);
      return null;
    }
  }

  async deleteBotRule(id: number): Promise<boolean> {
    try {
      await this.api.delete(`bot-rules/${id}`);
      return true;
    } catch (e) {
      console.error(`Erro ao deletar regra ${id}: `, e);
      return false;
    }
  }
}

export const api = new Api();
