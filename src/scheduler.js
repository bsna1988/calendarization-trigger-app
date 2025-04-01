import { Schedule } from "./domain";

export default class Scheduler {
    simulate(taskSet, team) {
        let timeOffsetUTC = 0;
        const schedule = new Schedule();

        while (!includesAll(schedule.finishedTasksAt(timeOffsetUTC), taskSet.tasks)) {
            const nextTask = this.nextAvailableTask(taskSet, schedule, timeOffsetUTC);
            console.log(`Next task: ${nextTask ? nextTask.id : 'none'} at time ${timeOffsetUTC}`);
            if (nextTask) {
                let assignedTeamMebers = schedule.assignedTeamMembersAt(timeOffsetUTC);
                console.log(`Assigned team members: ${assignedTeamMebers.map(tm => tm.id)}`);
                // Filter out team members who are already assigned to a task
                let notAssignedTeamMembers = team.teamMembers
                    .filter(teamMember =>
                        !assignedTeamMebers.includes(teamMember))
                    .filter(teamMember => teamMember.whenCanStartTask(timeOffsetUTC) === timeOffsetUTC)
                    .sort((tm1, tm2) =>
                        tm1.whenCanFinishTask(timeOffsetUTC, nextTask.estimatedHours) -
                        tm2.whenCanFinishTask(timeOffsetUTC, nextTask.estimatedHours));
                console.log(`Not assigned team members: ${notAssignedTeamMembers.map(tm => tm.id)}`);
                console.log(`Assigned team members: ${assignedTeamMebers.map(tm => tm.id)}`);
                if (notAssignedTeamMembers.length > 0) {
                    let assignee = notAssignedTeamMembers[0];
                    schedule.assign(assignee, nextTask,
                        assignee.whenCanStartTask(timeOffsetUTC),
                        assignee.whenCanFinishTask(timeOffsetUTC, nextTask.estimatedHours));
                    console.log(`Assigned task ${nextTask.id} to ${assignee.accountId} at time ${timeOffsetUTC}, local time ${assignee.localHour[timeOffsetUTC]}`);
                } else {
                    timeOffsetUTC++;
                }
            } else {
                timeOffsetUTC++;
            }
        }
        return schedule;
    }

    nextAvailableTask(taskSet, schedule, time) {
        const assignedTasks = schedule.assignedTasksAt(time);
        const finishedTasksIds = schedule.finishedTasksAt(time).map(task => task.id);
        const availableTasks = taskSet.tasks
            .filter(task => !finishedTasksIds.includes(task.id))
            .filter(task => !assignedTasks.includes(task))
            .filter(task => {
                const blockedByIds = taskSet.blockedBy(task.id);
                return includesAll(finishedTasksIds, blockedByIds);
            });
        return availableTasks.length > 0 ? availableTasks[0] : null;
    }
}

const includesAll = (array1, array2) =>
    array2.every((element) => array1.includes(element));
