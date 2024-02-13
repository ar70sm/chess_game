// ### ##### importing functions ##### ### \\
import {
  chess_board,
  setLocation,
  locationArray,
  getPiece,
  clearBoard,
  availableArray,
  checkKing,
  arrEquals,
} from "./functions.js";

// ### ##### importing pieces list ##### ### \\
import { piecesList } from "./piecesList.js";

// ### ##### control variables ##### ### \\
let testMode = false;
let sounds = false;

// ### ##### general variables ##### ### \\
let round = true;
let ready = null;
let history = [];
let hI = 0;
let CastlingList = { wr: true, wl: true, br: true, bl: true };
// ### ##### building the page ##### ### \\
// -- build the chess board
for (let i = 0; i < 8; i++) {
  for (let j = 0; j < 8; j++) {
    let div = document.createElement("div");
    div.setAttribute("location", `${i}${j}`);
    div.style.order = `${64 - i * 8 + j}`;
    div.classList.add("box");
    div.classList.add((i + j) % 2 == 0 ? "d" : "l");
    if (i == 0) {
      let hSeq = "ABCDEFGH";
      let span = document.createElement("span");
      span.append(hSeq[j]);
      span.classList.add("hSeq");
      div.append(span);
    }
    if (j == 0) {
      let span = document.createElement("span");
      span.append(i + 1);
      span.classList.add("vSeq");
      div.append(span);
    }
    chess_board.append(div);
  }
}
// -- upload the chess peaces
piecesList.forEach((ele, i) => {
  let img = document.createElement("img");
  img.setAttribute("class", "chess_piece");
  img.setAttribute("alt", ele.team + ele.type);
  img.setAttribute("src", `./media/${ele.team + ele.type}.svg`);
  img.setAttribute("key", i + "");
  chess_board.append(img);
});
// -- arranging the pieces
for (let i = 0; i < 32; i++) setLocation(i);

// ### ##### control board ##### ### \\
// -- test mode
let testModeButton = document.querySelector(".control_board .testMode input");
testMode = testModeButton.checked;
testModeButton.addEventListener("change", () => {
  testMode = testModeButton.checked;
  clearBoard();
  document.querySelectorAll(".ksh").forEach((e) => e.classList.remove("ksh"));
  if (!testMode) round = true;
});
// -- moving sound
let soundsButton = document.querySelector(".control_board .sounds input");
sounds = soundsButton.checked;
soundsButton.addEventListener("change", () => {
  sounds = soundsButton.checked;
});
// -- rotating board
let rotatingButton = document.querySelector(".control_board .rotating input");
if (rotatingButton.checked)
  chess_board.classList.add("rotatingBoard", round ? "roundW" : "roundB");
else chess_board.classList.remove("rotatingBoard");
rotatingButton.addEventListener("change", () => {
  if (rotatingButton.checked)
    chess_board.classList.add("rotatingBoard", round ? "roundW" : "roundB");
  else chess_board.classList.remove("rotatingBoard");
});
// -- reset
document
  .querySelector(".control_board .reset")
  .addEventListener("click", () => {
    piecesList.forEach((e, i) => {
      [e.x, e.y, e.state] = [e.home.x, e.home.y, true];
      setLocation(i);
    });
    CastlingList = { wr: true, wl: true, br: true, bl: true };
    clearBoard();
  });
// -- all out button
document.querySelector("button.delete").addEventListener("click", () => {
  if (testMode) {
    piecesList.forEach((e, i) => {
      if (e.type != "k") e.state = false;
      setLocation(i);
    });
  }
  clearBoard();
});

