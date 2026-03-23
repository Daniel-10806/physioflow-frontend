import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environment';
import { Observable } from 'rxjs';
import { Patient } from './models/patient.model';

@Injectable({
    providedIn: 'root'
})
export class PatientsService {

    private api = `${environment.apiUrl}/api/v1/patients`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<Patient[]> {

        const token = localStorage.getItem('token');

        const headers = new HttpHeaders({
            Authorization: `Bearer ${token}`
        });

        return this.http.get<Patient[]>(this.api, { headers });
    }

    create(patient: any): Observable<Patient> {

        const token = localStorage.getItem('token');

        const headers = new HttpHeaders({
            Authorization: `Bearer ${token}`
        });

        return this.http.post<Patient>(this.api, patient, { headers });
    }

    delete(id: string) {
        return this.http.delete<void>(`${this.api}/${id}`);
    }

    getById(id: string) {
        const token = localStorage.getItem('token');

        const headers = new HttpHeaders({
            Authorization: `Bearer ${token}`
        });

        return this.http.get<any>(`${this.api}/${id}`, { headers });
    }

    getPatients(): Observable<Patient[]> {

        const token = localStorage.getItem('token');

        const headers = new HttpHeaders({
            Authorization: `Bearer ${token}`
        });

        return this.http.get<Patient[]>(this.api, { headers });

    }

    getHistory(patientId: string) {

        const token = localStorage.getItem('token');

        const headers = new HttpHeaders({
            Authorization: `Bearer ${token}`
        });

        return this.http.get<any[]>(
            `${environment.apiUrl}/api/v1/patients/${patientId}/history`,
            { headers }
        );
    }

    createSessionRecord(sessionId: string, data: any) {

        const token = localStorage.getItem('token');

        const headers = new HttpHeaders({
            Authorization: `Bearer ${token}`
        });

        return this.http.post(
            `${environment.apiUrl}/api/v1/sessions/${sessionId}/record`,
            data,
            { headers }
        );

    }

    getSession(sessionId: string) {

        const token = localStorage.getItem('token');

        const headers = {
            Authorization: `Bearer ${token}`
        };

        return this.http.get<any>(
            `${environment.apiUrl}/api/v1/sessions/${sessionId}`,
            { headers }
        );

    }

    getEvolution(patientId: string) {

        return this.http.get<any[]>(
            `${environment.apiUrl}/api/v1/patients/${patientId}/evolution`
        );

    }

    addEvolution(id: string, body: any) {

        return this.http.post(
            `/api/patients/${id}/evolution`,
            body
        );

    }


}