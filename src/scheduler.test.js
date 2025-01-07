import Scheduler from "./scheduler";
import { Task, TeamMember, Team, TaskSet } from "./domain";


describe("Scheduler", () => {
    test("test scheduler", () => {
        let scheduler = new Scheduler();
        let task1 = new Task(1, 4);
        let task2 = new Task(2, 4);
        let task3 = new Task(3, 4);
        let blockedByMap = {};
        blockedByMap[3] = [1, 2];

        let taskSet = new TaskSet([task1, task2, task3], blockedByMap);

        let teamMember1 = new TeamMember(1, 'Europe/Kyiv');
        let teamMember2 = new TeamMember(2, 'America/Los_Angeles');
        let team = new Team([teamMember1, teamMember2])
        let schedule = scheduler.simulate(taskSet, team);

        let scheduleAsString = 'Schedule: ' + schedule.assignments
            .map(assignment => ` ${assignment.task} assigned to ${assignment.teamMember} from ${assignment.startTime} until ${assignment.finishTime}`)
            .join('\n');


        expect(scheduleAsString).toBe('');
    });
});
