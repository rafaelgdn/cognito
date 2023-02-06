// Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { Component, ChangeDetectionStrategy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { DataService } from '../data.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignInComponent {
  username: any;

  public contact = new FormControl('');

  private busy_ = new BehaviorSubject(false);
  public busy = this.busy_.asObservable();

  private errorMessage_ = new BehaviorSubject('');
  public errorMessage = this.errorMessage_.asObservable();

  constructor(
    private router: Router, 
    private http: HttpClient, 
    private dataService: DataService
  ) { }

  public async signIn() {
    this.busy_.next(true);
    this.errorMessage_.next('');
    try {
      this.dataService.changeData(this.username);

      const cognitoUser = await this.http.post<any>(
        `${environment.backendUrl}/signin`, 
      { 
        username: this.username,
        canSignUp: false
      }).toPromise();

      this.dataService.changeCognitoUser(cognitoUser);

      if (cognitoUser.needsSignUp) {
        const isEmail = this.contact.value.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/);

        if (isEmail) {
          this.router.navigate(['/sign-up-phone']);
        } else {
          this.router.navigate(['/sign-up-email']);
        }

        return;
      }

      
      this.router.navigate(['/enter-secret-code']);
    } catch (err) {
      console.log({ err });
      throw err;      
    } finally {
      this.busy_.next(false);
    }
  }
}
