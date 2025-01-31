export class TimeSpan {
    static readonly MillisecondsPerSecond = 1000;
    static readonly MillisecondsPerMinute = 60_000;
    static readonly MillisecondsPerHour = 3_600_000;
    static readonly MillisecondsPerDay = 86_400_000;

    static readonly SecondsPerMinute = 60;
    static readonly SecondsPerHour = 3600;
    static readonly SecondsPerDay = 86_400;

    static readonly MinutesPerHour = 60;
    static readonly MinutesPerDay = 1440;
    
    static readonly HoursPerDay = 24;

    #ms: number;

    constructor(ms: number) {
        this.#ms = ms;
    }

    static readonly Zero = new TimeSpan(0);

    static fromMilliseconds(ms: number) {
        return new TimeSpan(ms);
    }

    static fromSeconds(s: number) { 
        return new TimeSpan(s * TimeSpan.MillisecondsPerSecond);
    }

    static fromMinutes(m: number) {
        return new TimeSpan(m * TimeSpan.MillisecondsPerMinute);
    }

    static fromHour(h: number) {
        return new TimeSpan(h * TimeSpan.MillisecondsPerHour);
    }

    static fromDay(d: number) {
        return new TimeSpan(d * TimeSpan.MillisecondsPerDay);
    }

    add(span: TimeSpan) {
        return new TimeSpan(this.#ms + span.#ms);
    }

    minus(span: TimeSpan) {
        return new TimeSpan(this.#ms - span.#ms);
    }

    after(date: Date | number) {
        if (typeof date !== "number")
            date = date.getTime();
        return new Date(date + this.#ms);
    }

    afterNow() {
        return this.after(new Date());
    }

    before(date: Date | number) {
        if (typeof date !== "number")
            date = date.getTime();
        return new Date(date - this.#ms);
    }

    beforeNow() {
        return this.before(new Date());
    }

    toString() {
        let str = `${this.hours.toString().padStart(2, "0")}:${this.minutes.toString().padStart(2, "0")}:${this.seconds.toString().padStart(2, "0")}`;
        if (this.#ms >= TimeSpan.MillisecondsPerDay)
            str = this.days.toString().padStart(2, "0") + '.' + str;
        const ms = this.milliseconds;
        if (ms !== 0)
            str += '.' + `${ms.toString().padStart(3, "0")}`;
        return str;
    }

    get time() { return this.#ms; }
    get totalMilliseconds() { return this.#ms; }
    get totalSeconds() { return this.#ms / TimeSpan.MillisecondsPerSecond; }
    get totalMinutes() { return this.#ms / TimeSpan.MillisecondsPerMinute; }
    get totalHours() { return this.#ms / TimeSpan.MillisecondsPerHour; }
    get totalDays() { return this.#ms / TimeSpan.MillisecondsPerDay; }
    get milliseconds() { return Math.trunc(this.#ms % TimeSpan.MillisecondsPerSecond); }
    get seconds() { return Math.trunc(this.#ms / TimeSpan.MillisecondsPerSecond % TimeSpan.SecondsPerMinute); }
    get minutes() { return Math.trunc(this.#ms / TimeSpan.MillisecondsPerMinute % TimeSpan.MinutesPerHour); }
    get hours() { return Math.trunc(this.#ms / TimeSpan.MillisecondsPerHour % TimeSpan.HoursPerDay); }
    get days() { return Math.trunc(this.#ms % TimeSpan.MillisecondsPerDay); }
}