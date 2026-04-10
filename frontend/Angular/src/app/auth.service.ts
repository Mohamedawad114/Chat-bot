import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  baseURL = `http://localhost:3000/Auth/`;
  token: any = `Hamada__` + localStorage.getItem('token');

  constructor(private _HttpClient: HttpClient, private _Router: Router) {
    this.token = `Hamada__` + localStorage.getItem('token');
  }

  // ---------- GOOGLE LOGIN ----------
  loginWithGmail(data: any): Observable<any> {
    return this._HttpClient.post(this.baseURL + 'signup-gmail', data);
  }

  // ---------- FACEBOOK LOGIN ----------
  loginWithFacebook(data: { idToken: string }): Observable<any> {
    // نرسل الـ accessToken للباك اند
    return this._HttpClient.post(this.baseURL + 'signup-facebook', data);
  }
}