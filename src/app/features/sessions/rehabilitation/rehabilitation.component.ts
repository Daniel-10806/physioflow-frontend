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
    selector: 'app-rehabilitation',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatCardModule
    ],
    templateUrl: './rehabilitation.component.html',
    styleUrls: ['./rehabilitation.component.scss']
})
export class RehabilitationComponent implements OnInit {

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

            pain: [0, Validators.required],

            mobility: [0, Validators.required],

            strength: [0, Validators.required],

            notes: ['']

        });

    }

    save() {

        if (this.form.invalid) return;

        const payload = {

            painLevel: this.form.value.pain,
            mobilityLevel: this.form.value.mobility,
            strengthLevel: this.form.value.strength,
            progressNotes: this.form.value.notes

        };

        this.sessionService.createSessionRecord(
            this.sessionId,
            payload
        ).subscribe(() => {

            this.snackBar.open(
                "Evolución registrada",
                "OK",
                { duration: 3000 }
            );

            this.router.navigate(['/agenda']);

        });

    }

}