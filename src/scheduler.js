import { TaskSet, Team, Schedule } from "./domain";

export default class Scheduler {
    simulate(taskSet, team) {
        let timeOffsetUTC;
        const schedule = new Schedule();
        while (!includesAll(schedule.finishedTasksAt(timeOffsetUTC), taskSet.tasks)) {
            const nextTask = this.nextAvailableTask(taskSet, schedule, timeOffsetUTC);
            if (nextTask) {
                console.log(`Next task ${nextTask.id}`)

            } else {
                timeOffsetUTC++;
            }
            break;
        }

        return schedule;
    }

    nextAvailableTask(taskSet, schedule, time) {
        const assignedTasks = schedule.assignedTasksAt(time);
        console.log(`Assigned Tasks ${assignedTasks}`);
        const finishedTasksIds = schedule.finishedTasksAt(time).map(task => task.id);
        console.log(`Finsihed Tasks ${assignedTasks}`);
        const availableTasks = taskSet.tasks.filter(task => !assignedTasks.includes(task))
            .filter(task => {
                const blockedByIds = taskSet.blockedBy(task.id);
                console.log(`Checking Task ${task.id} Blocked By ${blockedByIds}`);
                return includesAll(finishedTasksIds, blockedByIds);
            });
        return availableTasks.length > 0 ? availableTasks[0] : null;
    }
}


const includesAll = (array1, array2) =>
    array2.every((element) => array1.includes(element));