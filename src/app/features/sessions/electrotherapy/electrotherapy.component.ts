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
    selector: 'app-electrotherapy',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatCardModule
    ],
    templateUrl: './electrotherapy.component.html',
    styleUrls: ['./electrotherapy.component.scss']
})
export class ElectrotherapyComponent implements OnInit {

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

            currentType: ['', Validators.required],

            intensity: ['', Validators.required],

            frequency: ['', Validators.required],

            duration: ['', Validators.required],

            notes: ['']

        });

    }

    save() {

        if (this.form.invalid) return;

        const payload = {

            currentType: this.form.value.currentType,
            intensity: this.form.value.intensity,
            frequency: this.form.value.frequency,
            duration: this.form.value.duration,
            notes: this.form.value.notes

        };

        this.sessionService.createSessionRecord(
            this.sessionId,
            payload
        ).subscribe(() => {

            this.snackBar.open(
                "Electroterapia registrada",
                "OK",
                { duration: 3000 }
            );

            this.router.navigate(['/agenda']);

        });

    }

}