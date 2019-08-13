const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

dotenv.config();
// you'll need to set the GitHub details because that's how CircleCI uniquely defines a project
// also, the circle ci token: https://circleci.com/docs/2.0/managing-api-tokens/
const { GITHUB_USERNAME, GITHUB_PROJECT, CIRCLE_CI_TOKEN } = process.env;

// variables that shouldn't be synced
const FILTERED_VARIABLES = [
  'CIRCLE_CI_TOKEN',
  'GITHUB_USERNAME',
  'GITHUB_PROJECT',
];

const updateSingleToken = async (name, value) => {
  console.log(
    'Updated this pair: ' +
      JSON.stringify(
        await fetch(
          `https://circleci.com/api/v1.1/project/github/${GITHUB_USERNAME}/${GITHUB_PROJECT}/envvar?circle-token=${CIRCLE_CI_TOKEN}`,
          {
            method: 'post',
            body: JSON.stringify({ name, value }),
            headers: { 'Content-Type': 'application/json' },
          },
        ).then(res => res.json()),
      ),
  );
};

const syncAllVariables = async () => {
  const envPath = path.resolve(__dirname, '../.env');
  const envVars = dotenv.parse(fs.readFileSync(envPath));

  // converts to an array of name-value pairs that we can send to circleci
  const filteredPairs = Object.entries(
    Object.keys(envVars)
      .filter(key => !FILTERED_VARIABLES.includes(key))
      .reduce((obj, key) => {
        obj[key] = envVars[key];
        return obj;
      }, {}),
  ).map(arr => {
    return { name: arr[0], value: arr[1] };
  });

  for (let i = 0; i < filteredPairs.length; i++)
    await updateSingleToken(filteredPairs[i].name, filteredPairs[i].value);
};

syncAllVariables();
