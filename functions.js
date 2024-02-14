import { piecesList } from "./piecesList.js";
// ### ##### element variables ##### ### \\
export let chess_board = document.querySelector(".chess_board");

// ### ##### main functions ##### ### \\
// -- set piece location
export function setLocation(variable, newX = true, newY = true) {
  // catch the element and its index in pieces list
  let e;
  let i;
  if (typeof variable === "number") {
    e = getPiece(variable);
    i = variable;
  } else {
    e = variable;
    i = getPiece(variable);
  }
  // update the location on the pieces list
  if (newX === false) piecesList[i].state = false;
  else if (newX !== true) {
    piecesList[i].x = newX;
    piecesList[i].y = newY;
    piecesList[i].state = true;
  }
  // update the location on the page
  let step = chess_board.offsetHeight / 8;
  let { x, y, state, team } = piecesList[i];
  if (state) {
    if (!(e.parentElement == chess_board)) chess_board.append(e);
    e.style.left = y * step + "px";
    e.style.bottom = x * step + "px";
  } else document.querySelector(`[location="g${team}"]`).append(e);
}
// -- clear board
export function clearBoard() {
  eleEvent(".available, .danger", (e) => {
    e.classList.remove(
      "available",
      "danger",
      "castling",
      "throwingB",
      "throwingR"
    );
    e.removeAttribute("dir");
    e.removeAttribute("rook");
    e.removeAttribute("remove");
  });
}

// ### ##### Identify available locations ##### ### \\
// -- get the available locations of the pawn
function pawn(index) {
  let arr = [[], [], false];
  let { team, x, y } = piecesList[index];
  let D = team == "w" ? 1 : -1;
  let start = team == "w" ? 1 : 6;
  if (check(index, D, 0) === true) {
    arr[0].push([x + D, y]);
    if (check(index, D * 2, 0) === true && x == start)
      arr[0].push([x + D * 2, y]);
  }
  for (let i = -1; i <= 1; i += 2) {
    if (typeof check(index, D, i) == "string") {
      arr[1].push([x + D, y + i]);
      arr[2] ||= check(index, D, i) == "p";
    }
  }
  return arr;
}
// -- get the available locations of the rook
function rook(index) {
  let arr = [[], [], false];
  let { x, y } = piecesList[index];
  for (let j = 0; j < 4; j++) {
    let s = j < 2 ? 1 : -1;
    let d = j % 2;
    for (let i = s; ; i += s) {
      let a = d ? 0 : i;
      let b = d ? i : 0;
      let state = check(index, a, b);
      if (state === true) arr[0].push([x + a, y + b]);
      else if (state === false) break;
      else {
        arr[1].push([x + a, y + b]);
        arr[2] ||= state == "r" || state == "q";
        break;
      }
    }
  }
  return arr;
}
// -- get the available locations of the bishop
function bishop(index) {
  let arr = [[], [], false];
  let { x, y } = piecesList[index];
  for (let j = 0; j < 4; j++) {
    let s1 = j < 2 ? 1 : -1;
    let s2 = j % 2 ? 1 : -1;
    for (let i = 1; ; i++) {
      let a = s1 * i;
      let b = s2 * i;
      let state = check(index, a, b);
      if (state === true) arr[0].push([x + a, y + b]);
      else if (state === false) break;
      else {
        arr[1].push([x + a, y + b]);
        arr[2] ||= state == "b" || state == "q";
        break;
      }
    }
  }
  return arr;
}
// -- get the available locations of the knight
function knight(index) {
  let arr = [[], [], false];
  let { x, y } = piecesList[index];
  for (let i = 0; i < 8; i++) {
    let a = (Math.trunc(i / 2) < 2 ? 1 : -1) * (1 + (i % 2));
    let b = (Math.trunc(i / 2) % 2 ? 1 : -1) * (2 - (i % 2));
    let state = check(index, a, b);
    if (state === true) arr[0].push([x + a, y + b]);
    else if (typeof state == "string") {
      arr[1].push([x + a, y + b]);
      arr[2] ||= state == "n";
    }
  }
  return arr;
}
// -- get the available locations of the king
function king(index) {
  let arr = [[], [], false];
  let { x, y } = piecesList[index];
  for (let i = 0; i < 9; i++) {
    let a = Math.trunc(i / 3) - 1;
    let b = (i % 3) - 1;
    let state = check(index, a, b);
    if (state === true) arr[0].push([x + a, y + b]);
    else if (typeof state == "string") {
      arr[1].push([x + a, y + b]);
      arr[2] ||= state == "k";
    }
  }
  return arr;
}
// -- making the array of the available boxes
export function checkKing(team) {
  let location = team == "w" ? 4 : 20;
  let r = false;
  [pawn, rook, bishop, knight, king].forEach((e) => {
    r ||= e(location)[2];
  });
  return r;
}
// -- making the array of the available boxes
export function availableArray(index) {
  let array = [[], []];
  let { team, type, x, y } = piecesList[index];
  switch (type) {
    // ------------- pawn
    case "p":
      array = pawn(index);
      break;
    // ------------- rook
    case "r":
      array = rook(index);
      break;
    // ------------- bishop
    case "b":
      array = bishop(index);
      break;
    // ------------- queen
    case "q":
      let [r1, r2] = rook(index);
      let [b1, b2] = bishop(index);
      array = [
        [...r1, ...b1],
        [...r2, ...b2],
      ];
      break;
    // ------------- knight
    case "n":
      array = knight(index);
      break;
    // ------------- king
    case "k":
      array = king(index);
      break;
  }
  for (let j = 0; j < 2; j++) {
    for (let i = 0; i < array[j].length; i++) {
      let a = array[j][i][0];
      let b = array[j][i][1];
      let removed = locationArray()[a][b];
      if (removed !== null) {
        piecesList[removed].state = false;
      }
      [piecesList[index].x, piecesList[index].y] = [a, b];

      if (checkKing(team)) array[j].splice(i--, 1);

      [piecesList[index].x, piecesList[index].y] = [x, y];
      if (removed !== null) {
        piecesList[removed].state = true;
      }
    }
  }
  return [array[0], array[1]];
}

// ### ##### tools ##### ### \\
// -- get the element from its index or vice versa
export function getPiece(variable) {
  if (typeof variable === "number")
    return document.querySelector(`[key="${variable}"]`);
  else return +variable.getAttribute("key");
}
// -- do event on an elements
function eleEvent(address, func) {
  document.querySelectorAll(address).forEach((e, i) => func(e, i));
}
// -- set the array of locations
export function locationArray() {
  let arr = Array.from({ length: 8 }, () =>
    Array.from({ length: 8 }, () => null)
  );
  piecesList.forEach((e, i) => {
    if (e.state) arr[e.x][e.y] = i;
  });
  return arr;
}
// -- check the state of a location
export function check(i, a = 0, b = 0) {
  let arr = locationArray();
  let { x, y, team } = piecesList[i];
  x += a;
  y += b;
  if (x > 7 || x < 0 || y > 7 || y < 0) return false;
  else if (arr[x][y] === null) return true;
  else
    return piecesList[arr[x][y]].team == team
      ? false
      : piecesList[arr[x][y]].type;
}
export function arrEquals(a, b) {
  if (a.length != b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] != b[i]) return false;
  }
  return true;
}
export function multiEvents(events, element, fun) {
  for (let i=0;i<events.length;i++) {
    element.addEventListener(events[i],fun(element))
  }
}
