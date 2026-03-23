import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PatientsService } from '../patients.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
    standalone: true,
    selector: 'app-patient-detail',
    imports: [CommonModule, MatCardModule, MatButtonModule],
    templateUrl: './patient-detail.component.html',
    styleUrls: ['./patient-detail.component.scss']
})
export class PatientDetailComponent implements OnInit {

    patient: any;
    loading = true;

    constructor(
        private route: ActivatedRoute,
        private patientsService: PatientsService
    ) { }

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');

        if (!id) return;

        this.patientsService.getById(id).subscribe({
            next: (data) => {
                this.patient = data;
                this.loading = false;
            },
            error: () => this.loading = false
        });
    }
}