import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TOTS_CORE_PROVIDER, TotsCoreModule } from '@tots/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { TOTS_AUTH_PROVIDER, TotsAuthConfig, TotsAuthInterceptor, TotsAuthModule } from '@tots/auth';
import { TOTS_CLOUD_STORAGE_PROVIDER } from '@tots/cloud-storage';
import { TOTS_TABLE_DEFAULT_CONFIG, TotsTableModule, TotsTableDefaultConfig } from '@tots/table';
import { TotsDateColumnModule } from '@tots/date-column';
import { TotsEditableColumnsModule } from '@tots/editable-columns';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './shared/material.module';
import { TotsFormModule } from '@tots/form';
import { ClientesComponent } from './pages/clientes/clientes.component';
import { ToastrModule } from 'ngx-toastr';

@NgModule({
  declarations: [
    AppComponent,
    ClientesComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    ToastrModule.forRoot({
      timeOut: 1000, // Duración de la notificación en milisegundos
      preventDuplicates: true, // Evita notificaciones duplicadas
    }),

    /** Tots Libraries */
    TotsCoreModule,
    TotsAuthModule,
    TotsTableModule,
    TotsDateColumnModule,
    TotsEditableColumnsModule,
    TotsFormModule
  ],
  providers: [
    {
      provide: TOTS_CORE_PROVIDER,
      useValue: {
        baseUrl: 'https://agency-coda.uc.r.appspot.com/'
      }
    },
    {
      provide: TOTS_CLOUD_STORAGE_PROVIDER,
      useValue: {
        bucket: 'codahub-files'
      }
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TotsAuthInterceptor,
      multi: true
    },
    {
      provide: TOTS_AUTH_PROVIDER,
      useValue: {
        signInPath: 'oauth/token',
        changePasswordPath: 'users/me/password',
      } as TotsAuthConfig
    },
    {
      provide: TOTS_TABLE_DEFAULT_CONFIG,
      useValue: TotsTableDefaultConfig
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
