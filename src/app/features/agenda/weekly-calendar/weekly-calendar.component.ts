import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HostListener } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';

@Component({
    selector: 'app-weekly-calendar',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './weekly-calendar.component.html',
    styleUrls: ['./weekly-calendar.component.scss']
})
export class WeeklyCalendarComponent implements OnInit, OnChanges {

    @Input() sessions: any[] = [];
    @Input() selectedDate!: Date;
    @Output() sessionClick = new EventEmitter<string>();
    @Output() editSessionClick = new EventEmitter<any>();
    @Output() completeSessionClick = new EventEmitter<any>();
    @Output() paySessionClick = new EventEmitter<any>();
    @Output() deleteSessionClick = new EventEmitter<any>();

    @HostListener('document:click', ['$event'])
    closeMenus(event: MouseEvent) {

        const target = event.target as HTMLElement;

        if (target.closest('.menu-btn')) return;
        if (target.closest('.menu-dropdown')) return;

        this.sessions.forEach(s => s.showMenu = false);

    }

    editSession(session: any) {
        this.editSessionClick.emit(session);
    }

    constructor(private cd: ChangeDetectorRef) { }

    hours: string[] = [];
    days: Date[] = [];
    sessionMap = new Map<string, any[]>();
    currentTime = '';
    currentTimePosition = 0;

    ngAfterViewInit() {
        this.updateCurrentTime();
        setInterval(() => this.updateCurrentTime(), 60000);
    }

    updateCurrentTime() {

        const now = new Date();

        this.currentTime =
            now.getHours().toString().padStart(2, '0') +
            ':' +
            now.getMinutes().toString().padStart(2, '0');

        const startHour = 8;

        const minutes =
            (now.getHours() - startHour) * 60 + now.getMinutes();

        const pixelsPerMinute = 2;

        this.currentTimePosition = minutes * pixelsPerMinute;

    }

    deleteSession(session: any) {
        this.deleteSessionClick.emit(session);
    }

    dropSession(event: any, day: Date, hour: string) {

        const session = event.item.data;

        const date =
            day.getFullYear() +
            '-' +
            (day.getMonth() + 1).toString().padStart(2, '0') +
            '-' +
            day.getDate().toString().padStart(2, '0');

        session.sessionDate = date;
        session.sessionTime = hour;

        this.buildSessionMap();

    }

    isTodayView() {

        const today = new Date();

        return this.days.some(
            d =>
                d.getDate() === today.getDate() &&
                d.getMonth() === today.getMonth()
        );

    }

    ngOnInit(): void {

        this.generateHours();
        this.generateWeek(this.selectedDate);
    }

    createSession(hour: string) {
        this.sessionClick.emit(hour);
    }

    ngOnChanges(changes: SimpleChanges) {

        if (changes['selectedDate']) {

            this.generateWeek(this.selectedDate);

        }

        if (changes['sessions']) {

            this.buildSessionMap();

        }

        this.cd.detectChanges();

    }

    generateHours() {

        this.hours = [];

        for (let h = 8; h <= 20; h++) {

            const hour = h.toString().padStart(2, '0') + ':00';

            this.hours.push(hour);

        }

    }

    generateWeek(selectedDate: Date) {

        this.days = [];

        const monday = new Date(selectedDate);
        const day = monday.getDay();

        const diff = monday.getDate() - day + (day === 0 ? -6 : 1);
        monday.setDate(diff);

        for (let i = 0; i < 7; i++) {

            const d = new Date(monday);
            d.setDate(monday.getDate() + i);

            this.days.push(d);

        }

    }

    getSessionsForCell(day: Date, hour: string) {

        const dateStr =
            day.getFullYear() + '-' +
            (day.getMonth() + 1).toString().padStart(2, '0') + '-' +
            day.getDate().toString().padStart(2, '0');

        const key = `${dateStr}_${hour}`;

        return this.sessionMap.get(key) ?? [];

    }

    buildSessionMap() {

        this.sessionMap = new Map();

        const unique = new Map<string, any>();

        for (const session of this.sessions) {

            if (unique.has(session.id)) continue;

            unique.set(session.id, session);

            const rawTime = session.time || session.sessionTime || '';

            const time = rawTime.substring(0, 5);

            const key = `${session.sessionDate}_${time}`;

            if (!this.sessionMap.has(key)) {
                this.sessionMap.set(key, []);
            }

            this.sessionMap.get(key)!.push(session);
        }

    }

    getBlockHeight(session: any): number {

        const duration = session.durationMinutes || 30;

        const pixelsPerMinute = 1.1;

        return duration * pixelsPerMinute;

    }

    completeSession(session: any) {
        this.completeSessionClick.emit(session);
    }

    paySession(session: any) {
        this.paySessionClick.emit(session);
    }

    onSessionClick(session: any, event: MouseEvent) {

        event.stopPropagation();

        if (session.status === 'COMPLETED') return;

        this.editSessionClick.emit(session);

    }

    toggleMenu(session: any, event: MouseEvent) {

        event.stopPropagation();

        this.sessions.forEach(s => {
            if (s !== session) s.showMenu = false;
        });

        const btn = event.target as HTMLElement;

        const rect = btn.getBoundingClientRect();

        const spaceRight = window.innerWidth - rect.right;
        const spaceLeft = rect.left;

        // ancho aprox del menú
        const menuWidth = 160;

        if (spaceRight < menuWidth && spaceLeft > menuWidth) {

            session.menuDirection = 'left';

        } else {

            session.menuDirection = 'right';

        }

        session.showMenu = !session.showMenu;

    }

    isPastHour(day: Date, hour: string): boolean {

        const now = new Date();

        const cellDate = new Date(day);

        const [h, m] = hour.split(':').map(Number);

        cellDate.setHours(h);
        cellDate.setMinutes(m);
        cellDate.setSeconds(0);

        return cellDate < now;

    }
}