// Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Auth } from 'aws-amplify';
import * as AWS from 'aws-sdk'; 
import { environment } from '../environments/environment';
import { DataService } from './data.service';

const cognito = new AWS.CognitoIdentityServiceProvider({
  region: environment.region,
});


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  authenticationResult: any;

  // Get access to window object in the Angular way
  private window: Window;
  constructor(@Inject(DOCUMENT) private document: Document) {
    this.window = this.document.defaultView;
  }

  public async signOut() {
    await Auth.signOut();
  }

  public async answerCustomChallenge(session: any, answer: string, username: any) {
    const params = {
      ClientId: environment.userPoolWebClientId,
      ChallengeName: "CUSTOM_CHALLENGE",
      ChallengeResponses: {
        'USERNAME': username,
        'ANSWER': answer,
      },
      Session: session,
    };

    const cognitoAnswer = await cognito.respondToAuthChallenge(params).promise();

    if (cognitoAnswer.Session) {
      const dataService = new DataService();
      dataService.changeCognitoUser(cognitoAnswer);
    }

    this.authenticationResult = cognitoAnswer.AuthenticationResult;

    return {
      loginSucceeded: !!this.authenticationResult,
      cognitoAnswer,
    }
  }

  public async isAuthenticated() {
    if (this.authenticationResult) return true;
    return false;
  }

  public async removeAuthentication() {
    this.authenticationResult = null;
  }

  public async getUserDetails(username: any) {
    const params = {
      UserPoolId: environment.userPoolId,
      Username: username
    };

    const { UserAttributes } = await cognito.adminGetUser(params).promise();
    return UserAttributes;
  }

}
