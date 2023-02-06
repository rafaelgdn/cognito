const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');           

const cognito = new AWS.CognitoIdentityServiceProvider();

const { USER_POOL_CLIENT_ID, USER_POOL_ID } = process.env;

const respondToAuthChallenge = async ({ session, username, isEmail }) => {
  const params = {
    ClientId: USER_POOL_CLIENT_ID,
    ChallengeName: "CUSTOM_CHALLENGE",
    ChallengeResponses: {
      'USERNAME': username,
      'ANSWER': 'anyAnswer',
    },
    Session: session,
    ClientMetadata: {
      method: isEmail ? "email" : "phone_number",
    }
  };
  return  cognito.respondToAuthChallenge(params).promise()
}

const initiateAuth = async ({ username, isEmail }) => {
  const params = {
    AuthFlow: "CUSTOM_AUTH",
    ClientId: USER_POOL_CLIENT_ID,
    AuthParameters: {
      "USERNAME": username,
    },
  };
    const data = await cognito.initiateAuth(params).promise();
    return respondToAuthChallenge({ session: data.Session, username, isEmail });
}

const createUser = async ({ email, phoneNumber }) => {
  try {
    const params = {
      UserPoolId: USER_POOL_ID,
      Username: uuidv4(),
      TemporaryPassword: uuidv4(),
      MessageAction: 'SUPPRESS',
      UserAttributes: [
        { Name: 'email', Value: email },
        { Name: 'email_verified', Value: 'true' },
        { Name: 'phone_number', Value: phoneNumber },
        { Name: 'phone_number_verified', Value: 'true' }
      ],
      ForceAliasCreation: true
    };
  
    await cognito.adminCreateUser(params).promise();
  } catch(error) {
    console.log('createUser error', error);
    throw error;
  }
}

exports.handler = async (event) => {
  console.log('RECEIVED event: ', JSON.stringify(event, null, 2));

  const { username, canSignUp, email, phoneNumber } = typeof event.body === 'string'
    ? JSON.parse(event.body)
    : event.body

  let body;

  try {
    const isEmail = username.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/);

    try {
      body = await initiateAuth({ username, isEmail });
    } catch (error) {
      if (!canSignUp) {
        return {
          statusCode: 200,
          body: JSON.stringify({ needsSignUp: true }),
          headers: {
            "Access-Control-Allow-Headers" : "*",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*"
          },
        }
      };


      await createUser({ email, phoneNumber });
      body = await initiateAuth({ username, isEmail: false });      
    }

    return {
      statusCode: 200,
      body: JSON.stringify(body),
      headers: {
        "Access-Control-Allow-Headers" : "*",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "*"
      },
    }
  } catch (error) {
    console.log('An error happened', { error });

    return {
      statusCode: 500,
      body: JSON.stringify(body),
      headers: {
        "Access-Control-Allow-Headers" : "*",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "*"
      },
    }
  }
  
};