import { Inject, Injectable } from '@angular/core';
import { Client } from '../entities/client';
import { HttpClient } from '@angular/common/http';
import { TOTS_CORE_PROVIDER, TotsBaseHttpService, TotsCoreConfig, TotsListResponse, TotsQuery } from '@tots/core';
import { Observable, catchError, lastValueFrom, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClientService extends TotsBaseHttpService<Client> {

  constructor(
    @Inject(TOTS_CORE_PROVIDER) protected override config: TotsCoreConfig,
    protected override http: HttpClient
  ) {
    super(config, http);
    this.basePathUrl = '';
  }

  async get() {
    try {
      const clientsResponse = await lastValueFrom(this.http.post<any>(`${this.config.baseUrl}/client/list?page=1&per_page=5`, {}));
      const clients = clientsResponse.success && clientsResponse.response?.data?.length > 0 ? clientsResponse.response : undefined;
      return clients;
    } catch (error) {
      console.error("Error al obtener clientes", error);
      throw error;
    }
  }

  getById(client_id: number) {

    this.basePathUrl = 'client/fetch';
    return super.fetchById(client_id);

  }

  override create(client: Client): Observable<Client> {

    try {
      return this.http.post<any>(`${this.config.baseUrl}/client/save`, client);
    } catch (error) {
      console.error("Error al crear cliente", error);
      throw error;
    }

  }

  override update(client: Client): Observable<Client> {

    try {
      return this.http.post<any>(`${this.config.baseUrl}/client/save`, client);
    } catch (error) {
      console.error("Error al editar cliente", error);
      throw error;
    }

  }

  deleteById(client: Client): Observable<{ success: boolean, response: boolean }> {

    try {
      return this.http.delete<any>(`${this.config.baseUrl}/client/remove/${client.id}`,);
    } catch (error) {
      console.error("Error al eliminar cliente", error);
      throw error;
    }
  }

}
