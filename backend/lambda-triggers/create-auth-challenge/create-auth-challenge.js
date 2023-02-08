const crypto_secure_random_digit = require("crypto-secure-random-digit");
const AWS = require("aws-sdk");

const sns = new AWS.SNS();
const ses = new AWS.SES();

async function sendSMSviaSNS(phoneNumber, passCode) {
    const params = { "Message": "Your secret code: " + passCode, "PhoneNumber": phoneNumber };
    await sns.publish(params).promise();
}

async function sendEmail(emailAddress, secretLoginCode) {
    const params = {
        Destination: { ToAddresses: [emailAddress] },
        Message: {
            Body: {
                Html: {
                    Charset: 'UTF-8',
                    Data: ` <html><body><p>This is your secret login code:</p>
                            <h3>${secretLoginCode}</h3></body></html>`
                },
                Text: {
                    Charset: 'UTF-8',
                    Data: `Your secret login code: ${secretLoginCode}`
                }
            },
            Subject: {
                Charset: 'UTF-8',
                Data: 'Your secret login code'
            }
        },
        Source: ''
    };
    await ses.sendEmail(params).promise();
}

async function deliverCode(attr, code) {
    if (attr.type === 'email') await sendEmail(attr.value, code);
    if (attr.type === 'phone_number') await sendSMSviaSNS(attr.value, code);
}

function attributeToVerify(clientMetadata, userAttributes) {
    const type = clientMetadata.method;
    return { type: type, value: userAttributes[type] }
}

async function calculateAndDeliverChallenge(req) {
    const sessionSize = req.session.length;
    if (sessionSize === 0) {
        return { type: "none", code: "" };
    }
    const lastSession = req.session[sessionSize - 1];
    const lastChallenge = JSON.parse(lastSession.challengeMetadata);
    if (!lastSession.challengeResult) {
        return lastChallenge;
    }
    const attr = attributeToVerify(req.clientMetadata, req.userAttributes);
    const code = crypto_secure_random_digit.randomDigits(6).join('');
    await deliverCode(attr, code);
    return { type: attr.type, code: code };
}

exports.handler = async (event) => {
    console.log('RECEIVED event: ', JSON.stringify(event, null, 2));
    const challenge = await calculateAndDeliverChallenge(event.request);
    event.response = {
        privateChallengeParameters: {
            code: challenge.code,
        },
        challengeMetadata: JSON.stringify(challenge),
    };
    console.log('RETURNED event: ', JSON.stringify(event, null, 2));
    return event;   
};

// // Main handler
// exports.handler = async (event = {}) => {
//     console.log('RECEIVED event: ', JSON.stringify(event, null, 2));
    
//     let passCode;
//     var username = event.userName;
//     var phoneNumber = event.request.userAttributes.phone_number;
//     var email = event.request.userAttributes.email;
    
//     console.log('request', event.request);
//     console.log('session 1', event.request.session);

//     // The first CUSTOM_CHALLENGE request for authentication from
//     // iOS AWSMobileClient actually comes in as an "SRP_A" challenge (a bug in the AWS SDK for iOS?)
//     // web (Angular) comes in with an empty event.request.session
//     if (event.request.session && event.request.session.length && event.request.session.slice(-1)[0].challengeName == "SRP_A" || event.request.session.length == 0) {
//         console.log('session 2', event.request.session);
//         passCode = crypto_secure_random_digit.randomDigits(6).join('');        

//         const isPhoneNumber = username.includes('phoneNumber');        

//         if(isPhoneNumber) await sendSMSviaSNS(phoneNumber, passCode);        
//         else await sendEmail(email, passCode);


//     } else {
//         console.log('session 3', event.request.session);
        
//         const previousChallenge = event.request.session.slice(-1)[0];
//         passCode = previousChallenge.challengeMetadata.match(/CODE-(\d*)/)[1];
//     }

//     console.log('session 4', event.request.session);

//     event.response.publicChallengeParameters = { phone: event.request.userAttributes.phone_number };
//     event.response.privateChallengeParameters = { passCode };
//     event.response.challengeMetadata = `CODE-${passCode}`;
    
//     console.log('RETURNED event: ', JSON.stringify(event, null, 2));
    
//     return event;
// };

// // Send secret code over SMS via Amazon Simple Notification Service (SNS)
// async function sendSMSviaSNS(phoneNumber, passCode) {
//     const params = { "Message": "Your secret code: " + passCode, "PhoneNumber": phoneNumber };
//     await sns.publish(params).promise();
// }

// async function sendEmail(emailAddress, secretLoginCode) {
//     const params = {
//         Destination: { ToAddresses: [emailAddress] },
//         Message: {
//             Body: {
//                 Html: {
//                     Charset: 'UTF-8',
//                     Data: ` <html><body><p>This is your secret login code:</p>
//                             <h3>${secretLoginCode}</h3></body></html>`
//                 },
//                 Text: {
//                     Charset: 'UTF-8',
//                     Data: `Your secret login code: ${secretLoginCode}`
//                 }
//             },
//             Subject: {
//                 Charset: 'UTF-8',
//                 Data: 'Your secret login code'
//             }
//         },
//         Source: 'rafaeldecarvalho.ps@gmail.com'
//     };
//     await ses.sendEmail(params).promise();
// }
