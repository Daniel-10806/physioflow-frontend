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
    selector: 'app-masotherapy',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatCardModule
    ],
    templateUrl: './masotherapy.component.html',
    styleUrls: ['./masotherapy.component.scss']
})
export class MasotherapyComponent implements OnInit {

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

            zone: ['', Validators.required],

            massageType: ['', Validators.required],

            pressure: ['', Validators.required],

            duration: ['', Validators.required],

            notes: ['']

        });

    }

    save() {

        if (this.form.invalid) return;

        const payload = {

            zone: this.form.value.zone,

            massageType: this.form.value.massageType,

            pressure: this.form.value.pressure,

            duration: this.form.value.duration,

            notes: this.form.value.notes

        };

        this.sessionService.createSessionRecord(
            this.sessionId,
            payload
        ).subscribe(() => {

            this.snackBar.open(
                "Masoterapia registrada",
                "OK",
                { duration: 3000 }
            );

            this.router.navigate(['/agenda']);

        });

    }

}