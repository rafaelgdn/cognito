// Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, AfterViewInit, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { DataService } from '../data.service';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-sign-out',
  templateUrl: './sign-out.component.html',
  styleUrls: ['./sign-out.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignOutComponent implements AfterViewInit, OnInit {
  cognitoUser: any
  username: any

  

  constructor(
    private dataService: DataService, 
    private router: Router,
    private http: HttpClient,
    private auth: AuthService
  ) { }

  ngOnInit() {
    this.dataService.currentData.subscribe(data => this.username = data);
    this.dataService.currentCognitoUser.subscribe(data => this.cognitoUser = data);
    console.log({ cognitoUser: this.cognitoUser })
    console.log({ token: this.cognitoUser.AuthenticationResult.AccessToken })
    console.log({ username: this.username })
  }

  async ngAfterViewInit() {
    await this.http.post(
      `${environment.backendUrl}/signout`,
      { 
        username: this.username 
      },
    ).toPromise()

    await this.auth.removeAuthentication();
    this.router.navigate(['/sign-in']);
  }

}
