import { HttpHeaders, HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { Observable } from "rxjs";
import { LoginResponse } from "../interfaces/login";
import { Userauths } from "../interfaces/auths";
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthsService {
  private baseUrl: string = `${environment.endpoint}api/users/`;
  private headers = new HttpHeaders().set('Content-Type', 'application/json');

  constructor(private http: HttpClient) {}

  login(user: Userauths): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}login`, user, { headers: this.headers }).pipe(
      tap((response) => {
        if (response.token) {
          localStorage.setItem('token', response.token);
          if (response.userId) {
            localStorage.setItem('userId', response.userId);
          }
        }
      }),
      catchError((error) => {
        console.error('Error en login:', error);
        return throwError(() => error);
      })
    );
  }
}
