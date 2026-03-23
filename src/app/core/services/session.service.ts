import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environment';

export interface SessionToday {
    id: string;
    patientName: string;
    sessionDate: string;
    time: string;
    type: string;
    status: string;
}

@Injectable({ providedIn: 'root' })
export class SessionService {

    private baseUrl = `${environment.apiUrl}/api/v1/sessions`;

    constructor(private http: HttpClient) { }

    getTodaySessions() {
        return this.http.get<SessionToday[]>(
            `${this.baseUrl}/today`
        );
    }

    getSessions(date: string) {

        return this.http.get<SessionToday[]>(
            `${this.baseUrl}?date=${date}`
        );

    }

    getSession(sessionId: string) {

        return this.http.get<any>(
            `${this.baseUrl}/${sessionId}`
        );

    }

    getSessionsByRange(start: string, end: string) {

        return this.http.get<any[]>(
            `${this.baseUrl}/range?start=${start}&end=${end}`
        );

    }

    startSession(sessionId: string) {

        return this.http.patch(
            `${environment.apiUrl}/api/v1/sessions/${sessionId}/start`,
            {}
        );

    }

    createSessionRecord(sessionId: string, data: any) {

        return this.http.post(
            `${environment.apiUrl}/api/v1/sessions/${sessionId}/record`,
            data
        );

    }

    completeSession(sessionId: string) {

        return this.http.patch(
            `${environment.apiUrl}/sessions/${sessionId}/start`,
            {}
        );

    }

    deleteSession(id: string) {

        return this.http.delete(
            `${this.baseUrl}/${id}`
        );

    }
}