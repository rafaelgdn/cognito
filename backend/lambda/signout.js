const AWS = require('aws-sdk');          

const cognito = new AWS.CognitoIdentityServiceProvider();

const { USER_POOL_ID } = process.env;

exports.handler = async (event) => {
  try {
    const { username } = typeof event.body === 'string'
    ? JSON.parse(event.body)
    : event.body

    await cognito.adminUserGlobalSignOut({ 
      UserPoolId: USER_POOL_ID,
      Username: username 
    }).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'sign out successfully' }),
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
