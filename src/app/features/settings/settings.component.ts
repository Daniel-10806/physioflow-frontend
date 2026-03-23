import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import { MatTabsModule } from '@angular/material/tabs'
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { HttpClientModule } from '@angular/common/http'
import { SettingsService } from '../../core/services/settings.service'
import { ChangeDetectorRef } from '@angular/core'
import { MatDialog, MatDialogModule } from '@angular/material/dialog'
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component'

@Component({
    selector: 'app-settings',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        MatTabsModule,
        MatSnackBarModule,
        MatProgressSpinnerModule,
        HttpClientModule,
        MatDialogModule
    ],
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

    // GENERAL

    clinicName = ""
    address = ""
    phone = ""

    // SYSTEM

    email = ""
    currency = ""
    tax = 18
    systemName = ""

    // BILLING

    billingSeries = ""
    billingEnabled = true
    igv = 18

    // USERS

    users: any[] = []

    newUserName = ""
    newUserRole = "DOCTOR"

    // UI

    loading = false

    newUserEmail = ""

    startHour = "08:00"
    endHour = "20:00"
    sessionDuration = 45

    ruc = ""
    businessName = ""
    businessAddress = ""

    constructor(
        private snack: MatSnackBar,
        private settings: SettingsService,
        private cd: ChangeDetectorRef,
        private dialog: MatDialog
    ) { }


    ngOnInit() {
        this.loadSettings()
        this.loadUsers()
    }



    // ======================
    // LOAD
    // ======================

    loadSettings() {

        this.settings.getSettings().subscribe((res: any) => {

            this.clinicName = res.clinicName
            this.address = res.address
            this.phone = res.phone

            this.email = res.email
            this.currency = res.currency
            this.tax = res.tax
            this.systemName = res.systemName

            this.billingSeries = res.billingSeries
            this.billingEnabled = res.billingEnabled
            this.igv = res.igv

        })

    }


    // ======================
    // SAVE GENERAL
    // ======================

    saveGeneral() {

        this.loading = true

        this.settings.saveSettings({

            clinicName: this.clinicName,
            address: this.address,
            phone: this.phone,

            email: this.email,
            currency: this.currency,
            tax: this.tax,
            systemName: this.systemName,

            billingSeries: this.billingSeries,
            billingEnabled: this.billingEnabled,
            igv: this.igv,

            users: this.users

        }).subscribe({
            next: () => {

                this.loading = false
                this.cd.detectChanges()

                this.snack.open("Guardado", "OK", { duration: 2000 })

            }
        })

    }


    // ======================
    // SAVE BILLING
    // ======================

    saveBillingTab() {

        this.loading = true

        this.settings.saveSettings({

            clinicName: this.clinicName,
            address: this.address,
            phone: this.phone,

            email: this.email,
            currency: this.currency,
            tax: this.tax,
            systemName: this.systemName,

            billingSeries: this.billingSeries,
            billingEnabled: this.billingEnabled,
            igv: this.igv,

            users: this.users

        }).subscribe(() => {

            this.loading = false

            this.cd.detectChanges()

            this.snack.open(
                "Facturación guardada",
                "OK",
                { duration: 2000 }
            )

        })

    }

    // ======================
    // USERS
    // ======================

    loadUsers() {

        this.settings.getUsers()
            .subscribe(res => {

                this.users = res

                this.cd.detectChanges()

            })

    }


    addUser() {

        if (!this.newUserName) return

        this.settings.addUser({

            name: this.newUserName,
            email: this.newUserEmail,
            role: this.newUserRole,
            active: true

        }).subscribe(() => {

            this.newUserName = ""
            this.newUserEmail = ""

            this.loadUsers()

        })

    }


    toggleUser(u: any) {

        this.settings.updateUser(
            u.id,
            { active: !u.active }
        ).subscribe(() => {

            this.loadUsers()

        })

    }

    // ======================
    // DELETE USER
    // ======================

    deleteUser(u: any) {

        const dialogRef = this.dialog.open(
            ConfirmDialogComponent,
            {
                width: '380px',
                data: {
                    message:
                        '¿Eliminar usuario ' +
                        u.name +
                        ' ?'
                }
            }
        )

        dialogRef.afterClosed()
            .subscribe(result => {

                if (!result) return

                this.settings.deleteUser(u.id)
                    .subscribe(() => {

                        this.snack.open(
                            "Usuario eliminado",
                            "OK",
                            { duration: 2000 }
                        )

                        this.loadUsers()

                    })

            })

    }

}