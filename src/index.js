// Necessary import for calling Jira REST APIs
import api, { route } from "@forge/api";

const buildOutput = () => ({
  headers: {
    'Content-Type': ['application/json']
  },
  statusCode: 204,
  statusText: 'No Content'
});
const getRandomObject = (arr) => {
  // Generate a random index
  const randomIndex = Math.floor(Math.random() * arr.length);
  // Return the object at the random index
  return arr[randomIndex];
}


const assignIssueToUser = async (issueIdOrKey, userId) => {
  var bodyData = `{
    "accountId": "${userId}"
  }`;

  const response = await api.asApp().requestJira(route`/rest/api/2/issue/${issueIdOrKey}/assignee`, {
    method: 'PUT',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: bodyData
  });

  console.log(`Response: ${response.status} ${response.statusText}`);
}

export const run = async (req) => {
  // This is the request from A4J
  console.log(req);

  // Parses the request body from A4J as it is a string when we got it
  const parsedBody = JSON.parse(req.body);

  // Gets the Authorization header
  // Yes, the header keys are received in lower case
  const authToken = req.headers['authorization'];

  // If you decided to add Authorization header in the A4J request
  // This is a basic handling of that token
  if (authToken != 'Bearer my-token') {
    console.log('Invalid token');
    return {
      statusCode: 401,
      statusText: 'Unauthorized'
    };
  }

  // console.log('Correct token');

  // Calling the GET sprint API passing a parameter from the A4J action 
  // You can change the API depending on your use case
  const issuesResponsePromise = await api.asApp()
    .requestJira(route`/rest/agile/1.0/sprint/${parsedBody.sprint_id}/issue`);
  const issuesResponse = await issuesResponsePromise.json();
  console.log(issuesResponse);

  const usersResponsePromise = await api.asApp().requestJira(route`/rest/api/2/users/search`);
  const allUsers = await usersResponsePromise.json();
  const activeUsers = allUsers.filter(user => user.active)
    .filter(user => user.accountType === 'atlassian');
  console.log(activeUsers);

  issuesResponse.issues.forEach(issue => {
    assignIssueToUser(issue.key, getRandomObject(activeUsers).accountId);
  });

  const result = buildOutput();
  return result;
};