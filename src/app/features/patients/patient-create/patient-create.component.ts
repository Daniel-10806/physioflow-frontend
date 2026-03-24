import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { PatientsService } from '../patients.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { MAT_DATE_FORMATS } from '@angular/material/core';

export const PERU_DATE_FORMATS = {
    parse: {
        dateInput: 'DD/MM/YYYY',
    },
    display: {
        dateInput: 'DD/MM/YYYY',
        monthYearLabel: 'MMM YYYY',
        dateA11yLabel: 'LL',
        monthYearA11yLabel: 'MMMM YYYY',
    },
};

@Component({
    selector: 'app-patient-create',
    standalone: true,
    providers: [
        { provide: MAT_DATE_LOCALE, useValue: 'es-PE' },
        { provide: MAT_DATE_FORMATS, useValue: PERU_DATE_FORMATS }
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatCardModule,
        MatInputModule,
        MatButtonModule,
        MatSelectModule,
        MatFormFieldModule,
        MatIconModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatSelect,
        MatProgressSpinnerModule
    ],
    templateUrl: './patient-create.component.html',
    styleUrls: ['./patient-create.component.scss']
})


export class PatientCreateComponent {

    form!: FormGroup;
    isSaving = false;

    constructor(
        private fb: FormBuilder,
        private patientsService: PatientsService,
        private router: Router
    ) {
        this.form = this.fb.group({

            fullName: ['', Validators.required],

            dni: ['', [Validators.pattern(/^[0-9]{8}$/)]],

            email: ['', [Validators.required, Validators.email]],

            phone: ['', [Validators.pattern(/^[0-9]{9}$/)]],

            birthDate: [''],

            gender: ['', Validators.required],

            insurance: ['none'],

            emergencyName: [''],

            emergencyPhone: [''],

            medicalHistory: [''],

            notes: ['']

        });
    }

    save() {

        if (this.form.invalid) return;

        this.isSaving = true;

        const data = {
            ...this.form.value,
            birthDate: this.formatDate(this.form.value.birthDate)
        };

        this.patientsService.create(data)
            .subscribe({
                next: () => {
                    this.router.navigate(['/patients']);
                },
                error: (err) => {
                    console.error(err);
                    this.isSaving = false;
                }
            });
    }

    formatDate(date: any) {

        if (!date) return null;

        const d = new Date(date);

        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');

        return `${yyyy}-${mm}-${dd}`;
    }

    getAge(): number | null {

        const birth = this.form.get('birthDate')?.value;

        if (!birth) return null;

        const today = new Date();
        const date = new Date(birth);

        let age = today.getFullYear() - date.getFullYear();

        const m = today.getMonth() - date.getMonth();

        if (m < 0 || (m === 0 && today.getDate() < date.getDate())) {

            age--;

        }

        return age;

    }

    photoPreview: string | null = null;

    onPhotoSelected(event: any) {

        const file = event.target.files[0];

        if (!file) return;

        const reader = new FileReader();

        reader.onload = () => {
            this.photoPreview = reader.result as string;
        };

        reader.readAsDataURL(file);

    }

    goBack() {
        this.router.navigate(['/patients']);
    }
}