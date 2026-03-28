import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionService, SessionToday } from '../../core/services/session.service';
import { MatDialog } from '@angular/material/dialog';
import { CreateSessionDialogComponent } from './create-session-dialog/create-session-dialog.component';
import { RouterModule } from '@angular/router';
import { WeeklyCalendarComponent } from './weekly-calendar/weekly-calendar.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { PaymentDialogComponent } from '../billing/payment-dialog/payment-dialog.component';
import { PaymentService } from '../../core/services/payment.service';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';

@Component({
    selector: 'app-agenda',
    standalone: true,
    imports: [CommonModule, RouterModule, WeeklyCalendarComponent],
    templateUrl: './agenda.component.html',
    styleUrls: ['./agenda.component.scss'],
})
export class AgendaComponent implements OnInit {

    sessions: SessionToday[] = [];
    selectedDate: Date = new Date();
    hours: string[] = [];

    constructor(
        private sessionService: SessionService,
        private dialog: MatDialog,
        private cd: ChangeDetectorRef,
        private snackBar: MatSnackBar,
        private router: Router,
        private paymentService: PaymentService
    ) { }

    ngOnInit(): void {
        this.generateHours();
        this.loadSessions();
    }

    generateHours() {
        for (let h = 8; h <= 20; h++) {
            const hour = h.toString().padStart(2, '0') + ":00";
            this.hours.push(hour);
        }
    }

    loadSessions() {

        const start = this.formatDate(this.getStartOfWeek(this.selectedDate));
        const end = this.formatDate(this.getEndOfWeek(this.selectedDate));

        this.sessionService.getSessionsByRange(start, end)
            .subscribe(data => {

                console.log("Sesiones semana:", data);

                this.sessions = data.map((s: any) => ({

                    ...s,

                    id: s.id,

                    patientId: s.patientId,
                    patientName: s.patientName,

                    sessionDate: s.sessionDate?.split('T')[0],

                    sessionTime: s.sessionTime,
                    time: (s.sessionTime || '').substring(0, 5),

                    type: s.type,

                    duration: s.duration || s.durationMinutes || 45,

                    therapist: s.therapist || s.therapistName || '',

                    area: s.area || s.department || '',

                    isPaid: s.status === 'PAID' || s.status === 'COMPLETED',

                    status: s.status

                }));

                this.cd.detectChanges();

            });

    }

    getSessionForHour(hour: string) {
        return this.sessions.find(s => s.time.startsWith(hour));
    }

    previousWeek() {

        const start = this.getStartOfWeek(this.selectedDate);
        start.setDate(start.getDate() - 7);

        this.selectedDate = start;

        this.loadSessions();

    }

    nextWeek() {

        const start = this.getStartOfWeek(this.selectedDate);
        start.setDate(start.getDate() + 7);

        this.selectedDate = start;

        this.loadSessions();

    }

    openDialog(hour?: string) {

        const date = this.formatDate(this.selectedDate);

        const duration = 60;

        const start = hour || '00:00';

        const end = this.getEndTime(start, duration);

        const conflict = this.sessions.find((s: any) => {

            if (s.sessionDate !== date) return false;

            const sStart =
                s.time ||
                s.sessionTime ||
                '00:00';

            const sEnd = this.getEndTime(
                sStart,
                s.duration ||
                s.durationMinutes ||
                60
            );

            return (
                start < sEnd &&
                sStart < end
            );

        });

        if (conflict) {

            this.snackBar.open(
                "Horario ocupado o solapado con otra sesión",
                "OK",
                { duration: 3000 }
            );

            return;

        }

        const dialogRef = this.dialog.open(CreateSessionDialogComponent, {
            width: '650px',
            data: {
                sessionDate: date,
                sessionTime: hour
            }
        });

        dialogRef.afterClosed().subscribe(res => {

            if (res) this.loadSessions();

        });

    }

    formatDate(date: Date) {
        return date.toISOString().split('T')[0];
    }

