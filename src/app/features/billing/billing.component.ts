import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { PaymentService } from '../../core/services/payment.service';
import { Payment } from '../../core/models/payment.model';
import { Router, RouterModule } from '@angular/router';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
import { PaymentDialogComponent } from './payment-dialog/payment-dialog.component';
import { ChangeDetectorRef } from '@angular/core';

@Component({
    selector: 'app-billing',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
        RouterModule,
        MatDialogModule
    ],
    templateUrl: './billing.component.html',
    styleUrls: ['./billing.component.scss']
})
export class BillingComponent implements OnInit {

    payments: Payment[] = [];

    loading = true;

    constructor(
        private paymentService: PaymentService,
        private dialog: MatDialog,
        private cd: ChangeDetectorRef
    ) { }

    ngOnInit(): void {

        this.loadPayments();

    }

    loadPayments() {

        this.loading = true;

        this.paymentService.getPayments().subscribe({

            next: (data) => {

                this.payments = data;

                this.loading = false;

                this.cd.detectChanges();

            },

            error: () => {

                this.payments = [];

                this.loading = false;

                this.cd.detectChanges();

            }

        });

    }

    openDialog(sessionId?: string) {

        const ref = this.dialog.open(PaymentDialogComponent, {
            width: '400px',
            data: {
                sessionId: sessionId
            }
        });

        ref.afterClosed().subscribe(result => {

            if (!result) return;

            this.paymentService.createPayment(result)
                .subscribe(() => {

                    this.loadPayments();

                });

        });

    }

    downloadPdf(id: string) {

        this.paymentService.getPdf(id)
            .subscribe(blob => {

                const url = window.URL.createObjectURL(blob);

                const a = document.createElement('a');
                a.href = url;
                a.download = 'recibo.pdf';
                a.click();

                window.URL.revokeObjectURL(url);

            });

    }

}