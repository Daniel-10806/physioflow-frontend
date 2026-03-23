import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { SessionService } from '../../../core/services/session.service';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';

@Component({
    selector: 'app-session-record',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, MatButtonModule, FormsModule],
    templateUrl: './session-record.component.html',
    styleUrls: ['./session-record.component.scss']
})
export class SessionRecordComponent implements OnInit {

    sessionId!: string;

    form!: FormGroup;

    constructor(
        private fb: FormBuilder,
        private sessionService: SessionService,
        private route: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit() {

        this.sessionId = this.route.snapshot.paramMap.get('id')!;

        this.form = this.fb.group({

            subjective: [''],
            objective: [''],
            assessment: [''],
            treatment: [''],
            progressNotes: [''],

            painLevel: [5, Validators.required],
            mobilityLevel: [5, Validators.required],
            strengthLevel: [5, Validators.required]

        });

    }

    cancel() {

        this.router.navigate(['/agenda']);

    }

    save() {

        if (this.form.invalid) return;

        this.sessionService.createSessionRecord(
            this.sessionId,
            this.form.value
        ).subscribe(() => {

            alert("Evolución clínica guardada");

            this.router.navigate(['/agenda']);

        });

    }

}