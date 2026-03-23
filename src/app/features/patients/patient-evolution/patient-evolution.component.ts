import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PatientsService } from '../patients.service';
import { Chart } from 'chart.js/auto';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { ViewChild, ElementRef } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';

@Component({
    selector: 'app-patient-evolution',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        FormsModule
    ],
    templateUrl: './patient-evolution.component.html',
    styleUrls: ['./patient-evolution.component.scss']
})
export class PatientEvolutionComponent implements OnInit {

    patientId!: string;

    avgPain: number | null = null;
    avgMobility: number | null = null;
    avgStrength: number | null = null;

    patient: any;

    sessionsCount = 0;
    lastSession: string = '';

    progressPercentage = 0;
    patientStatus = "Estable";
    statusClass = "warning";
    trendText = "";

    newPain = 0;
    newMobility = 0;
    newStrength = 0;
    newNotes = "";

    @ViewChild('chartCanvas') chartCanvas!: ElementRef;

    chart!: Chart;

    constructor(
        private route: ActivatedRoute,
        private patientsService: PatientsService,
        private router: Router,
        private cd: ChangeDetectorRef
    ) { }

    ngOnInit() {

        this.patientId = this.route.snapshot.paramMap.get('id')!;

        this.loadPatient();
        this.loadEvolution();

    }

    loadPatient() {

        this.patientsService.getById(this.patientId)
            .subscribe(patient => {
                this.patient = patient;
            });

    }

    loadEvolution() {

        this.patientsService.getEvolution(this.patientId)
            .subscribe({

                next: (data) => {

                    console.log("EVOLUTION DATA:", data);

                    if (!data || data.length === 0) {

                        this.avgPain = null;
                        this.avgMobility = null;
                        this.avgStrength = null;

                        this.sessionsCount = 0;

                        this.cd.detectChanges();

                        return;
                    }

                    this.sessionsCount = data.length;

                    this.lastSession =
                        data[data.length - 1]?.sessionDate;


                    const labels: string[] = [];

                    const painChart: number[] = [];
                    const mobilityChart: number[] = [];
                    const strengthChart: number[] = [];

                    const painValid: number[] = [];
                    const mobilityValid: number[] = [];
                    const strengthValid: number[] = [];


                    for (const d of data) {

                        labels.push(d.sessionDate);

                        const pain =
                            d.painLevel !== null && d.painLevel !== undefined
                                ? Number(d.painLevel)
                                : null;

                        const mobility =
                            d.mobilityLevel !== null && d.mobilityLevel !== undefined
                                ? Number(d.mobilityLevel)
                                : null;

                        const strength =
                            d.strengthLevel !== null && d.strengthLevel !== undefined
                                ? Number(d.strengthLevel)
                                : null;

                        // chart siempre muestra algo
                        painChart.push(pain ?? 0);
                        mobilityChart.push(mobility ?? 0);
                        strengthChart.push(strength ?? 0);

                        // promedio solo valores reales
                        if (pain !== null && !isNaN(pain)) {
                            painValid.push(pain);
                        }

                        if (mobility !== null && !isNaN(mobility)) {
                            mobilityValid.push(mobility);
                        }

                        if (strength !== null && !isNaN(strength)) {
                            strengthValid.push(strength);
                        }

                    }

                    // PROMEDIOS CORRECTOS

                    this.avgPain =
                        painValid.length > 0
                            ? Math.round(
                                painValid.reduce((a, b) => a + b, 0)
                                / painValid.length
                            )
                            : null;


                    this.avgMobility =
                        mobilityValid.length > 0
                            ? Math.round(
                                mobilityValid.reduce((a, b) => a + b, 0)
                                / mobilityValid.length
                            )
                            : null;


                    this.avgStrength =
                        strengthValid.length > 0
                            ? Math.round(
                                strengthValid.reduce((a, b) => a + b, 0)
                                / strengthValid.length
                            )
                            : null;



                    // PROGRESO

                    if (painValid.length > 1) {

                        const firstPain = painValid[0];
                        const lastPain = painValid[painValid.length - 1];

                        if (firstPain !== 0) {

                            const improvement =
                                firstPain - lastPain;

                            this.progressPercentage =
                                Math.round(
                                    (improvement / firstPain) * 100
                                );

                        }

                    }

                    if (this.progressPercentage > 40) {

                        this.patientStatus = "MEJORANDO";
                        this.statusClass = "good";
                        this.trendText =
                            "EL PACIENTE MUESTRA RECUPERACIÓN POSITIVA";

                    }
                    else if (this.progressPercentage > 10) {

                        this.patientStatus = "Estable";
                        this.statusClass = "warning";
                        this.trendText =
                            "PROGRESO MODERADO";

                    }
                    else {

                        this.patientStatus = "REQUIERE REVISIÓN";
                        this.statusClass = "bad";
                        this.trendText =
                            "REEVALUAR TRATAMIENTO";

                    }

                    // CHART

                    this.cd.detectChanges();

                    setTimeout(() => {

                        this.renderChart(
                            labels,
                            painChart,
                            mobilityChart,
                            strengthChart
                        );

                    }, 50);
                }

            });

    }

    goBack() {
        this.router.navigate(['/patients']);
    }

    saveEvolution() {

        const body = {

            painLevel: this.newPain,
            mobilityLevel: this.newMobility,
            strengthLevel: this.newStrength,
            notes: this.newNotes

        };

        this.patientsService
            .addEvolution(this.patientId, body)
            .subscribe(() => {

                this.newPain = 0;
                this.newMobility = 0;
                this.newStrength = 0;
                this.newNotes = "";

                this.loadEvolution();

            });

    }

    renderChart(
        labels: string[],
        painChart: number[],
        mobilityChart: number[],
        strengthChart: number[]
    ) {

        if (!this.chartCanvas) return;

        if (this.chart) {
            this.chart.destroy();
        }

        const ctx = this.chartCanvas.nativeElement;

        this.chart = new Chart(ctx, {

            type: 'bar',

            data: {

                labels,

                datasets: [

                    {
                        label: 'DOLOR',
                        data: painChart,
                        backgroundColor: '#ef4444'
                    },

                    {
                        label: 'MOVILIDAD',
                        data: mobilityChart,
                        backgroundColor: '#3b82f6'
                    },

                    {
                        label: 'FUERZA',
                        data: strengthChart,
                        backgroundColor: '#22c55e'
                    }

                ]

            },

            options: {

                responsive: true,

                animation: {

                    duration: 800,
                    easing: 'easeOutQuart'

                },

                plugins: {

                    legend: {
                        position: 'top'
                    }

                },

                scales: {

                    y: {
                        beginAtZero: true,
                        max: 10,
                        ticks: {
                            stepSize: 1
                        }
                    }

                }

            }

        });

    }

}