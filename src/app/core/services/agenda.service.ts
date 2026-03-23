import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environment';

@Injectable({ providedIn: 'root' })
export class AgendaService {

    private baseUrl = `${environment.apiUrl}/api/v1/sessions`;

    constructor(private http: HttpClient) { }

    createSession(data: any) {
        return this.http.post(this.baseUrl, data);
    }

    updateSession(id: string, payload: any) {

        return this.http.put(
            `${environment.apiUrl}/api/v1/sessions/${id}`,
            payload
        );

    }

}