export class TeamMember {
    workHours = []; // UTC
    static DAYS_IN_TWO_SPRINTS = 20;
    static START_HOUR = 9;

    constructor(accountId, timeZone) {
        this.accountId = accountId;
        this.timeZone = timeZone;
        this.initWorkHours();
    }

    initWorkHours() {
        let options = {
            timeZone: this.timeZone,
            hour: '2-digit',
            hour12: false
        };
        let formatter = new Intl.DateTimeFormat([], options);
        for (let day = 0; day < TeamMember.DAYS_IN_TWO_SPRINTS; day++) {
            let currentTime = new Date();
            currentTime.setUTCHours(0, 0, 0, 0);
            currentTime.setUTCMilliseconds(currentTime.getUTCMilliseconds() + day * 24 * 60 * 60 * 1000);
            //console.log(`Day: ${currentTime}`);
            for (let hourOfDayUTC = 0; hourOfDayUTC < 24; hourOfDayUTC++) {
                currentTime.setUTCHours(hourOfDayUTC, 0, 0, 0);
                let hourInTimeZone = formatter.format(currentTime);
                this.workHours[hourOfDayUTC] = hourInTimeZone >= TeamMember.START_HOUR && hourInTimeZone < (TeamMember.START_HOUR + 4) ||
                    hourInTimeZone >= (TeamMember.START_HOUR + 5) && hourInTimeZone < (TeamMember.START_HOUR + 9);
                //console.log(`User: ${accountId} in ${timeZone} timeZone. 
                //    At UTC hour ${hourOfDayUTC}, local hour ${hourInTimeZone}, working=${this.#workHours[hourOfDayUTC]}`);
            }
        }
    }
}

export class Task {
    constructor(id, estimatedHours) {
        this.id = id;
        this.estimatedHours = estimatedHours;
    }
}