import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PatientsService } from '../patients.service';
import { PatientHistory } from '../models/history.model';
import { ChangeDetectorRef } from '@angular/core';

@Component({
    selector: 'app-patient-history',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './patient-history.component.html',
    styleUrls: ['./patient-history.component.scss']
})
export class PatientHistoryComponent implements OnInit {

    history: PatientHistory[] = [];
    patientId!: string;
    loading = true;
    patient: any = null;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private patientsService: PatientsService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {

        const id = this.route.snapshot.paramMap.get('id');

        if (!id) {
            this.router.navigate(['/patients']);
            return;
        }

        this.patientId = id;

        // cargar paciente
        this.patientsService.getById(this.patientId)
            .subscribe(p => {

                console.log("Paciente recibido:", p);

                this.patient = p;

            });
        this.loadHistory();

    }

    loadHistory() {

        this.loading = true;

        this.patientsService.getHistory(this.patientId)
            .subscribe({

                next: (data) => {

                    console.log("Historial recibido:", data);

                    this.history = (Array.isArray(data) ? data : []).map(h => ({
                        ...h,
                        sessionDate: h.sessionDate?.split('T')[0],
                        sessionTime: (h.sessionTime || '').substring(0, 5),
                        subjective: h.subjective || '',
                        objective: h.objective || '',
                        assessment: h.assessment || '',
                        treatment: h.treatment || '',
                        progressNotes: h.progressNotes || h.progress_notes || ''
                    }));

                    this.history.sort((a, b) =>
                        new Date(b.sessionDate).getTime() -
                        new Date(a.sessionDate).getTime()
                    );

                    this.loading = false;
                    this.cdr.detectChanges();

                },

                error: (err) => {

                    console.error("Error loading history", err);

                    this.history = [];
                    this.loading = false;

                    this.cdr.detectChanges();
                }

            });

    }

    goBack() {
        this.router.navigate(['/patients']);
    }

}