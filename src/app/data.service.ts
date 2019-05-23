import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private http: HttpClient) {}

  getGameSettings(): Observable<object> {
    return this.http.get<object>('../assets/data/game-settings.json');
  }

  getWinners(): Observable<[]> {
    return this.http.get<[]>('../assets/data/winners.json');
  }

  addWinner(winner) {
    this.http.post<object>('../assets/data/winners.json', JSON.stringify(winner));
  }
}
