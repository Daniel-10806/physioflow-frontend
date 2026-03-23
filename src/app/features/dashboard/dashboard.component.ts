import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { DashboardService } from '../../core/services/dashboard.service';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { SessionService, SessionToday } from '../../core/services/session.service';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        MatCardModule,
        MatButtonModule
    ],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

    totalPatients = 0;
    sessionsToday = 0;
    weeklyEvaluations = 0;
    dailyCapacity = 10;
    sessions: SessionToday[] = []
    todaySessions: SessionToday[] = [];
    animatedPatients = 0;
    animatedSessions = 0;
    animatedEvaluations = 0;
    loadingSessions = true;
    userName = localStorage.getItem('physio_user_name') || 'Usuario';
    gender = localStorage.getItem('physio_user_gender');
    pendingSessions = 0;
    newPatientsWeek = 0;
    animatedNewPatients = 0;
    completedToday = 0;
    nextSession: SessionToday | null = null;
    animatedPending = 0;
    collapsed = false;
    mobileOpen = false;

    constructor(
        private dashboardService: DashboardService,
        private auth: AuthService,
        private router: Router,
        private sessionService: SessionService,
        private cd: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.loadDashboard();
        this.loadSessions();
    }

    loadDashboard() {

        this.dashboardService.getSummary().subscribe({
            next: (summary) => {

                this.totalPatients = summary.totalPatients ?? 0;
                this.newPatientsWeek = summary.newPatientsWeek ?? 0;
                this.dailyCapacity = summary.dailyCapacity ?? 10;

                this.animateCounters();
            },
            error: (err) => {

                console.error('Error dashboard summary', err);

                this.totalPatients = 0;
                this.weeklyEvaluations = 0;
                this.dailyCapacity = 10;

                this.animateCounters();
            }
        });

    }

    loadSessions() {

        this.sessionService.getTodaySessions().subscribe({

            next: (data) => {

                this.sessions = data || [];

                this.sessionsToday = this.sessions.length;

                this.pendingSessions = this.sessions
                    .filter(s => s.status === 'SCHEDULED')
                    .length;

                this.completedToday = this.sessions
                    .filter(s => s.status === 'COMPLETED')
                    .length;

                this.nextSession = this.sessions
                    .filter(s => s.status === 'SCHEDULED')
                    .sort((a, b) => a.time.localeCompare(b.time))[0] || null;

                this.loadingSessions = false;

                this.animateCounters();

                this.cd.detectChanges();
            },

            error: () => {

                this.sessions = [];
                this.sessionsToday = 0;
                this.pendingSessions = 0;

                this.loadingSessions = false;

                this.cd.detectChanges();
            }
        });
    }

    animateCounters() {

        this.animateValue('sessions', this.sessionsToday);
        this.animateValue('pending', this.pendingSessions);
        this.animateValue('newPatients', this.newPatientsWeek);

    }

    trackSession(index: number, item: SessionToday) {
        return item.id;
    }

    animateValue(type: string, target: number) {

        let current = 0;
        const increment = Math.max(1, Math.floor(target / 30));

        const interval = setInterval(() => {

            current += increment;

            if (current >= target) {
                current = target;
                clearInterval(interval);
            }

            if (type === 'sessions') this.animatedSessions = current;
            if (type === 'pending') this.animatedPending = current;
            if (type === 'newPatients') this.animatedNewPatients = current;

        }, 20);
    }

    get greeting(): string {
        return this.gender === 'FEMALE'
            ? 'Bienvenida'
            : 'Bienvenido';
    }

    get occupancyPercentage(): number {
        return this.dailyCapacity === 0
            ? 0
            : (this.sessionsToday / this.dailyCapacity) * 100;
    }

    logout() {
        this.auth.logout();
        this.router.navigate(['/login']);
    }

    toggleSidebar() {

        if (window.innerWidth <= 768) {

            this.mobileOpen = !this.mobileOpen;

        } else {

            this.collapsed = !this.collapsed;

        }

    }
}