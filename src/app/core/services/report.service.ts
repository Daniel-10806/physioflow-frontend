import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { environment } from '../../../environment'
import { Observable } from 'rxjs'

export interface ReportSummary {

    totalSessions: number
    completedSessions: number
    totalPatients: number
    totalRevenue: number

}

export interface ReportRow {

    date: string
    patient: string
    therapist: string
    type: string
    amount: number

}

@Injectable({ providedIn: 'root' })
export class ReportService {

    constructor(private http: HttpClient) { }

    getSummary() {

        return this.http.get<ReportSummary>(

            `${environment.apiUrl}/reports/summary`

        )

    }

    search(filter: any) {

        return this.http.post<ReportRow[]>(

            `${environment.apiUrl}/reports/search`,
            filter

        )

    }

}