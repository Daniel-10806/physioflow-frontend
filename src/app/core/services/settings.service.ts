import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'

@Injectable({
    providedIn: 'root'
})
export class SettingsService {

    api = "http://localhost:8080/api/settings"

    constructor(private http: HttpClient) { }

    getSettings() {

        return this.http.get<any>(
            this.api
        )

    }

    saveSettings(data: any) {

        return this.http.post(
            this.api,
            data
        )

    }

    getUsers() {

        return this.http.get<any[]>(
            this.api + "/users"
        )

    }

    addUser(data: any) {

        return this.http.post(
            this.api + "/users",
            data
        )

    }

    updateUser(id: number, data: any) {

        return this.http.put(
            this.api + "/users/" + id,
            data
        )

    }

    deleteUser(id: number) {

        return this.http.delete(
            this.api + "/users/" + id
        )

    }

}