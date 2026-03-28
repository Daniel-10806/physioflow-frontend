import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Payment } from '../models/payment.model';
import { environment } from '../../../environment';

@Injectable({
    providedIn: 'root'
})
export class PaymentService {

    private api = `${environment.apiUrl}/api/v1/payments`;

    constructor(private http: HttpClient) { }

    getPayments(): Observable<Payment[]> {

        return this.http.get<Payment[]>(this.api);

    }

    createPayment(payment: Partial<Payment>) {

        return this.http.post(this.api, payment);

    }

    getPdf(id: string) {

        return this.http.get(`/api/v1/payments/${id}/pdf`, {
            responseType: 'blob'
        });

    }

}