// ### ##### available boxes ##### ### \\
// -- on click on a piece
document.querySelectorAll(".chess_piece").forEach((ele) => {
  ele.addEventListener("click", () => {
    clearBoard();
    let index = getPiece(ele);
    if (index == ready) ready = null;
    else {
      ready = index;
      let array = [[], []];
      let { state, type, team, x, y } = piecesList[index];
      // -- test mode
      if (testMode) {
        locationArray().forEach((line, i) => {
          line.forEach((box, j) => {
            if (box === null) array[0].push([i, j]);
          });
        });
        if (state && type != "k") array[0].push(["g", team]);
        // -- normal mode
      } else {
        if (((round && team == "w") || (!round && team == "b")) && state) {
          array = availableArray(index);
          // check Castling
          let Castling = [];
          let t = team == "w" ? 0 : 16;
          let r = team == "w" ? 0 : 7;
          if (
            type == "k" &&
            arrEquals(locationArray()[r].slice(4), [
              index,
              null,
              null,
              7 + t,
            ]) &&
            CastlingList[team + "r"]
          ) {
            piecesList[index].y = 6;
            piecesList[7 + t].y = 5;
            if (!checkKing(team)) Castling.push([r, 6, t + 7, 5]);
            piecesList[index].y = 4;
            piecesList[7 + t].y = 7;
          }
          if (
            type == "k" &&
            arrEquals(locationArray()[r].slice(0, 5), [
              t,
              null,
              null,
              null,
              index,
            ]) &&
            CastlingList[team + "l"]
          ) {
            piecesList[t].y = 3;
            piecesList[index].y = 2;
            if (!checkKing(team)) Castling.push([r, 2, t, 3]);
            piecesList[t].y = 0;
            piecesList[index].y = 4;
          }
          for (let i in Castling) {
            array[0].push(Castling[i].slice(0, 2));
            let ele = document.querySelector(
              `[location="${Castling[i][0]}${Castling[i][1]}"]`
            );
            ele.classList.add("castling");
            ele.setAttribute("rook", Castling[i][2]);
            ele.setAttribute("dir", Castling[i][3]);
          }
          // check kill by throwing
          if (team + type + x == "wp4" || team + type + x == "bp3") {
            let D = team == "w" ? 1 : -1;
            let [[oldX, oldY], p, [newX]] = history[hI - 1][0];
            if (
              oldX == x + 2 * D &&
              newX == x &&
              (oldY == y + 1 || oldY == y - 1) &&
              piecesList[p].type == "p"
            ) {
              piecesList[index].x= x + D;
              piecesList[index].y= oldY;
              piecesList[p].state= false;
              if (!checkKing(team)) {
                array[0].push([x + D, oldY]);
                array[1].push([x, oldY]);
                let blue = document.querySelector(
                  `[location="${x + D}${oldY}"]`
                  );
                  let red = document.querySelector(`[location="${x}${oldY}"]`);
                  blue.classList.add("throwingB");
                  red.classList.add("throwingR");
                  blue.setAttribute("remove", p);
                  red.setAttribute("dir", D);
                }
                piecesList[index].x= x;
                piecesList[index].y= y;
                piecesList[p].state= true;
            }
          }
        }
      }
      for (let i = 0; i < 2; i++) {
        array[i].forEach((l) => {
          document
            .querySelector(`[location="${l[0]}${l[1]}"]`)
            .classList.add(i ? "danger" : "available");
        });
      }
    }
  });
});
// -- on click on an available box
addEventListener("click", (event) => {
  let classes = event.target.classList;
  if (classes.contains("available") || classes.contains("danger")) {
    document.querySelectorAll(".ksh").forEach((e) => e.classList.remove("ksh"));
    let { team, type, x, y, side } = piecesList[ready];
    // get th location of the box
    let [newX, newY] = event.target.getAttribute("location");
    if (event.target.parentElement == chess_board)
      [newX, newY] = [+newX, +newY];
    // only in normal mode
    if (!testMode) {
      history.length = hI + 1;
      history[hI] = [];
      // check if a piece will be removed
      if (classes.contains("danger")) {
        let excluded = locationArray()[newX][newY];
        setLocation(excluded, false);
        // (History)
        history[hI].push([[+newX, +newY], excluded, false]);
      }
      // check if a castling will happen
      if (classes.contains("castling")) {
        let cast = +event.target.getAttribute("rook");
        let dir = +event.target.getAttribute("dir");
        setLocation(cast, newX, dir);
        // (History)
        history[hI].push([
          [piecesList[cast].x, piecesList[cast].y],
          cast,
          [newX, dir],
        ]);
      }
      // check if a castling will still available
      if (type == "r") CastlingList[team + side] = false;
      if (type == "k") {
        CastlingList[team + "l"] = false;
        CastlingList[team + "r"] = false;
      }
      // check if a killing by throwing will happen
      if (classes.contains("throwingB")) {
        let ele = +event.target.getAttribute("remove");
        setLocation(ele, false);
        history[hI].push([[piecesList[ele].x, piecesList[ele].y], ele, false]);
      }
      if (classes.contains("throwingR")) {
        let D = +event.target.getAttribute("dir");
        newX += D;
      }
      // (History)
      history[hI].push([[x, y], ready, [newX, newY]]);
      hI++;
      HistoryEle();
    }
    // change the ready piece location
    setLocation(ready, newX == "g" ? false : newX, newY);
    clearBoard(); // clearing the board
    if (sounds) document.querySelector("audio").play(); // moving sound
    // check if a pawn will be updated
    if (team + type + newX == "wp7" || team + type + newX == "bp0")
      document.querySelector(".pawn_promotion").classList.add("visible", team);
    else StartNewRound();
  }
});
// -- winner window
document.querySelector(".winner").addEventListener("click", (e) => {
  e.target.classList.remove("visible");
});
// -- history controller
document
  .querySelector(".history .before")
  .addEventListener("click", () => historyBack());
