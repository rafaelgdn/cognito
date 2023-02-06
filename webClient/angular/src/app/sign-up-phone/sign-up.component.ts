// Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { DataService } from '../data.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-sign-up-phone',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignUpPhoneComponent implements OnInit {
  email: any
  sms = new FormControl('');

  private busy_ = new BehaviorSubject(false);
  public busy = this.busy_.asObservable();

  private errorMessage_ = new BehaviorSubject('');
  public errorMessage = this.errorMessage_.asObservable();

  constructor(
    private router: Router,     
    private http: HttpClient, 
    private dataService: DataService
  ) { }

  ngOnInit() {
    this.dataService.currentData.subscribe(data => this.email = data);
  }

  public async signup() {
    this.errorMessage_.next('');
    this.busy_.next(true);
    try {
      const cognitoUser = await this.http.post<any>(
        `${environment.backendUrl}/signin`, 
      {
        email: this.email,
        phoneNumber: this.sms.value,
        username: this.email,
        canSignUp: true
      }).toPromise();


      this.dataService.changeCognitoUser(cognitoUser);
      this.router.navigate(['/enter-secret-code']);
    } catch (err) {
      console.log(err);
      this.errorMessage_.next(err.message || err);
    } finally {
      this.busy_.next(false);
    }
  }
}
