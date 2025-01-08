# calendarization-trigger-app
Jira app that assignes tasks to team members according to their time-zones. More info in [article](https://www.researchgate.net/publication/387534820_PROJECT_SCHEDULING_IN_A_DISTRIBUTED_ENVIRONMENT_CONSIDERING_EMPLOYEES'_WORKING_HOURS) published by Oleksandr Bogolii.

## How to use
- Register test Jira account with 2 users in different time zones.
- Create a project with tasks (indicate depdendencies between tasks using `blocked by`)
- Configure `calendatization-trigger-app` (instructions bellow)
- Start the Sprint, tasks should be assigned to people

## Testing 
- Example board is created [here](https://bogoliy.atlassian.net/jira/software/projects/CS/boards/1).

## Configuration
- See links instructions to enable automation on JIRA side

## Run app
- `forge deploy`
- `forge install --upgrade`
- `forge tunnel`
- Go in Jira, start new sprint


## Usefull links 
- [Forge-ing Simple Solutions: Combining Automation for Jira with Forge](https://community.atlassian.com/t5/Automation-articles/Forge-ing-Simple-Solutions-Combining-Automation-for-Jira-with/ba-p/2508615)
- [Prepare to build your first Forge app](https://developer.atlassian.com/platform/forge/getting-started/)
