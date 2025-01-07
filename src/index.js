// Necessary import for calling Jira REST APIs
import api, { route } from "@forge/api";
import { TeamMember, Task, TaskSet, Team } from "./domain";
import Scheduler from "./scheduler";

const buildOutput = () => ({
  headers: {
    'Content-Type': ['application/json']
  },
  statusCode: 204,
  statusText: 'No Content'
});

const getUser = async (accountId) => {
  const response = await api.asApp().requestJira(route`/rest/api/2/user?accountId=${accountId}`, {
    headers: {
      'Accept': 'application/json'
    }
  });
  const user = await response.json();
  return user;
}

const getIssue = async (issueIdOrKey) => {
  const response = await api.asApp().requestJira(route`/rest/api/2/issue/${issueIdOrKey}`, {
    headers: {
      'Accept': 'application/json'
    }
  });
  const issue = await response.json();
  return issue;
}

export const run = async (req) => {
  // Parses the request body from A4J as it is a string when we got it
  const parsedBody = JSON.parse(req.body);

  // Gets the Authorization header
  const authToken = req.headers['authorization'];

  // Basic handling of that Authorization header 
  if (authToken != 'Bearer my-token') {
    return {
      statusCode: 401,
      statusText: 'Unauthorized'
    };
  }

  // Get Jira issues in sprint
  const issuesResponsePromise = await api.asApp()
    .requestJira(route`/rest/agile/1.0/sprint/${parsedBody.sprint_id}/issue`);
  const issuesResponse = await issuesResponsePromise.json();
  const issues = await Promise.all(issuesResponse.issues
    .map(async (issue) => await getIssue(issue.key)));

   // Get dependencies for each Jira issue 
  const blockedByMap = {};
  issues.forEach(issue => {
    issue.fields.issuelinks
      .filter(issueLink => issueLink.type.inward === 'is blocked by' && issueLink.hasOwnProperty('outwardIssue'))
      .forEach(issueLink => {
        const inwardKey = issue.key;
        const outwardKey = issueLink.outwardIssue.key;
        if (!blockedByMap.hasOwnProperty(outwardKey)) {
          blockedByMap[outwardKey] = [];
        }
        blockedByMap[outwardKey].push(inwardKey);
      })
  });

   // Form list of tasks with depdendencies
  const tasks = issues.map(issue => new Task(issue.key, issue.fields.customfield_10016));
  const taskSet = new TaskSet(tasks, blockedByMap);

   // Get list of Jira users
  const usersResponsePromise = await api.asApp().requestJira(route`/rest/api/2/users/search`);
  const allUsers = await usersResponsePromise.json();
  const activeUsers = await Promise.all(allUsers.filter(user => user.active)
    .filter(user => user.accountType === 'atlassian')
    .map(async (user) => await getUser(user.accountId)));

  // Form a team
  const teamMembers = activeUsers.map(user => new TeamMember(user.accountId, user.timeZone));
  const team = new Team(teamMembers);

  // Schedule tasks for team
  const scheduler = new Scheduler();
  const schedule = scheduler.simulate(taskSet, team);

  // Call Jira API to assign issues to users according to schedule
  schedule.assignments.forEach(assignment => {
    assignIssueToUser(assignment.task.id, assignment.teamMember.accountId);
 });

  return buildOutput();
};