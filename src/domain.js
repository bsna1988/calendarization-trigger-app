﻿export class TeamMember {
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
                this.workHours[day * 24 + hourOfDayUTC] = hourInTimeZone >= TeamMember.START_HOUR && hourInTimeZone < (TeamMember.START_HOUR + 4) ||
                    hourInTimeZone >= (TeamMember.START_HOUR + 5) && hourInTimeZone < (TeamMember.START_HOUR + 9);
                //console.log(`User: ${accountId} in ${timeZone} timeZone. 
                //    At UTC hour ${hourOfDayUTC}, local hour ${hourInTimeZone}, working=${this.#workHours[hourOfDayUTC]}`);
            }
        }
    }


    whenCanStartTask(currentTime) {
        for (let hour = currentTime; hour < TeamMember.DAYS_IN_TWO_SPRINTS * 24; hour++) {
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

    toString() {
        return `TeamMember ${this.accountId}`;
    }
}

export class Task {
    constructor(id, estimatedHours) {
        this.id = id;
        this.estimatedHours = estimatedHours;
    }

    toString() {
        return `Task ${this.id}`;
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