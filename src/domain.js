export class TeamMember {
    workHours = []; // UTC
    localHour = []; // UTC
    static HOURS_IN_DAY = 24;
    static DAYS_IN_TWO_SPRINTS = 20;
    static START_HOUR = 9;

    constructor(accountId, timeZone) {
        this.accountId = accountId;
        this.timeZone = timeZone;
        this.initWorkHours();
    }

    initWorkHours() {
        console.log(`AccountId: ${this.accountId}, TimeZone: ${this.timeZone}`);
        // Initialize work hours for two sprints (20 days)
        let options = {
            timeZone: this.timeZone,
            hour: '2-digit',
            hour12: false
        };
        let formatter = new Intl.DateTimeFormat([], options);
        let currentTime = new Date();
        for (let day = 0; day < TeamMember.DAYS_IN_TWO_SPRINTS; day++) {
            currentTime.setUTCDate(currentTime.getUTCDate() + day);
            for (let hourOfDayUTC = 0; hourOfDayUTC < TeamMember.HOURS_IN_DAY; hourOfDayUTC++) {
                currentTime.setUTCHours(hourOfDayUTC, 0, 0, 0);
                let hourInTimeZone = formatter.format(currentTime);
                console.log(`AccountId: ${this.accountId}, TimeZone: ${this.timeZone}, UTC: ${currentTime.toUTCString()}, Local: ${hourInTimeZone}`);
                // Check if the hour is in the range of 9-13 or 14-18
                this.workHours[day * TeamMember.HOURS_IN_DAY + hourOfDayUTC] =
                    hourInTimeZone >= TeamMember.START_HOUR &&
                    hourInTimeZone < (TeamMember.START_HOUR + 4) ||
                    hourInTimeZone >= (TeamMember.START_HOUR + 5) &&
                    hourInTimeZone < (TeamMember.START_HOUR + 9);
                this.localHour[day * TeamMember.HOURS_IN_DAY + hourOfDayUTC] = hourInTimeZone;
            }
        }
    }


    whenCanStartTask(currentTime) {
        for (let hour = currentTime; hour < TeamMember.DAYS_IN_TWO_SPRINTS * TeamMember.HOURS_IN_DAY; hour++) {
            if (this.workHours[hour]) {
                return hour;
            }
        }
        return -1;
    }

    whenCanFinishTask(currentTime, taskEstimateHours) {
        let finishTime = currentTime;
        let remainingHours = taskEstimateHours;
        while (remainingHours > 0) {
            if (this.workHours[finishTime++]) {
                remainingHours--;
            }
        }
        return finishTime;
    }
}

export class Task {
    constructor(id, estimatedHours) {
        this.id = id;
        this.estimatedHours = estimatedHours;
    }
}

export class Team {
    constructor(teamMembers) {
        this.teamMembers = teamMembers;
    }
}

export class TaskSet {
    constructor(tasks, blockedByMap) {
        this.tasks = tasks;
        this.blockedByMap = blockedByMap;
    }

    blockedBy(taskId) {
        const blockedBy = this.blockedByMap[taskId];
        return blockedBy ? blockedBy : [];
    }
}

export class Assignment {
    constructor(teamMember, task, startTime, finishTime) {
        this.teamMember = teamMember;
        this.task = task;
        this.startTime = startTime;
        this.finishTime = finishTime;
    }
}

export class Schedule {
    assignments = [];

    finishedTasksAt(time) {
        return this.assignments
            .filter(assignment => assignment.finishTime <= time)
            .map(assignment => assignment.task);
    }

    assignmentsAt(time) {
        return this.assignments
            .filter(assignment => assignment.startTime <= time)
            .filter(assignment => assignment.finishTime > time);
    }

    assignedTasksAt(time) {
        return this.assignmentsAt(time).map(assignment => assignment.task);
    }

    assignedTeamMembersAt(time) {
        return this.assignmentsAt(time).map(assignment => assignment.teamMember);
    }

    assign(teamMember, task, startTime, finishTime) {
        this.assignments.push(new Assignment(teamMember, task, startTime, finishTime));
    }
}
