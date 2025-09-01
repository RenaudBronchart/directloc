// src/app/pipes/pipe.ts
import { ChangeDetectorRef, Inject, LOCALE_ID, OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { interval, Subscription } from 'rxjs';

@Pipe({ name: 'ago', standalone: true, pure: false })
export class AgoPipe implements PipeTransform, OnDestroy {
  private rtf: Intl.RelativeTimeFormat;
  private sub: Subscription;

  constructor(@Inject(LOCALE_ID) private locale: string, private cdr: ChangeDetectorRef) {
    this.rtf = new Intl.RelativeTimeFormat(this.locale || 'en-US', { numeric: 'auto' });
    // auto-refresh every minute so “2 minutes ago” updates
    this.sub = interval(60_000).subscribe(() => this.cdr.markForCheck());
  }

  transform(value: Date | string | number): string {
    const d = new Date(value);
    const diffSec = Math.round((Date.now() - d.getTime()) / 1000);

    const div = (n: number) => Math.floor(diffSec / n);
    if (diffSec < 45) return this.rtf.format(-diffSec, 'second');
    const m = div(60);
    if (m < 45) return this.rtf.format(-m, 'minute');
    const h = div(3600);
    if (h < 22) return this.rtf.format(-h, 'hour');
    const dys = div(86400);
    if (dys < 26) return this.rtf.format(-dys, 'day');
    const mo = div(2629800); // ~30.44d
    if (mo < 11) return this.rtf.format(-mo, 'month');
    const y = div(31557600); // ~365.25d
    return this.rtf.format(-y, 'year');
  }

  ngOnDestroy() { this.sub?.unsubscribe(); }
}