    getEndTime(start: string, duration: number): string {

        const [h, m] = start.split(':').map(Number);

        const date = new Date();
        date.setHours(h);
        date.setMinutes(m);

        date.setMinutes(date.getMinutes() + duration);

        const endH = date.getHours().toString().padStart(2, '0');
        const endM = date.getMinutes().toString().padStart(2, '0');

        return `${endH}:${endM}`;

    }

    editSession(session: any) {

        const normalizedSession = {

            ...session,

            sessionDate: session.sessionDate?.split('T')[0],

            sessionTime: (session.sessionTime || session.time || '').substring(0, 5)

        };

        const dialogRef = this.dialog.open(CreateSessionDialogComponent, {
            width: '650px',
            data: normalizedSession
        });

        dialogRef.afterClosed().subscribe(res => {

            if (res) {
                this.loadSessions();
            }

        });

    }

    createNewSession() {

        const dialogRef = this.dialog.open(CreateSessionDialogComponent, {
            width: '650px',
            data: {
                sessionDate: this.formatDate(this.selectedDate)
            }
        });

        dialogRef.afterClosed().subscribe(res => {

            if (res) {
                this.loadSessions();
            }

        });

    }

    getWeekLabel(): string {

        const start = this.getStartOfWeek(this.selectedDate);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);

        const options: Intl.DateTimeFormatOptions = {
            day: 'numeric',
            month: 'long'
        };

        const startText = start.toLocaleDateString('es-ES', options);
        const endText = end.toLocaleDateString('es-ES', options);

        const year = end.getFullYear();

        return `Semana del ${startText} al ${endText} de ${year}`;
    }

    getStartOfWeek(date: Date): Date {

        const d = new Date(date);
        const day = d.getDay();

        const diff = d.getDate() - day + (day === 0 ? -6 : 1);

        return new Date(d.setDate(diff));
    }

    getEndOfWeek(date: Date): Date {

        const start = this.getStartOfWeek(date);

        const end = new Date(start);
        end.setDate(start.getDate() + 6);

        return end;
    }

    completeSession(session: any) {

        if (!session.isPaid) {

            this.snackBar.open(
                "Debe registrar el pago antes de continuar",
                "OK",
                { duration: 3000 }
            );

            return;

        }

        this.router.navigate([
            '/session-record',
            session.id
        ]);

    }

    pay(session: any) {

        const ref = this.dialog.open(PaymentDialogComponent, {
            width: '600px',
            maxWidth: '90vw',
            panelClass: 'payment-dialog-panel',
            data: {

                sessionId: session.id,

                patientId: session.patientId,
                patientName: session.patientName,

                sessionDate: session.sessionDate,
                sessionTime: session.sessionTime || session.time,

                type: session.type,
                duration: session.duration,

                therapist: session.therapist,
                area: session.area

            }
        });

        ref.afterClosed().subscribe(result => {

            if (!result) return;

            this.paymentService.createPayment(result)
                .subscribe(() => {

                    this.snackBar.open(
                        "Pago registrado correctamente",
                        "✔",
                        { duration: 2500 }
                    );

                    this.loadSessions();

                });

        });

    }

    deleteSession(session: any) {

        const dialogRef = this.dialog.open(ConfirmDialogComponent, {

            width: '420px',

            data: {
                message: '¿Seguro que deseas eliminar esta sesión?'
            }

        });

        dialogRef.afterClosed().subscribe(result => {

            if (!result) return;

            this.sessionService.deleteSession(session.id)
                .subscribe({

                    next: () => {

                        this.snackBar.open(
                            "Sesión eliminada",
                            "✔",
                            { duration: 2000 }
                        );

                        this.loadSessions();

                    },

                    error: err => {

                        console.error(err);

                        this.snackBar.open(
                            "Error al eliminar",
                            "OK",
                            { duration: 3000 }
                        );

                    }

                });

        });

    }
}

