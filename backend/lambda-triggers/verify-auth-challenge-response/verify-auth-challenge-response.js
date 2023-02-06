exports.handler = async (event) => {
    console.log('RECEIVED event: ', JSON.stringify(event, null, 2));
    const { request } = event;
    const { privateChallengeParameters, challengeAnswer } = request;
    const code = privateChallengeParameters.code;
    event.response.answerCorrect = code === "" || code === challengeAnswer;
    console.log('RETURNED event: ', JSON.stringify(event, null, 2));
    return event;
};