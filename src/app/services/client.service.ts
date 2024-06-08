import { Inject, Injectable } from '@angular/core';
import { Client } from '../entities/client';
import { HttpClient } from '@angular/common/http';
import { TOTS_CORE_PROVIDER, TotsBaseHttpService, TotsCoreConfig, TotsListResponse, TotsQuery } from '@tots/core';
import { Observable, catchError, lastValueFrom, map, throwError } from 'rxjs';

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

  override list(query: TotsQuery = new TotsQuery()): Observable<TotsListResponse<Client>> {
    this.basePathUrl = 'client/list';
    return this.http.post<any>(`${this.config.baseUrl}/${this.basePathUrl}`, query).pipe(
      map(clientsResponse => {
        if (clientsResponse.success && clientsResponse.response?.data?.length > 0) {
          return clientsResponse.response;
        } else {
          throw new Error('No se encontraron clientes');
        }
      }),
      catchError(error => {
        console.error("Error al obtener clientes", error);
        return throwError(() => error);
      })
    );
  }

  override fetchById(itemId: number): Observable<Client> {
    this.basePathUrl = 'client/fetch';
    return super.fetchById(itemId);
  }

  override create(client: Client): Observable<Client> {

    try {
      this.basePathUrl = 'client/save';
      return this.http.post<any>(`${this.config.baseUrl}/${this.basePathUrl}`, client);
    } catch (error) {
      console.error("Error al crear cliente", error);
      throw error;
    }

  }

  override update(client: Client): Observable<Client> {

    try {
      this.basePathUrl = 'client/save';
      return this.http.post<any>(`${this.config.baseUrl}/${this.basePathUrl}`, client);
    } catch (error) {
      console.error("Error al editar cliente", error);
      throw error;
    }

  }

  override removeById(itemId: number): Observable<{ deletes: number[]; }> {
    this.basePathUrl = 'client/remove';
    return super.removeById(itemId);
  }

}
