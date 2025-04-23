import { TimeSpan } from "./TimeSpan";

/**
 * A slightly better date time class then date, supports only UTC
 */
export class DateTimeUtc {

    private timestamp: number;

    constructor(epochTime?: number){
        this.timestamp = epochTime ?? Date.now();
    }

    static get now() {
        return new DateTimeUtc();
    }

    toUnixSeconds() {
        return Math.floor(this.timestamp / 1000);
    }

    toUnixMilliseconds() {
        return this.timestamp;
    }

    toJsDate() {
        return new Date(this.timestamp);
    }

    addSeconds(seconds: number) {
        return new DateTimeUtc(this.timestamp + seconds * TimeSpan.MillisecondsPerSecond);
    }

    addMilliseconds(milliseconds: number) {
        return new DateTimeUtc(this.timestamp + milliseconds);
    }

    addMinutes(minutes: number) {
        return new DateTimeUtc(this.timestamp + minutes * TimeSpan.MillisecondsPerMinute);
    }

    addHours(hours: number) {
        return new DateTimeUtc(this.timestamp + hours * TimeSpan.MillisecondsPerHour);
    }

    addDays(hours: number) {
        return new DateTimeUtc(this.timestamp + hours * TimeSpan.MillisecondsPerDay);
    }

    addMonths(months: number) {
        const date = new Date(this.timestamp);
        return new DateTimeUtc(date.setUTCMonth(date.getUTCMonth() + months));
    }

    addYears(years: number) {
        const date = new Date(this.timestamp);
        return new DateTimeUtc(date.setUTCFullYear(date.getUTCFullYear() + years));
    }

    add(timespan: TimeSpan) {
        return new DateTimeUtc(this.timestamp + timespan.totalMilliseconds);
    }

    static from(year: number, month: number, day: number, hour?: number, minute?: number, seconds?: number, milliseconds?: number) {
        return new DateTimeUtc(new Date(year, month - 1, day, hour, minute, seconds, milliseconds).getTime());
    }

    static fromUnixSeconds(second: number) {
        return new DateTimeUtc(second * TimeSpan.MillisecondsPerSecond);
    }
    
    static fromUnixMilliseconds(ms: number) {
        return new DateTimeUtc(ms);
    }
}