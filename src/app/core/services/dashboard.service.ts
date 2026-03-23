import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environment';
import { Observable } from 'rxjs';

export interface DashboardSummary {
    totalPatients: number;
    sessionsToday: number;
    weeklyEvaluations: number;
    dailyCapacity: number;
    newPatientsWeek: number;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {

    constructor(private http: HttpClient) { }

    getSummary(): Observable<DashboardSummary> {
        return this.http.get<DashboardSummary>(
            `${environment.apiUrl}/dashboard/summary`
        );
    }
}