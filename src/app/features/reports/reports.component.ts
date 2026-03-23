import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MatCardModule } from '@angular/material/card'
import { ReportService, ReportSummary } from '../../core/services/report.service'
import { FormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { ChangeDetectorRef } from '@angular/core'

@Component({
    selector: 'app-reports',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        FormsModule,
        RouterModule
    ],
    templateUrl: './reports.component.html',
    styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {

    summary?: ReportSummary

    fromDate: string | null = null
    toDate: string | null = null

    patientId: string | null = null
    therapistId: string | null = null

    patients: any[] = []
    therapists: any[] = []

    rows: any[] = []

    constructor(
        private reportService: ReportService,
        private cdr: ChangeDetectorRef
    ) { }

    // Se ejecuta al entrar a Reportes
    ngOnInit(): void {

        this.loadSummary()
        this.search()

    }

    // ======================
    // SUMMARY
    // ======================

    loadSummary() {

        this.reportService.getSummary().subscribe({

            next: data => {

                this.summary = data

            },

            error: err => {

                console.error("Error summary", err)

            }

        })

    }

    // ======================
    // SEARCH
    // ======================

    search() {

        this.reportService.search({}).subscribe({

            next: data => {

                this.rows = data
                this.cdr.detectChanges()

            },

            error: err => console.error(err)

        })

    }

    // ======================
    // EXPORT
    // ======================

    exportPdf() {

        const doc = new jsPDF()

        const today = new Date().toLocaleDateString()
        const reportNumber = Math.floor(Math.random() * 100000)

        const from = this.fromDate ? this.fromDate : "Todos"
        const to = this.toDate ? this.toDate : "Todos"

        const user = "Fisioterapeuta" // luego puedes sacar del JWT
        const therapist = this.therapistId ? this.therapistId : "Todos"

        const logo = new Image()
        logo.src = 'logo.png'

        logo.onload = () => {

            // =========================
            // HEADER
            // =========================

            doc.setFillColor(21, 101, 192)
            doc.rect(0, 0, 210, 24, 'F')

            doc.setFillColor(200, 220, 255)
            doc.rect(0, 24, 210, 6, 'F')

            doc.addImage(logo, 'PNG', 10, 4, 16, 16)

            doc.setFont('helvetica', 'bold')
            doc.setFontSize(15)

            doc.text("PHYSIOFLOW", 105, 10, { align: "center" })

            doc.setFontSize(9)
            doc.setFont('helvetica', 'normal')

            doc.text(
                "Sistema Clínico Profesional",
                105,
                16,
                { align: "center" }
            )


            // =========================
            // INFO REPORTE
            // =========================

            doc.setFontSize(8)

            doc.text(
                "Reporte Nº: " + reportNumber,
                14,
                34
            )

            doc.text(
                "Fecha generación: " + today,
                150,
                34
            )

            doc.text(
                "Usuario: " + user,
                14,
                40
            )

            doc.text(
                "Terapeuta: " + therapist,
                150,
                40
            )


            // =========================
            // TITULO
            // =========================

            doc.setFontSize(12)
            doc.setFont('helvetica', 'bold')

            doc.text(
                "REPORTE DE SESIONES",
                105,
                48,
                { align: "center" }
            )


            // =========================
            // FILTROS
            // =========================

            doc.setFontSize(9)
            doc.setFont('helvetica', 'normal')

            doc.text("Desde: " + from, 14, 56)
            doc.text("Hasta: " + to, 80, 56)


            // =========================
            // CAJA RESUMEN
            // =========================

            doc.setFillColor(245, 247, 250)

            doc.roundedRect(
                10,
                60,
                190,
                30,
                3,
                3,
                'F'
            )

            doc.setFontSize(11)
            doc.setFont('helvetica', 'bold')

            doc.text(
                "Sesiones: " + (this.summary?.totalSessions || 0),
                15,
                70
            )

            doc.text(
                "Completadas: " + (this.summary?.completedSessions || 0),
                15,
                80
            )

            doc.text(
                "Pacientes: " + (this.summary?.totalPatients || 0),
                110,
                70
            )

            doc.text(
                "Ingresos: S/ " + (this.summary?.totalRevenue || 0),
                110,
                80
            )


            // =========================
            // TABLA
            // =========================

            const body = this.rows.map(r => [

                r.date,
                r.patient,
                r.therapist,
                r.type,
                "S/ " + r.amount

            ])

            autoTable(doc, {

                startY: 95,

                head: [[
                    "Fecha",
                    "Paciente",
                    "Terapeuta",
                    "Tipo",
                    "Monto"
                ]],

                body,

                theme: "grid",

                styles: {
                    fontSize: 9,
                    cellPadding: 3
                },

                headStyles: {
                    fillColor: [21, 101, 192],
                    textColor: 255,
                    fontStyle: 'bold'
                },

                alternateRowStyles: {
                    fillColor: [245, 247, 250]
                }

            })


            // =========================
            // TOTAL
            // =========================

            const total = this.summary?.totalRevenue || 0

            const finalY =
                (doc as any).lastAutoTable?.finalY || 100


            doc.setFillColor(21, 101, 192)

            doc.rect(
                10,
                finalY + 6,
                190,
                10,
                'F'
            )

            doc.setTextColor(255)

            doc.setFontSize(12)
            doc.setFont('helvetica', 'bold')

            doc.text(
                "TOTAL INGRESOS: S/ " + total,
                14,
                finalY + 13
            )

            doc.setTextColor(0)


            // =========================
            // FOOTER
            // =========================

            doc.setFontSize(8)
            doc.setTextColor(120)

            doc.text(
                "PhysioFlow © Sistema Clínico",
                14,
                290
            )

            doc.text(
                "Confidencial",
                105,
                290,
                { align: "center" }
            )

            doc.text(
                "Documento generado automáticamente",
                135,
                290
            )


            // =========================
            // SAVE
            // =========================

            doc.save("reporte-physioflow.pdf")

        }

    }

    exportExcel() {

        const today = new Date().toLocaleDateString()
        const reportNumber = Math.floor(Math.random() * 100000)

        const from = this.fromDate ? this.fromDate : "Todos"
        const to = this.toDate ? this.toDate : "Todos"

        const total = this.summary?.totalRevenue || 0

        const user = "Administrador"
        const therapist = this.therapistId ? this.therapistId : "Todos"

        // =========================
        // TABLA
        // =========================

        const tableData = this.rows.map(r => ([
            r.date,
            r.patient,
            r.therapist,
            r.type,
            Number(r.amount)
        ]))


        // =========================
        // CONTENIDO HOJA
        // =========================

        const data = [

            ["PHYSIOFLOW"],
            ["Sistema Clínico Profesional"],
            [],

            ["Reporte Nº", reportNumber],
            ["Fecha generación", today],
            ["Usuario", user],
            ["Terapeuta", therapist],

            [],

            ["Desde", from],
            ["Hasta", to],

            [],

            ["Fecha", "Paciente", "Terapeuta", "Tipo", "Monto"],

            ...tableData,

            [],

            ["", "", "", "TOTAL", total]

        ]


        // =========================
        // CREAR HOJA
        // =========================

        const worksheet = XLSX.utils.aoa_to_sheet(data)


        // =========================
        // ANCHO COLUMNAS
        // =========================

        worksheet["!cols"] = [

            { wch: 12 },
            { wch: 30 },
            { wch: 30 },
            { wch: 18 },
            { wch: 12 }

        ]


        // =========================
        // WORKBOOK
        // =========================

        const workbook = XLSX.utils.book_new()

        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            "REPORTE"
        )


        // =========================
        // EXPORTAR
        // =========================

        const excelBuffer = XLSX.write(
            workbook,
            {
                bookType: 'xlsx',
                type: 'array'
            }
        )

        const blob = new Blob(
            [excelBuffer],
            { type: 'application/octet-stream' }
        )

        saveAs(
            blob,
            "reporte-physioflow.xlsx"
        )

    }
}