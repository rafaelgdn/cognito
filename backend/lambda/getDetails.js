const AWS = require('aws-sdk');
const cognito = new AWS.CognitoIdentityServiceProvider();

const { USER_POOL_ID } = process.env;

exports.handler = async (event) => {
  console.log('RECEIVED event: ', JSON.stringify(event, null, 2));

  const { username } = typeof event.body === 'string'
    ? JSON.parse(event.body)
    : event.body

  try {
    const params = {
      UserPoolId: USER_POOL_ID,
      Username: username
    };
  
    const { UserAttributes } = await cognito.adminGetUser(params).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({ userAttributes: UserAttributes }),
      headers: {
        "Access-Control-Allow-Headers" : "*",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "*"
      },
    }
  } catch (error) {
    console.log(error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'An error happened', error }),
      headers: {
        "Access-Control-Allow-Headers" : "*",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "*"
      },
    }
  }
}