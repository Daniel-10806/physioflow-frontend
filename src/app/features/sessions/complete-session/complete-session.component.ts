import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PatientsService } from '../../patients/patients.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-complete-session',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './complete-session.component.html',
    styleUrls: ['./complete-session.component.scss']
})
export class CompleteSessionComponent {

    sessionId!: string;
    patientId!: string;

    form = {
        subjective: '',
        objective: '',
        assessment: '',
        treatment: '',
        progressNotes: ''
    };

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private service: PatientsService
    ) { }

    ngOnInit() {

        this.sessionId = this.route.snapshot.paramMap.get('id')!;

        this.service.getSession(this.sessionId).subscribe(s => {
            this.patientId = s.patientId;
        });

    }

    save() {

        this.service.createSessionRecord(this.sessionId, this.form)
            .subscribe(() => {

                this.router.navigate(['/patients', this.patientId, 'history']);

            });

    }

    cancel() {

        this.router.navigate(['/agenda']);

    }

}