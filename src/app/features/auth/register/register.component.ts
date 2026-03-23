import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';
import { finalize } from 'rxjs/operators';
import { MatSelectModule } from '@angular/material/select';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatCardModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatSelectModule
    ],
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterComponent {

    hidePassword = true;
    hideConfirmPassword = true;
    loading = false;

    form: FormGroup;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router,
        private snackBar: MatSnackBar
    ) {

        this.form = this.fb.group({
            fullName: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [
                Validators.required,
                Validators.minLength(6),
                Validators.pattern(/^(?=.*[A-Z])(?=.*\d).*$/)
            ]],
            confirmPassword: ['', Validators.required],
            gender: ['FEMALE', Validators.required]
        }, { validators: this.passwordMatchValidator });
    }

    passwordMatchValidator(control: AbstractControl) {
        const password = control.get('password')?.value;
        const confirmPassword = control.get('confirmPassword')?.value;

        if (!password || !confirmPassword) return null;

        return password === confirmPassword ? null : { passwordMismatch: true };
    }

    get passwordStrength(): string {
        const value = this.form.get('password')?.value || '';

        if (value.length < 6) return 'Débil';
        if (/[A-Z]/.test(value) && /\d/.test(value)) return 'Fuerte';
        return 'Media';
    }

    register() {

        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.loading = true;

        const { confirmPassword, ...payload } = this.form.value;

        this.authService.register(payload)
            .pipe(finalize(() => this.loading = false))
            .subscribe({
                next: (response: any) => {

                    localStorage.setItem('physioflow_token', response.token);

                    this.snackBar.open(
                        `Bienvenido(a) a PhysioFlow`,
                        'Cerrar',
                        { duration: 4000 }
                    );

                    this.router.navigate(['/dashboard']);
                },
                error: (err) => {
                    const message = err?.error?.message || 'Error en el registro';
                    this.snackBar.open(message, 'Cerrar', { duration: 4000 });
                }
            });
    }

    public goToLogin(): void {
        this.router.navigate(['/login']);
    }
}