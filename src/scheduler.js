import { TaskSet, Team, Schedule, Assignment } from "./domain";

export default class Scheduler {
    simulate(taskSet, team) {
        let timeOffsetUTC = 0;
        const schedule = new Schedule();

        console.log("Scheduling " + taskSet.tasks);
        while (!includesAll(schedule.finishedTasksAt(timeOffsetUTC), taskSet.tasks)) {
            const nextTask = this.nextAvailableTask(taskSet, schedule, timeOffsetUTC);
            console.log(`Next task ${nextTask} at ${timeOffsetUTC}`)
            if (nextTask) {
                let assignedTeamMebers = schedule.assignedTeamMembersAt(timeOffsetUTC);
                console.log(`Assigned TeamMembers: ${assignedTeamMebers}`)
                let notAssginedTeamMembers = team.teamMembers
                    .filter(teamMember => !assignedTeamMebers.includes(teamMember))
                    .filter(teamMember => teamMember.whenCanStartTask(timeOffsetUTC) == timeOffsetUTC)
                    .sort((tm1, tm2) => tm1.whenCanFinishTask(timeOffsetUTC, nextTask.estimatedHours)
                        - tm2.whenCanFinishTask(timeOffsetUTC, nextTask.estimatedHours));
                console.log(`Not Assgined TeamMembers: ${notAssginedTeamMembers}`)
                if (notAssginedTeamMembers.length > 0) {
                    let assignee = notAssginedTeamMembers[0];
                    console.log(`assignee ${assignee}`)
                    schedule.assign(assignee, nextTask, assignee.whenCanStartTask(timeOffsetUTC),
                        assignee.whenCanFinishTask(timeOffsetUTC, nextTask.estimatedHours));
                } else {
                    timeOffsetUTC++;
                }
            } else {
                timeOffsetUTC++;ç
            }
        }

        return schedule;
    }

    nextAvailableTask(taskSet, schedule, time) {
        const assignedTasks = schedule.assignedTasksAt(time);
        console.log(`Assigned Tasks ${assignedTasks}`);
        const finishedTasksIds = schedule.finishedTasksAt(time).map(task => task.id);
        console.log(`Finsihed Tasks ${finishedTasksIds}`);
        const availableTasks = taskSet.tasks.filter(task => !assignedTasks.includes(task))
            .filter(task => {
                const blockedByIds = taskSet.blockedBy(task.id);
                console.log(`Checking Task ${task} Blocked By ${blockedByIds}`);
                return includesAll(finishedTasksIds, blockedByIds);
            });
        console.log(`Alailable Task: ${availableTasks}`);
        return availableTasks.length > 0 ? availableTasks[0] : null;
    }
}


const includesAll = (array1, array2) =>
    array2.every((element) => array1.includes(element));