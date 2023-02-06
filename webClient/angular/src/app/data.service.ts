import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private dataSource = new BehaviorSubject<any>(null);
  private cognitoUser = new BehaviorSubject<any>(null);
  private token = new BehaviorSubject<any>(null);
  currentData = this.dataSource.asObservable();
  currentCognitoUser = this.cognitoUser.asObservable();
  currentToken = this.token.asObservable();

  constructor() { }

  changeData(data: any) {
    this.dataSource.next(data);
  }

  changeCognitoUser(data: any) {
    this.cognitoUser.next(data);
  }

  changeToken(data: any) {
    this.token.next(data);
  }
}