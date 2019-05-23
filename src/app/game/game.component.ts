import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})

export class GameComponent implements OnInit {
  winners: object[];
  gameStarted: boolean = false;
  gameFinished: boolean = false;
  gameSettings: object;
  gameModes: string[];
  currentGameMode: string = '';
  playerName: string;
  gameCells;
  cellsForWin: number;
  filledCellsIndexes: number[] = [];
  activeCellIndex: number;
  computerPoints: number = 0;
  playerPoints: number = 0;
  statusMessage: string;

  constructor(private dataService: DataService){ }

  ngOnInit(){
    this.dataService.getGameSettings().subscribe((data) => {
      this.gameSettings = data;
      this.gameModes = Object.keys(this.gameSettings);
    });
    this.dataService.getWinners().subscribe((data) => {
      this.winners = data;
    });
  }

  getFieldRange(n){
    return new Array(n);
  }

  choseGameCell(i){
    if(!this.gameStarted) return;
    if(this.activeCellIndex == i){
      this.gameCells[i].classList.add('game-field-cell_player-won');
    }
  }

  stopGame(){
    this.gameStarted = false;
    this.gameFinished = true;
    this.filledCellsIndexes = [];
    this.activeCellIndex = null;
    this.statusMessage = this.playerPoints == this.cellsForWin ? `${this.playerName} won` : 'Computer won';
  }

  resetGame(){
    this.gameFinished = false;
    this.computerPoints = 0;
    this.playerPoints = 0;
    this.statusMessage = null;
    this.gameCells.forEach(function(cell){
      cell.classList.remove('game-field-cell_player-won', 'game-field-cell_computer-won');
    });
  }
  
  addWinner(){
    let dateString = (new Date()).toString();
    let dateParts = /\w+\s(\w+)\s(\w+)\s(\w+)\s(\d+:\d+)/.exec(dateString);
    let winner = {
      winner: this.playerPoints == this.cellsForWin ? this.playerName : 'Computer',
      date: `${dateParts[4]}; ${dateParts[2]} ${dateParts[1]} ${dateParts[3]}`
    };
    this.winners.push(winner);
    this.dataService.addWinner(winner);
  }

  playGame(gameMode: string, playerName: string){
    this.gameStarted = true;
    this.currentGameMode = gameMode;
    this.playerName = playerName;
    this.gameCells = document.querySelectorAll('.game-field .game-field-cell');
    this.cellsForWin = Math.floor(this.gameCells.length / 2) + 1;

    function getRandomCellIndex(min, max){
      return Math.floor(Math.random() * (max - min)) + min;
    }

    function gameStep(){
      let randomCellIndex;

      do {
        randomCellIndex = getRandomCellIndex(0, this.gameCells.length);

        if(!this.filledCellsIndexes.includes(randomCellIndex)){
          this.filledCellsIndexes.push(randomCellIndex);
          this.activeCellIndex = randomCellIndex;
          break;
        }
      } while(true);

      this.gameCells[randomCellIndex].classList.add('game-field-cell_active');

      setTimeout(() => {
        this.gameCells[randomCellIndex].classList.remove('game-field-cell_active');
        if(this.gameCells[randomCellIndex].classList.contains('game-field-cell_player-won')){
          this.playerPoints++;
        } else {
          this.computerPoints++;
          this.gameCells[randomCellIndex].classList.add('game-field-cell_computer-won');
        }
        if(this.playerPoints == this.cellsForWin || this.computerPoints == this.cellsForWin){
          this.stopGame();
          this.addWinner();
        } else {
          gameStep.call(this);
        }
      }, this.gameSettings[this.currentGameMode].delay);
    }

    if(this.gameFinished){
      this.resetGame();
    }

    gameStep.call(this);
  }
}