document
  .querySelector(".history .after")
  .addEventListener("click", () => historyFront());

// ### ##### direct functions ##### ### \\
// -- rotate the board
function rotateBoard() {
  chess_board.classList.remove("roundW", "roundB");
  requestAnimationFrame((time) => {
    requestAnimationFrame((time) => {
      chess_board.classList.add(round ? "roundW" : "roundB");
    });
  });
}
// -- Start new round
function StartNewRound() {
  if (!testMode) {
    // Exchanging roles
    round = !round;
    rotateBoard();
    // Checkmate
    let king = round ? 4 : 20;
    let ksh = checkKing(piecesList[king].team);
    if (ksh)
      document
        .querySelector(
          `[location="${piecesList[king].x}${piecesList[king].y}"]`
        )
        .classList.add("ksh");
    // check if game end
    let end = true;
    let pieceCount = 0;
    piecesList.forEach((e, i) => {
      if (e.state) {
        pieceCount++;
        if (e.team == (!round ? "b" : "w")) {
          let testArr = availableArray(i);
          end &&= testArr[0].length == 0 && testArr[1].length == 0;
        }
      }
    });
    end ||= pieceCount == 2;
    if (end) {
      let winner = document.querySelector(".winner");
      winner.classList.add("visible");
      if (ksh) {
        winner.querySelector("p").innerHTML =
          (!round ? "white" : "black") + " wine";
      } else {
        winner.querySelector("p").innerHTML = "draw";
      }
    }
  }
  ready = null; // nulling the ready piece variable
}
// -- pawn_promotion
document.querySelectorAll(".pawn_promotion img").forEach((e) => {
  e.addEventListener("click", () => {
    getPiece(ready).setAttribute("alt", e.getAttribute("alt"));
    getPiece(ready).setAttribute("src", e.getAttribute("src"));
    piecesList[ready].team = e.getAttribute("alt")[0];
    piecesList[ready].type = e.getAttribute("alt")[1];
    document.querySelector(".pawn_promotion").classList = "pawn_promotion";
    StartNewRound();
  });
});
// -- history element building
function HistoryEle() {
  let lArr = "abcdefgh";
  document.querySelector(".history p").innerHTML = "";
  for (let i in history) {
    let span = document.createElement("span");
    if (i == hI - 1) span.classList.add("here");
    for (let j in history[i]) {
      let [oldL, ele, newL] = history[i][j];
      ele = piecesList[ele].team + piecesList[ele].type + piecesList[ele].side;
      newL = newL === false ? "X" : newL[0] + 1 + lArr[newL[1]];
      span.append(`{${ele}: ${newL}}`);
    }
    document.querySelector(".history p").append(span);
  }
}

function historyBack() {
  if (hI > 0) {
    hI--;
    for (let i in history[hI]) {
      setLocation(history[hI][i][1], ...history[hI][i][0]);
    }
    round = !round;
    HistoryEle();
  }
}
function historyFront() {
  if (hI < history.length) {
    for (let i in history[hI]) {
      if (history[hI][i][2] === false) {
        setLocation(history[hI][i][1], false);
      } else {
        setLocation(history[hI][i][1], ...history[hI][i][2]);
      }
    }
    round = !round;
    hI++;
    HistoryEle();
  }
}
