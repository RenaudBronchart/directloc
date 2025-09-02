// src/app/pages/calendar/calendar-month/calendar-month.component.ts
import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

import { CalendarEventModel } from '../../../models/calendar.model';

@Component({
  standalone: true,
  selector: 'app-calendar-month',
  imports: [CommonModule, FullCalendarModule],
  template: `<full-calendar [options]="calendarOptions"></full-calendar>`
})
export class CalendarMonthComponent implements OnChanges {
  @Input() events: CalendarEventModel[] = [];
  @Input() prices: Record<string, string> = {};

  @Output() monthChange = new EventEmitter<{ from: Date; to: Date }>();

  calendarOptions: any = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, interactionPlugin],
    headerToolbar: { left: 'prev,next', center: 'title', right: '' },
    firstDay: 1,
    displayEventTime: false,
    events: [],
    // nos avisa cada vez que el usuario cambia de mes
    datesSet: (arg: any) => {
      // arg.start y arg.end son el rango visible (end exclusivo)
      this.monthChange.emit({ from: arg.start, to: arg.end });
    }
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['events']) {
      this.calendarOptions = {
        ...this.calendarOptions,
        events: this.events.map(e => ({
          title: e.isBooking ? (e.status ?? 'Booking') : 'Blocked',
          // FullCalendar acepta Date o ISO
          start: e.start,
          // end exclusivo → +1 día para que pinte el último día completo
          end: new Date(e.end.getTime() + 86400000),
          color: e.isBooking ? '#60a5fa' : '#f87171'
        }))
      };
    }
  }
}
