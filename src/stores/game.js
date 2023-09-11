import { defineStore } from 'pinia';
import { cloneDeep } from 'lodash';
import { io } from '@/plugins/sails.js';

function resetState() {
  return {
    id: null,
    chat: [],
    deck: [],
    log: [],
    name: null,
    p0Ready: false,
    p1Ready: false,
    passes: 0,
    players: [],
    spectatingUsers: [],
    scrap: [],
    turn: 0,
    twos: [],
    myPNum: null,
    topCard: null,
    secondCard: null,
    oneOff: null,
    oneOffTarget: null,
    waitingForOpponentToCounter: false,
    myTurnToCounter: false,
    isRanked: false,
    // Threes
    waitingForOpponentToPickFromScrap: false,
    pickingFromScrap: false,
    // Fours
    discarding: false,
    waitingForOpponentToDiscard: false,
    // Sevens
    playingFromDeck: false,
    waitingForOpponentToPlayFromDeck: false,
    // Last Event
    lastEventChange: null,
    lastEventOneOffRank: null,
    lastEventTargetType: null,
    // GameOver
    gameIsOver: false,
    winnerPNum: null,
    conceded: false,
    waitingForOpponentToStalemate: false,
    consideringOpponentStalemateRequest: false,
    currentMatch: null,
  };
}

/**
 * @returns number of queens a given player has
 * @param player is the player object
 */
function queenCount(player) {
  if (!player) {
    return null;
  }
  return player.faceCards.reduce((queenCount, card) => queenCount + (card.rank === 12 ? 1 : 0), 0);
}

