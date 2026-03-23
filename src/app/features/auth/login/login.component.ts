import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { trigger, style, animate, transition } from '@angular/animations';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs/operators';
import { ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatCardModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinner
    ],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,

    animations: [
        trigger('fadeIn', [
            transition(':enter', [
                style({ opacity: 0, transform: 'translateY(20px)' }),
                animate('1000ms ease-out')
            ])
        ])
    ]

})
export class LoginComponent {

    form!: FormGroup;
    hidePassword = true;
    loading = false;
    failedAttempts = 0;
    isBlocked = false;
    blockTimeRemaining = 0;


    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router,
        private snackBar: MatSnackBar,
        private cdr: ChangeDetectorRef
    ) {
        this.form = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required]],
            rememberMe: [false]
        });
    }

    login() {

        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        if (this.isBlocked) return;

        this.loading = true;
        this.cdr.markForCheck();

        this.authService.login(this.form.value as any)
            .pipe(
                finalize(() => {
                    this.loading = false;
                    this.cdr.markForCheck();
                })
            )
            .subscribe({
                next: () => {
                    this.failedAttempts = 0;
                    this.router.navigate(['/dashboard']);
                },
                error: () => {

                    this.failedAttempts++;

                    if (this.failedAttempts >= 3) {
                        this.startBlockTimer();
                    }

                    this.snackBar.open(
                        'Credenciales incorrectas. Verifique sus datos.',
                        'Cerrar',
                        { duration: 4000 }
                    );

                    this.cdr.markForCheck();
                }
            });
    }

    private startBlockTimer() {

        this.isBlocked = true;
        this.blockTimeRemaining = 60;

        this.form.reset();

        this.form.markAsPristine();
        this.form.markAsUntouched();

        Object.values(this.form.controls).forEach(control => {
            control.markAsPristine();
            control.markAsUntouched();
            control.updateValueAndValidity({ emitEvent: false });
        });

        this.cdr.markForCheck();

        const interval = setInterval(() => {

            this.blockTimeRemaining--;
            this.cdr.markForCheck();

            if (this.blockTimeRemaining <= 0) {
                clearInterval(interval);
                this.isBlocked = false;
                this.failedAttempts = 0;
                this.cdr.markForCheck();
            }

        }, 1000);
    }

    goToRegister(): void {
        this.router.navigate(['/register']);
    }
}