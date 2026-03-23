import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { authGuard } from './core/guards/auth.guard';
import { PatientsListComponent } from './features/patients/patients-list/patients-list.component';
import { PatientCreateComponent } from './features/patients/patient-create/patient-create.component';
import { PatientDetailComponent } from './features/patients/patient-detail/patient-detail.component';
import { RehabilitationComponent } from './features/sessions/rehabilitation/rehabilitation.component';
import { ElectrotherapyComponent } from './features/sessions/electrotherapy/electrotherapy.component';
import { MasotherapyComponent } from './features/sessions/masotherapy/masotherapy.component';
import { EvaluationComponent } from './features/sessions/evaluation/evaluation.component';
import { PhysioComponent } from './features/sessions/physio/physio.component';
import { ReportsComponent } from './features/reports/reports.component'

export const routes: Routes = [
    { path: 'login', component: LoginComponent },

    {
        path: 'register',
        loadComponent: () =>
            import('./features/auth/register/register.component')
                .then(m => m.RegisterComponent)
    },

    {
        path: 'dashboard',
        canActivate: [authGuard],
        loadComponent: () =>
            import('./features/dashboard/dashboard.component')
                .then(m => m.DashboardComponent)
    },

    {
        path: 'agenda',
        canActivate: [authGuard],
        loadComponent: () =>
            import('./features/agenda/agenda.component')
                .then(m => m.AgendaComponent)
    },

    {
        path: 'patients',
        canActivate: [authGuard],
        component: PatientsListComponent
    },

    {
        path: 'patients/new',
        canActivate: [authGuard],
        component: PatientCreateComponent
    },

    {
        path: 'patients/:id',
        canActivate: [authGuard],
        loadComponent: () =>
            import('./features/patients/patient-detail/patient-detail.component')
                .then(m => m.PatientDetailComponent)
    },

    {
        path: 'patients/:id/history',
        loadComponent: () => import('./features/patients/patient-history/patient-history.component')
            .then(m => m.PatientHistoryComponent)
    },

    {
        path: 'sessions/:id/complete',
        canActivate: [authGuard],
        loadComponent: () =>
            import('./features/sessions/complete-session/complete-session.component')
                .then(m => m.CompleteSessionComponent)
    },

    {
        path: 'patients/:id/evolution',
        loadComponent: () =>
            import('./features/patients/patient-evolution/patient-evolution.component')
                .then(m => m.PatientEvolutionComponent)
    },

    {
        path: 'billing',
        loadComponent: () =>
            import('./features/billing/billing.component')
                .then(m => m.BillingComponent)
    },

    {
        path: 'rehabilitation/:id',
        component: RehabilitationComponent
    },
    {
        path: 'electrotherapy/:id',
        component: ElectrotherapyComponent
    },
    {
        path: 'masotherapy/:id',
        component: MasotherapyComponent
    },
    {
        path: 'evaluation/:id',
        component: EvaluationComponent
    },
    {
        path: 'physio/:id',
        component: PhysioComponent
    },

    {
        path: 'session-record/:id',
        loadComponent: () =>
            import('./features/sessions/session-record/session-record.component')
                .then(m => m.SessionRecordComponent)
    },

    {
        path: 'reports',
        component: ReportsComponent
    },

    {
        path: 'settings',
        loadComponent: () =>
            import('./features/settings/settings.component')
                .then(m => m.SettingsComponent)
    },

    { path: '', redirectTo: 'login', pathMatch: 'full' }
];