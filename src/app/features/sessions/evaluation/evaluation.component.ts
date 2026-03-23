import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';

import { SessionService } from '../../../core/services/session.service';

@Component({
    selector: 'app-evaluation',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatCardModule
    ],
    templateUrl: './evaluation.component.html',
    styleUrls: ['./evaluation.component.scss']
})
export class EvaluationComponent implements OnInit {

    form!: FormGroup;

    sessionId!: string;

    constructor(
        private route: ActivatedRoute,
        private fb: FormBuilder,
        private router: Router,
        private snackBar: MatSnackBar,
        private sessionService: SessionService
    ) { }

    ngOnInit() {

        this.sessionId = this.route.snapshot.paramMap.get('id')!;

        this.form = this.fb.group({

            diagnosis: ['', Validators.required],

            initialPain: ['', Validators.required],

            initialMobility: ['', Validators.required],

            treatmentPlan: ['', Validators.required],

            notes: ['']

        });

    }

    save() {

        if (this.form.invalid) return;

        const payload = {

            diagnosis: this.form.value.diagnosis,

            painLevel: this.form.value.initialPain,

            mobilityLevel: this.form.value.initialMobility,

            treatmentPlan: this.form.value.treatmentPlan,

            notes: this.form.value.notes

        };

        this.sessionService.createSessionRecord(
            this.sessionId,
            payload
        ).subscribe(() => {

            this.snackBar.open(
                "Evaluación registrada",
                "OK",
                { duration: 3000 }
            );

            this.router.navigate(['/agenda']);

        });

    }

}