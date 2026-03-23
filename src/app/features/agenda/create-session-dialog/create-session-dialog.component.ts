import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { SessionService } from '../../../core/services/session.service';
import { PatientsService } from '../../patients/patients.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { AgendaService } from '../../../core/services/agenda.service';

@Component({
    selector: 'app-create-session-dialog',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatDatepickerModule,
        MatSelectModule,
        MatSnackBarModule
    ],
    templateUrl: './create-session-dialog.component.html',
    styleUrls: ['./create-session-dialog.component.scss']
})
export class CreateSessionDialogComponent implements OnInit {

    form!: FormGroup;
    daySessions: any[] = [];
    availableHours: any[] = [];
    occupiedHours: string[] = [];
    patientName = '';
    patientId?: string;
    patients: any[] = [];
    saving = false;

    constructor(
        private fb: FormBuilder,
        private sessionService: SessionService,
        private agendaService: AgendaService,
        private patientService: PatientsService,
        private snackBar: MatSnackBar,
        private dialogRef: MatDialogRef<CreateSessionDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) { }

    ngOnInit(): void {

        this.patientId = this.data?.patientId;
        this.patientName = this.data?.patientName ?? "Paciente";

        this.form = this.fb.group({
            patientId: [this.patientId, Validators.required],
            sessionDate: [this.data?.sessionDate ?? '', Validators.required],
            sessionTime: [this.data?.sessionTime ?? '', Validators.required],
            durationMinutes: [60, Validators.required],
            type: ['REHABILITACION', Validators.required]
        });

        this.form.get('patientId')?.valueChanges.subscribe(id => {

            const patient = this.patients.find(p => p.id === id);

            if (patient) {
                this.patientName = patient.fullName;
            }

        });

        if (this.data?.id) {
            this.form.get('patientId')?.disable();
        }

        const date = this.data?.sessionDate || this.form.value.sessionDate;

        if (date) {
            this.loadDaySessions(date);
        }

        this.form.get('sessionDate')?.valueChanges.subscribe(date => {
            if (date) {
                this.loadDaySessions(date);
            }
        });

        this.loadPatients();
    }

    loadPatients() {

        this.patientService.getPatients().subscribe(res => {

            this.patients = res;

            const id = this.form.get('patientId')?.value;

            const patient = this.patients.find(p => p.id === id);

            if (patient) {
                this.patientName = patient.fullName;
            }

        });

    }

    get selectedType() {
        return this.form?.get('type')?.value;
    }

    isTimeConflict(
        start: string,
        duration: number,
        sessions: any[]
    ): boolean {

        const end = this.getEndTime(start, duration);

        for (const s of sessions) {

            if (this.data?.id && s.id === this.data.id) continue;

            const sStart = (s.sessionTime || s.time || '00:00').substring(0, 5);
            const sEnd = this.getEndTime(
                sStart,
                s.durationMinutes || s.duration || 60
            );

            if (start < sEnd && sStart < end) {
                return true;
            }

        }

        return false;

    }

    getEndTime(start: string, duration: number): string {

        const [h, m] = start.split(':').map(Number);

        const d = new Date();

        d.setHours(h);
        d.setMinutes(m);

        d.setMinutes(d.getMinutes() + duration);

        const hh = d.getHours().toString().padStart(2, '0');
        const mm = d.getMinutes().toString().padStart(2, '0');

        return `${hh}:${mm}`;

    }

    save() {

        if (this.form.invalid || this.saving) return;

        this.saving = true;

        const time = this.form.value.sessionTime;
        const duration = this.form.value.durationMinutes;

        const conflict = this.isTimeConflict(
            time,
            duration,
            this.daySessions || []
        );

        if (conflict) {

            this.snackBar.open(
                "Este horario se cruza con otra sesión",
                "OK",
                { duration: 3000 }
            );

            this.saving = false;
            return;
        }

        const payload = {
            patientId: this.form.getRawValue().patientId,
            sessionDate: this.form.value.sessionDate,
            sessionTime: time,
            durationMinutes: duration,
            type: this.form.value.type
        };

        const request = this.data?.id
            ? this.agendaService.updateSession(this.data.id, payload)
            : this.agendaService.createSession(payload);

        request.subscribe({
            next: () => {

                this.dialogRef.close(true);

                this.snackBar.open(
                    "Sesión guardada",
                    "",
                    { duration: 600 }
                );

            },

            error: () => {

                this.snackBar.open(
                    "Error al guardar sesión",
                    "OK",
                    { duration: 3000 }
                );

                this.saving = false;

            }

        });

    }

    cancel(event?: MouseEvent) {

        if (event) {
            event.stopPropagation();
        }

        this.dialogRef.close();

    }

    generateHours() {

        const hours: string[] = [];

        for (let h = 8; h <= 20; h++) {

            const hour = h.toString().padStart(2, '0') + ':00';
            hours.push(hour);

        }

        return hours;

    }

    loadDaySessions(date: string) {

        if (!date) return;

        this.sessionService.getSessions(date)
            .subscribe(res => {

                this.daySessions = res as any[];

                this.occupiedHours = (res as any[]).map(s =>
                    (s.sessionTime || s.time).substring(0, 5)
                );

                this.buildAvailableHours();

            });

    }

    buildAvailableHours() {

        const hours = this.generateHours();

        this.availableHours = hours.map(h => {

            const occupied = this.occupiedHours.includes(h);

            return {
                value: h,
                occupied: occupied
            };

        });

    }

}