import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { PatientsService } from '../../../features/patients/patients.service';
import { Patient } from '../../../features/patients/models/patient.model';
import { ChangeDetectorRef, Inject } from '@angular/core';

@Component({
    selector: 'app-payment-dialog',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        FormsModule
    ],
    templateUrl: './payment-dialog.component.html',
    styleUrls: ['./payment-dialog.component.scss']
})
export class PaymentDialogComponent {

    patients: Patient[] = [];
    filteredPatients: Patient[] = [];
    sessionId = '';
    patientId = '';
    patientSearch = '';
    amount = 0;
    method = 'EFECTIVO';
    loading = false;
    success = false;
    sessionDate = '';
    sessionTime = '';
    type = '';
    duration = 0;
    therapist = '';
    area = '';

    sessionPrices: any = {
        REHABILITACION: 60,
        FISIOTERAPIA: 50,
        ELECTROTERAPIA: 55,
        MASOTERAPIA: 45
    };

    constructor(
        private dialogRef: MatDialogRef<PaymentDialogComponent>,
        private patientsService: PatientsService,
        private cd: ChangeDetectorRef,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) { }

    ngOnInit() {

        this.sessionId = this.data?.sessionId;
        this.patientId = this.data?.patientId;

        if (this.data?.patientName) {
            this.patientSearch = this.data.patientName;
        }

        this.sessionDate = this.data?.sessionDate;
        this.sessionTime = this.data?.sessionTime;
        this.type = this.data?.type;

        if (this.type && this.sessionPrices[this.type]) {
            this.amount = this.sessionPrices[this.type];
        }

        this.duration = this.data?.duration;
        this.therapist = this.data?.therapist;
        this.area = this.data?.area;


        this.patientsService.getPatients()
            .subscribe(data => {

                this.patients = data;
                this.filteredPatients = [];

                this.cd.detectChanges();

            });

    }

    filter() {

        const value = this.patientSearch.toLowerCase();

        if (!value) {
            this.filteredPatients = [];
            return;
        }

        this.filteredPatients = this.patients.filter(p =>
            p.fullName.toLowerCase().includes(value)
        );

    }

    selectPatient(p: Patient) {

        this.patientId = p.id;
        this.patientSearch = p.fullName;

        this.filteredPatients = [];

    }

    save() {

        if (!this.patientId) return;

        if (!this.amount || this.amount <= 0) return;

        this.loading = true;

        setTimeout(() => {

            this.success = true;

            setTimeout(() => {

                this.dialogRef.close({
                    sessionId: this.sessionId,
                    patientId: this.patientId,
                    amount: this.amount,
                    method: this.method,
                    status: 'PAID'
                });

            }, 1200);

        }, 1200);

    }

    close() {
        this.dialogRef.close();
    }

}