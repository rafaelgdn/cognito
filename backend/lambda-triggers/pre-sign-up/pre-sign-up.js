"use strict";

exports.handler = async (event) => {
    console.log('RECEIVED event: ', JSON.stringify(event, null, 2));

    event.response.autoConfirmUser = true;

    if (event.request.userAttributes.email) {
        event.response.autoVerifyEmail = true;
    }

    if (event.request.userAttributes.phone_number) {
        event.response.autoVerifyPhone = true;
    }

    console.log('RETURNED event: ', JSON.stringify(event, null, 2));
    return event;
};
