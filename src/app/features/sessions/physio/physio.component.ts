import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
    FormBuilder,
    FormGroup,
    Validators,
    ReactiveFormsModule
} from '@angular/forms';

import { CommonModule } from '@angular/common';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';

import { SessionService } from '../../../core/services/session.service';

@Component({
    selector: 'app-physio',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatCardModule
    ],
    templateUrl: './physio.component.html',
    styleUrls: ['./physio.component.scss']
})
export class PhysioComponent implements OnInit {

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

        this.sessionId =
            this.route.snapshot.paramMap.get('id')!;

        this.form = this.fb.group({

            technique: ['', Validators.required],

            zone: ['', Validators.required],

            painLevel: ['', Validators.required],

            mobilityLevel: ['', Validators.required],

            notes: ['']

        });

    }

    save() {

        if (this.form.invalid) return;

        const payload = {

            technique: this.form.value.technique,

            zone: this.form.value.zone,

            painLevel: this.form.value.painLevel,

            mobilityLevel: this.form.value.mobilityLevel,

            notes: this.form.value.notes

        };

        this.sessionService
            .createSessionRecord(
                this.sessionId,
                payload
            )
            .subscribe(() => {

                this.snackBar.open(
                    "Fisioterapia registrada",
                    "OK",
                    { duration: 3000 }
                );

                this.router.navigate(['/agenda']);

            });

    }

}