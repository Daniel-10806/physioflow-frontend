import { Component, OnInit } from '@angular/core';
import { PatientsService } from '../patients.service';
import { Patient } from '../models/patient.model';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { trigger, transition, style, animate } from '@angular/animations';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { forkJoin } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { ChangeDetectorRef } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';

@Component({
    selector: 'app-patients-list',
    standalone: true,
    imports: [
        CommonModule,
        MatTableModule,
        MatButtonModule,
        RouterModule,
        MatCardModule,
        MatCheckboxModule,
        MatIconModule,
        MatSnackBarModule,
        MatDialogModule,
        MatProgressSpinnerModule,
        MatMenuModule
    ],
    templateUrl: './patients-list.component.html',
    styleUrls: ['./patients-list.component.scss'],
    animations: [
        trigger('rowAnimation', [
            transition(':enter', [
                style({ opacity: 0, transform: 'translateY(10px)' }),
                animate('250ms ease-out',
                    style({ opacity: 1, transform: 'translateY(0)' }))
            ]),
            transition(':leave', [
                animate('200ms ease-in',
                    style({ opacity: 0, transform: 'translateX(-10px)' }))
            ])
        ])
    ]
})
export class PatientsListComponent implements OnInit {

    selectedPatients = new Set<string>();
    displayedColumns = ['select', 'fullName', 'email', 'actions'];
    isLoading = false;
    dataSource = new MatTableDataSource<Patient>([]);
    allPatients: Patient[] = [];

    constructor(
        private patientsService: PatientsService,
        private router: Router,
        private snackBar: MatSnackBar,
        private dialog: MatDialog,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.loadPatients();
    }

    loadPatients() {

        this.isLoading = true;

        this.patientsService.getAll().subscribe({

            next: (response: any) => {

                console.log('Pacientes recibidos:', response);

                const patients = response.data ?? response;

                this.allPatients = patients;

                this.dataSource.data = [...patients];

                this.isLoading = false;

                this.cdr.detectChanges();

            },

            error: (err) => {

                console.error(err);

                this.isLoading = false;

                this.cdr.detectChanges();

            }

        });

    }

    filter(event: any) {

        const value = event.target.value.trim().toLowerCase();

        if (!value) {
            this.dataSource.data = [...this.allPatients];
            return;
        }

        this.dataSource.data = this.allPatients.filter(p =>
            p.fullName.toLowerCase().includes(value) ||
            p.email.toLowerCase().includes(value)
        );

    }

    goToDetail(patient: Patient) {
        this.router.navigate(['/patients', patient.id]);
    }

    goToDashboard() {
        this.router.navigate(['/dashboard']);
    }

    toggleSelection(id: string) {
        if (this.selectedPatients.has(id)) {
            this.selectedPatients.delete(id);
        } else {
            this.selectedPatients.add(id);
        }
    }

    deletePatient(patient: Patient) {

        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: '380px',
            data: { message: `¿Eliminar al paciente ${patient.fullName}?` }
        });

        dialogRef.afterClosed().subscribe(result => {

            if (result !== true) return;

            this.patientsService.delete(patient.id).subscribe(() => {

                this.allPatients = this.allPatients.filter(p => p.id !== patient.id);
                this.dataSource.data = [...this.allPatients];

                this.snackBar.open(
                    `Paciente ${patient.fullName} eliminado`,
                    'OK',
                    { duration: 2500 }
                );

            });

        });

    }

    deleteSelected() {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: { message: '¿Eliminar pacientes seleccionados?' }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result !== true) return;

            const deletions = Array.from(this.selectedPatients)
                .map(id => this.patientsService.delete(id));

            forkJoin(deletions).subscribe(() => {
                this.snackBar.open('Pacientes eliminados', 'OK', { duration: 3000 });
                this.selectedPatients.clear();
                this.loadPatients();
            })
        });
    }

    schedulePatient(patient: Patient) {

        this.router.navigate(
            ['/agenda'],
            {
                queryParams: { patientId: patient.id }
            }
        );

    }

    viewHistory(patient: Patient) {

        this.router.navigate(
            ['/patients', patient.id, 'history']
        );

    }

    goToNewPatient() {

        this.router.navigate(['/patients/new']);

    }

    getAvatarColor(name: string): string {

        const colors = [
            '#2563eb',
            '#7c3aed',
            '#0ea5e9',
            '#22c55e',
            '#f97316'
        ];

        const index = name
            .charCodeAt(0) % colors.length;

        return colors[index];

    }

    viewEvolution(patient: any) {

        this.router.navigate(['/patients', patient.id, 'evolution']);

    }
}