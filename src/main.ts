import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { environment } from './environment';

registerLocaleData(localeEs);

bootstrapApplication(App, appConfig)
  .catch(err => console.error(err));

fetch(`${environment.apiUrl}/public/ping`)
  .catch(() => console.log('Backend iniciando...'));