const initialState = resetState();
export const useGameStore = defineStore('game', {
  state: () => initialState,
  getters: {
    player: (state)  => {
      return state.players[state.myPNum];
    },
    playerPointTotal: () => {
      if (!this.player) {
        return 0;
      }
      return this.player.points.reduce((total, card) => total + card.rank, 0) || 0;
    },
    playerQueenCount: () => {
      return queenCount(this.player);
    },
    playerUsername: () => {
      if (!this.player) {
        return null;
      }
      return this.player.username;
    },
    opponent: (state) => {
      if (state.players.length < 2) {
        return null;
      }
      return state.players[(state.myPNum + 1) % 2];
    },
    opponentIsReady: (state) => {
      if (!this.opponent) {
        return null;
      }
      return state.myPNum === 0 ? state.p1Ready : state.p0Ready;
    },
    opponentUsername: () => {
      if (!this.opponent) {
        return null;
      }
      return this.opponent.username;
    },
    opponentPointhis: () => {
      if (!this.opponent) {
        return 0;
      }
      return this.opponent.points.reduce((total, card) => total + card.rank, 0) || 0;
    },
    opponentQueenCount: () => {
      return queenCount(this.opponent);
    },
    playerWins: (state) => {
      return state.gameIsOver && state.winnerPNum === state.myPNum;
    },
    resolvingSeven: (state) => {
      return state.playingFromDeck || state.waitingForOpponentToPlayFromDeck;
    },
    isPlayersTurn: (state) => {
      return state.turn % 2 === state.myPNum;
    },
    hasGlassesEight: () => {
      return this.player.faceCards.filter((card) => card.rank === 8).length > 0;
    },
  },
  actions: {
    setGameId(val) {
      this.id = val;
    },
    updateGame(newGame) {
      if (Object.hasOwnProperty.call(newGame, 'lastEvent')) {
        if (Object.hasOwnProperty.call(newGame.lastEvent, 'change')) {
          this.lastEventChange = newGame.lastEvent.change;
        } else {
          this.lastEventChange = null;
        }
        if (Object.hasOwnProperty.call(newGame.lastEvent, 'oneOff')) {
          this.lastEventOneOffRank = newGame.lastEvent.oneOff.rank;
        } else {
          this.lastEventOneOffRank = null;
        }
        if (Object.hasOwnProperty.call(newGame.lastEvent, 'oneOffTargetType')) {
          this.lastEventTargetType = newGame.lastEvent.oneOffTargetType;
        } else {
          this.lastEventTargetType = null;
        }
      }
      this.waitingForOpponentToStalemate = false;
      if (Object.hasOwnProperty.call(newGame, 'id')) this.id = newGame.id;
      if (Object.hasOwnProperty.call(newGame, 'turn')) this.turn = newGame.turn;
      if (Object.hasOwnProperty.call(newGame, 'chat')) this.chat = cloneDeep(newGame.chat);
      if (Object.hasOwnProperty.call(newGame, 'deck')) this.deck = cloneDeep(newGame.deck);
      if (Object.hasOwnProperty.call(newGame, 'scrap')) this.scrap = cloneDeep(newGame.scrap);
      if (Object.hasOwnProperty.call(newGame, 'log')) this.log = cloneDeep(newGame.log);
      if (Object.hasOwnProperty.call(newGame, 'name')) this.name = newGame.name;
      if (Object.hasOwnProperty.call(newGame, 'p0Ready')) this.p0Ready = newGame.p0Ready;
      if (Object.hasOwnProperty.call(newGame, 'p1Ready')) this.p1Ready = newGame.p1Ready;
      if (Object.hasOwnProperty.call(newGame, 'passes')) this.passes = newGame.passes;
      if (Object.hasOwnProperty.call(newGame, 'players')) this.players = cloneDeep(newGame.players);
      if (Object.hasOwnProperty.call(newGame, 'spectatingUsers')) {
        this.spectatingUsers = newGame.spectatingUsers;
      }
      if (Object.hasOwnProperty.call(newGame, 'twos')) this.twos = cloneDeep(newGame.twos);

      if (Object.hasOwnProperty.call(newGame, 'topCard')) this.topCard = cloneDeep(newGame.topCard);
      else this.topCard = null;

      if (Object.hasOwnProperty.call(newGame, 'secondCard')) this.secondCard = cloneDeep(newGame.secondCard);
      else this.secondCard = null;

      if (Object.hasOwnProperty.call(newGame, 'oneOff')) this.oneOff = cloneDeep(newGame.oneOff);
      else this.oneOff = null;

      if (Object.hasOwnProperty.call(newGame, 'oneOffTarget'))
        this.oneOffTarget = cloneDeep(newGame.oneOffTarget);
      else this.oneOffTarget = null;

      if (Object.hasOwnProperty.call(newGame, 'isRanked')) this.isRanked = newGame.isRanked;
      if (Object.hasOwnProperty.call(newGame, 'currentMatch')) this.currentMatch = newGame.currentMatch;
    },
    setMyPNum(val) {
      this.myPNum = val;
    },
    opponentJoined(newPlayer) {
      this.players.push(cloneDeep(newPlayer));
      this.players.sort((player, opponent) => player.pNum - opponent.pNum);
    },
    successfullyJoined(player) {
      this.players.push(cloneDeep(player));
    },
    resetState() {
      this.$reset;
    },
    updateReady(pNum) {
      if (pNum === 0) {
        this.p0Ready = !this.p0Ready;
      } else {
        this.p1Ready = !this.p1Ready;
      }
    },
    opponentLeft() {
      this.players = this.players.filter((player) => player.pNum === this.myPNum);
    },
    setMyTurnToCounter(val) {
      this.myTurnToCounter = val;
    },
    // Countering
    setWaitingForOpponentToCounter(val) {
      this.waitingForOpponentToCounter = val;
    },
    // Threes
    setPickingFromScrap(val) {
      this.pickingFromScrap = val;
    },
    setWaitingForOpponentToPickFromScrap(val) {
      this.waitingForOpponentToPickFromScrap = val;
    },
    // Fours
    setDiscarding(val) {
      this.discarding = val;
    },
    setWaitingForOpponentToDiscard(val) {
      this.waitingForOpponentToDiscard = val;
    },
    // Sevens
    setPlayingFromDeck(val) {
      this.playingFromDeck = val;
    },
    setWaitingForOpponentToPlayFromDeck(val) {
      this.waitingForOpponentToPlayFromDeck = val;
    },
    // Game Over
    setGameOver({ gameOver, conceded, winner, currentMatch }) {
      this.gameIsOver = gameOver;
      this.conceded = conceded;
      this.winnerPNum = winner;
      this.currentMatch = currentMatch;
    },
    setWaitingForOpponentToStalemate(value) {
      this.waitingForOpponentToStalemate = value;
    },
    setConsideringOpponentStalemateRequest(value) {
      this.consideringOpponentStalemateRequest = value;
    },
    updateGameThenResetPNumIfNull(game) {
      this.updateGame(game);
      this.resetPNumIfNull();
    },
    resetPNumIfNull(context) {
      // Set my pNum if it is null
      if (context.state.myPNum === null) {
        let myPNum = context.state.players.findIndex(
          (player) => player.username === context.rootState.auth.username,
        );
        if (myPNum === -1) {
          myPNum = null;
        }
        this.setMyPNum(myPNum);
      }
    },
    /**
     * Updates gamestate to animate scuttle. First removes card from op hand
     * and places it on top of player's point card, then waits 1s
     * and updates complete game which will put both cards in the scrap
     * @returns void
     */
    processScuttle({ game, playedCardId, targetCardId, playedBy }) {
      // Update in one step if this player scuttled or if pNum is not set
      if (!this.player) {
        this.updateGameThenResetPNumIfNull(game);
        return;
      }

      const scuttlingPlayer = this.state.players[playedBy];
      const scuttledPlayer = this.state.players[(playedBy + 1) % 2];

      // Remove played card from scuttling player's hand and temporarily add to target's attachments
      const playedCardIndex = scuttlingPlayer.hand.findIndex((card) => card.id === playedCardId);
      const targetCardIndex = scuttledPlayer.points.findIndex((card) => card.id === targetCardId);

      // Update game in one-step if moved cards are not found
      if (playedCardIndex === undefined || targetCardIndex === undefined) {
        this.updateGameThenResetPNumIfNull(game);
        return;
      }

      const [playedCard] = scuttlingPlayer.hand.splice(playedCardIndex, 1);
      const targetCard = scuttledPlayer.points[targetCardIndex];
      targetCard.scuttledBy = playedCard;

      // Finish complete update of the game state after 1s
      setTimeout(() => {
        this.updateGameThenResetPNumIfNull(game);
      }, 1000);
    },

    handleGameResponse(jwres, resolve, reject) {
      switch (jwres.statusCode) {
        case 200:
          return resolve();
        case 403:
          this.setMustReauthenticate({ root: true });
          return reject(jwres.body.message);
        default:
          return reject(jwres.body.message);
      }
    },

    async requestSubscribe(gameId) {
      return new Promise((resolve, reject) => {
        io.socket.get(
          '/game/subscribe',
          {
            gameId,
          },
          function handleResponse(res, jwres) {
            if (jwres.statusCode === 200) {
              this.updateGame(res.game);
              this.setMyPNum(res.pNum);
              this.successfullyJoined({
                username: res.playerUsername,
                pNum: res.pNum,
              });
              return resolve();
            }
            const message = res.message ?? 'error subscribing';
            return reject(new Error(message));
          },
        );
      });
    },

    async requestSpectate(gameId) {
      return new Promise((resolve, reject) => {
        io.socket.get(
          '/game/spectate',
          {
            gameId,
          },
          function handleResponse(res, jwres) {
            if (jwres.statusCode === 200) {
              this.updateGame(res);
              this.setMyPNum(0);
              return resolve();
            }
            return reject(new Error('Unable to spectate game'));
          },
        );
      });
    },
    async requestSpectateLeave() {
      return new Promise((resolve, reject) => {
        io.socket.get('/game/spectateLeave', function handleResponse(res, jwres) {
          if (jwres.statusCode === 200) {
            this.resetState();
            return resolve();
          }
          return reject(new Error('Error leaving game as spectator'));
        });
      });
    },
    async requestLeaveLobby() {
      return new Promise((resolve, reject) => {
        io.socket.post('/game/leaveLobby', function handleResponse(res, jwres) {
          if (jwres.statusCode === 200) {
            this.resetState();
            return resolve();
          }
          return reject(new Error('Error leaving lobby'));
        });
      });
    },
    async requestReady() {
      return new Promise((resolve, reject) => {
        io.socket.post('/game/ready', function handleResponse(res, jwres) {
          if (jwres.statusCode === 200) {
            return resolve(res);
          }
          return reject(new Error('Error readying for game'));
        });
      });
    },
    ///////////////////
    // In-Game Moves //
    ///////////////////
    async requestDrawCard() {
      return new Promise((resolve, reject) => {
        io.socket.get('/game/draw', function handleResponse(res, jwres) {
          return this.handleGameResponse(jwres, resolve, reject);
        });
      });
    },
    async requestPlayPoints(context, cardId) {
      return new Promise((resolve, reject) => {
        io.socket.get(
          '/game/points',
          {
            cardId,
          },
          function handleResponse(res, jwres) {
            return this.handleGameResponse(jwres, resolve, reject);
          },
        );
      });
    },
    async requestPlayFaceCard(context, cardId) {
      return new Promise((resolve, reject) => {
        io.socket.get(
          '/game/faceCard',
          {
            cardId,
          },
          function handleResponse(res, jwres) {
            return this.handleGameResponse(jwres, resolve, reject);
          },
        );
      });
    },
    /**
     *
     * @param cardData @example {cardId: number, targetId: number}
     */
    async requestScuttle(cardData) {
      const { cardId, targetId } = cardData;
      return new Promise((resolve, reject) => {
        io.socket.get(
          '/game/scuttle',
          {
            cardId,
            targetId,
            opId: this.opponent.id,
          },
          function handleResponse(res, jwres) {
            return this.handleGameResponse(jwres, resolve, reject);
          },
        );
      });
    },
    async requestPlayOneOff(cardId) {
      return new Promise((resolve, reject) => {
        io.socket.get(
          '/game/untargetedOneOff',
          {
            cardId,
            opId: this.opponent.id,
          },
          function handleResponse(res, jwres) {
            return this.handleGameResponse(jwres, resolve, reject);
          },
        );
      }).then(() => {
        this.setWaitingForOpponentToCounter(true);
        return Promise.resolve();
      });
    },
    async requestPlayTargetedOneOff({ cardId, targetId, pointId, targetType }) {
      return new Promise((resolve, reject) => {
        io.socket.get(
          '/game/targetedOneOff',
          {
            cardId,
            targetId,
            pointId,
            targetType,
            opId: this.opponent.id,
          },
          function handleResponse(res, jwres) {
            return this.handleGameResponse(jwres, resolve, reject);
          },
        );
      }).then(() => {
        this.setWaitingForOpponentToCounter(true);
      });
    },
    async requestPlayJack({ cardId, targetId }) {
      return new Promise((resolve, reject) => {
        io.socket.get(
          '/game/jack',
          {
            cardId,
            targetId,
            opId: this.opponent.id,
          },
          function handleResponse(res, jwres) {
            return this.handleGameResponse(jwres, resolve, reject);
          }
        );
      });
    },
    /**
     *
     * @param {required} cardId1
     * @param {optional} cardId2
     */
    async requestDiscard({ cardId1, cardId2 }) {
      let reqData = {
        cardId1,
      };
      if (cardId2) {
        reqData = {
          cardId1,
          cardId2,
        };
      }
      return new Promise((resolve, reject) => {
        io.socket.get('/game/resolveFour', reqData, function (res, jwres) {
          return this.this.handleGameResponse(jwres, resolve, reject);
        });
      });
    },
    async requestResolve() {
      this.setMyTurnToCounter(false);
      return new Promise((resolve, reject) => {
        io.socket.get(
          '/game/resolve',
          {
            opId: this.opponent.id,
          },
          function handleResponse(res, jwres) {
            return this.handleGameResponse(jwres, resolve, reject);
          },
        );
      });
    },
    async requestResolveThree(cardId) {
      this.setMyTurnToCounter(false);
      return new Promise((resolve, reject) => {
        io.socket.get(
          '/game/resolveThree',
          {
            cardId,
            opId: this.opponent.id,
          },
          function handleResponse(res, jwres) {
            return this.handleGameResponse(jwres, resolve, reject);
          },
        );
      }).then(() => {
        this.setWaitingForOpponentToCounter(false);
      });
    },
    async requestResolveSevenDoubleJacks({ cardId, index }) {
      this.setMyTurnToCounter(false);
      return new Promise((resolve, reject) => {
        io.socket.get(
          '/game/seven/jack',
          {
            cardId,
            index, // 0 if topCard, 1 if secondCard
            targetId: -1, // -1 for the double jacks with no points to steal case
            opId: this.opponent.id,
          },
          function handleResponse(res, jwres) {
            return this.handleGameResponse(jwres, resolve, reject);
          },
        );
      });
    },
    async requestCounter(twoId) {
      this.setMyTurnToCounter(false);

      return new Promise((resolve, reject) => {
        io.socket.get(
          '/game/counter',
          {
            cardId: twoId,
            opId: this.opponent.id,
          },
          function handleResponse(res, jwres) {
            return this.handleGameResponse(jwres, resolve, reject);
          },
        );
      }).then(() => {
        this.setWaitingForOpponentToCounter(true);
      });
    },
    ////////////
    // Sevens //
    ////////////
    async requestPlayPointsSeven({ cardId, index }) {
      return new Promise((resolve, reject) => {
        io.socket.get(
          '/game/seven/points',
          {
            cardId,
            index, // 0 if topCard, 1 if secondCard
          },
          function handleResponse(res, jwres) {
            return this.handleGameResponse(jwres, resolve, reject);
          },
        );
      });
    },
    async requestScuttleSeven({ cardId, index, targetId }) {
      return new Promise((resolve, reject) => {
        io.socket.get(
          '/game/seven/scuttle',
          {
            cardId,
            index,
            targetId,
            opId: this.opponent.id,
          },
          function handleResponse(res, jwres) {
            return this.handleGameResponse(jwres, resolve, reject);
          },
        );
      });
    },
    async requestPlayJackSeven({ cardId, index, targetId }) {
      return new Promise((resolve, reject) => {
        io.socket.get(
          '/game/seven/jack',
          {
            cardId,
            index, // 0 if topCard, 1 if secondCard
            targetId,
            opId: this.opponent.id,
          },
          function handleResponse(res, jwres) {
            return this.handleGameResponse(jwres, resolve, reject);
          },
        );
      });
    },
    async requestPlayFaceCardSeven({ index, cardId }) {
      return new Promise((resolve, reject) => {
        io.socket.get(
          '/game/seven/faceCard',
          {
            cardId,
            index,
          },
          function handleResponse(res, jwres) {
            return this.handleGameResponse(jwres, resolve, reject);
          },
        );
      });
    },
    async requestPlayOneOffSeven({ cardId, index }) {
      return new Promise((resolve, reject) => {
        io.socket.get(
          '/game/seven/untargetedOneOff',
          {
            cardId,
            index, // 0 if topCard, 1 if secondCard
            opId: this.opponent.id,
          },
          function handleResponse(res, jwres) {
            return this.handleGameResponse(jwres, resolve, reject);
          },
        );
      }).then(() => {
        this.setWaitingForOpponentToCounter(true);
      });
    },
    async requestPlayTargetedOneOffSeven({ cardId, index, targetId, pointId, targetType }) {
      return new Promise((resolve, reject) => {
        io.socket.get(
          '/game/seven/targetedOneOff',
          {
            cardId,
            targetId,
            pointId,
            targetType,
            index, // 0 if topCard, 1 if secondCard
            opId: this.opponent.id,
          },
          function handleResponse(res, jwres) {
            return this.handleGameResponse(jwres, resolve, reject);
          },
        );
      }).then(() => {
        this.setWaitingForOpponentToCounter(true);
      });
    },
    async requestPass() {
      return new Promise((resolve, reject) => {
        io.socket.get('/game/pass', function handleResponse(res, jwres) {
          return this.handleGameResponse(jwres, resolve, reject);
        });
      });
    },
    async requestConcede() {
      return new Promise((resolve, reject) => {
        io.socket.get('/game/concede', function handleResponse(res, jwres) {
          return this.handleGameResponse(jwres, resolve, reject);
        });
      });
    },
    async requestStalemate() {
      return new Promise((resolve, reject) => {
        io.socket.get('/game/stalemate', function handleResponse(res, jwres) {
          return this.handleGameResponse(jwres, resolve, reject);
        });
      });
    },
    async rejectStalemate() {
      return new Promise((resolve, reject) => {
        io.socket.get('/game/reject-stalemate', function handleResponse(res, jwres) {
          return this.handleGameResponse(jwres, resolve, reject);
        });
      });
    },
    async requestUnsubscribeFromGame() {
      return new Promise((resolve, reject) => {
        io.socket.get('/game/over', function handleResponse(res, jwres) {
          if (jwres.statusCode === 200) {
            this.resetState();
          }
          return this.handleGameResponse(jwres, resolve, reject);
        });
      });
    },
  }, // End actions
}); // End game module
