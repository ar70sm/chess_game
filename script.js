// rook knight bishop king queen pawn

// ********************* control variables *********************
let controls = {
  testMode: false,
  movingSound: false,
  rotatingBoard: false,
};
let currentPiece = null;
let round = true;

// ********************* variables *********************
let location_arr = [];

// ********************* main events *********************
// >>> build the chess border
for (let i = 0; i < 8; i++) {
  for (let j = 0; j < 8; j++) {
    let div = document.createElement("div");
    div.setAttribute("location", `${i}${j}`);
    div.style.order = `${64 - i * 8 + j}`;
    div.classList.add("box");
    div.classList.add((i + j) % 2 == 0 ? "d" : "l");
    if (i == 0) {
      let hSeq = "ABCDEFGH";
      span = document.createElement("span");
      span.append(hSeq[j]);
      span.classList.add("hSeq");
      div.append(span);
    }
    if (j == 0) {
      span = document.createElement("span");
      span.append(i + 1);
      span.classList.add("vSeq");
      div.append(span);
    }
    document.querySelector(".chess_board").append(div);
  }
}

// >>>>>> order the pieces for the first time
arrangingPieces();

// >>>>>> controllers
eleEvent(".control_button", (e) => {
  let func = () => {
    controls[e.getAttribute("value_name")] = e.querySelector("input").checked;
    if (e.getAttribute("value_name") == "testMode") {
      clearBoard();
      currentPiece = null;
    } else if (e.getAttribute("value_name") == "rotatingBoard") {
      if (controls.rotatingBoard)
        eleEvent(".chess_board", (ele) =>
          ele.classList.add("rotatingBoard", round ? "roundW" : "roundB")
        );
      else
        eleEvent(".chess_board", (ele) =>
          ele.classList.remove("rotatingBoard")
        );
    }
  };
  func();
  e.addEventListener("change", func);
});
eleEvent("button", (ele) => {
  ele.addEventListener("click", () => {
    eleEvent(".chess_Piece", (e) => {
      let newLocation = ele.classList.contains("reset")
        ? e.getAttribute("home")
        : "g";
      e.setAttribute("location", newLocation);
    });
    arrangingPieces();
  });
});

// >>>>>> move the pieces
eleEvent(".chess_Piece", (e) => {
  e.addEventListener("click", () => {
    let array = [[], []];
    if (e == currentPiece) currentPiece = null;
    // test mode
    else if (controls.testMode) {
      for (var i = 0; i < 8; i++) {
        for (var j = 0; j < 8; j++) {
          if (location_arr[i][j] == "-") array[0].push(`${i}${j}`);
        }
      }
      if (e.getAttribute("location") != "g")
        array[0].push(e.getAttribute("alt")[0] + "g");
      currentPiece = e;
    }
    // normal mode
    else if (e.parentElement == document.querySelector(".chess_board")) {
      if (
        (round && e.getAttribute("alt")[0] == "w") ||
        (!round && e.getAttribute("alt")[0] == "b")
      ) {
        let { alt, location } = allAttributes(e);
        let PieceType = alt[1];
        let friend = alt[0];
        let enemy = friend == "w" ? "b" : "w";
        switch (PieceType) {
          // ------------- pawn
          case "p":
            array = pawn(location, enemy, friend);
            break;
          // ------------- rook
          case "r":
            array = rook(location, enemy, friend);
            break;
          // ------------- bishop
          case "b":
            array = bishop(location, enemy, friend);
            break;
          // ------------- queen
          case "q":
            let [r1, r2] = rook(location, enemy, friend);
            let [b1, b2] = bishop(location, enemy, friend);
            array = [
              [...r1, ...b1],
              [...r2, ...b2],
            ];
            break;
          // ------------- knight
          case "n":
            array = knight(location, enemy);
            break;
          // ------------- king
          case "k":
            array = king(location, enemy);
            break;
        }
        currentPiece = e;
      }
    }
    showAbility(array);
  });
});

// >>>>>> available click
addEventListener("click", (element) => {
  let classes = element.target.classList;
  let { location } = allAttributes(element.target);
  if (classes.contains("available") || classes.contains("danger")) {
    if (classes.contains("danger"))
      eleEvent(`.chess_Piece[location="${location}"]`, (e) =>
        e.setAttribute("location", "g")
      );
    currentPiece.setAttribute(
      "location",
      classes.contains("graveyard") ? "g" : location
    );
    arrangingPieces();
    if (!controls.testMode) {
      round = !round;
      rotateBoard();
    }
  }
});
// ********************* functions *********************
function arrangingPieces() {
  clearBoard();
  let step = document.querySelector(".chess_board").offsetWidth / 8;
  eleEvent(".chess_Piece", (ele) => {
    let { location, alt } = allAttributes(ele);
    if (location == "g") eleEvent(`.graveyard.${alt[0]}`, (e) => e.append(ele));
    else {
      if (ele.parentElement.classList.contains("graveyard"))
        eleEvent(".chess_board", (e) => e.append(ele));
      ele.style.left = `${step * location[1]}px`;
      ele.style.bottom = `${step * location[0]}px`;
    }
  });
  // ***********
  for (let i = 0; i < 8; i++) location_arr[i] = [..."-".repeat(8)];
  eleEvent(".chess_board .chess_Piece", (ele) => {
    let { location, alt } = allAttributes(ele);
    location_arr[location[0]][location[1]] = alt;
  });
  currentPiece = null;
  if (controls.movingSound) document.querySelector("audio").play();
}
function clearBoard() {
  eleEvent(".available,.danger", (e) =>
    e.classList.remove("available", "danger")
  );
}

//  show ability
function showAbility(array) {
  clearBoard();
  array[0].forEach((e) => {
    document.querySelector(`.box[location="${e}"]`).classList.add("available");
  });
  array[1].forEach((e) =>
    document.querySelector(`.box[location="${e}"]`).classList.add("danger")
  );
}
function rotateBoard() {
  eleEvent(".chess_board", (e) => {
    e.classList.remove("roundW", "roundB");
    requestAnimationFrame((time) => {
      requestAnimationFrame((time) => {
        e.classList.add(round ? "roundW" : "roundB");
      });
    });
  });
}
// ********************* Shortcuts *********************
function pawn(location, enemy, friend) {
  let arr = [[], [], false];
  let D = friend == "w" ? 1 : -1;
  let start = friend == "w" ? 1 : 6;
  if (check(location, D) == "-") {
    arr[0].push(newLoc(location, D));
    if (check(location, D * 2) == "-" && location[0] == start)
      arr[0].push(newLoc(location, D * 2));
  }
  for (let i = -1; i <= 1; i += 2) {
    if (check(location, D, i)[0] == enemy) {
      arr[1].push(newLoc(location, D, i));
      arr[2] ||= check(location, D, i)[1] == "p";
    }
  }
  return arr;
}
function rook(location, enemy, friend) {
  let arr = [[], [], false];
  for (let j = 0; j < 4; j++) {
    let s = j < 2 ? 1 : -1;
    let d = j % 2;
    for (let i = s; (i + +location[d]) * s <= (s == 1 ? 7 : 0); i += s) {
      let x = d ? 0 : i;
      let y = d ? i : 0;
      if (check(location, x, y) == "-") arr[0].push(newLoc(location, x, y));
      else if (check(location, x, y)[0] == friend) break;
      else if (check(location, x, y)[0] == enemy) {
        arr[1].push(newLoc(location, x, y));
        arr[2] ||=
          check(location, x, y)[1] == "r" || check(location, x, y)[1] == "q";
        break;
      }
    }
  }
  return arr;
}
function bishop(location, enemy, friend) {
  let arr = [[], [], false];
  for (let j = 0; j < 4; j++) {
    let s1 = j < 2 ? 1 : -1;
    let s2 = j % 2 ? 1 : -1;
    for (let i = 1; i + s1 * +location[0] <= (s1 == 1 ? 7 : 0); i++) {
      let x = s1 * i;
      let y = s2 * i;
      if (check(location, x, y) == "-") arr[0].push(newLoc(location, x, y));
      else if (check(location, x, y)[0] == friend) break;
      else if (check(location, x, y)[0] == enemy) {
        arr[1].push(newLoc(location, x, y));
        arr[2] ||=
          check(location, x, y)[1] == "b" || check(location, x, y)[1] == "q";
        break;
      }
    }
  }
  return arr;
}
function knight(location, enemy) {
  let arr = [[], [], false];
  for (let i = 0; i < 8; i++) {
    let x = (Math.trunc(i / 2) < 2 ? 1 : -1) * (1 + (i % 2));
    let y = (Math.trunc(i / 2) % 2 ? 1 : -1) * (2 - (i % 2));
    if (check(location, x, y) == "-") arr[0].push(newLoc(location, x, y));
    else if (check(location, x, y)[0] == enemy) {
      arr[1].push(newLoc(location, x, y));
      arr[2] ||= check(location, x, y)[1] == "n";
    }
  }
  return arr;
}

function king(location, enemy, friend) {
  let arr = [[], []];
  let outArr = [[], []];
  for (let i = 0; i < 9; i++) {
    let x = Math.trunc(i / 3) - 1;
    let y = (i % 3) - 1;
    if (check(location, x, y) == "-") arr[0].push(newLoc(location, x, y));
    else if (check(location, x, y)[0] == enemy)
      arr[1].push(newLoc(location, x, y));
  }
  for (let j = 0; j < 2; j++) {
    for (let i = 0; i < arr[j].length; i++) {
      let kingDanger = false;
      for (let k = 0; k < 9; k++) {
        if (check(location, Math.trunc(k / 3) - 1, (k % 3) - 1) == enemy + "k") {
          kingDanger = true;
          break;
        }
      }
    
      if (checkKing(arr[j][i], enemy, friend)||kingDanger) {
        arr[j].splice(i, 1);
        i--;
      }
    }
  }
  return arr;
}
function checkKing(location, enemy, friend) {
  return (
    pawn(location, enemy, friend)[2] ||
    rook(location, enemy, friend)[2] ||
    bishop(location, enemy, friend)[2] ||
    knight(location, enemy, friend)[2]
  );
}
// ********************* tools *********************
function eleEvent(address, func) {
  document.querySelectorAll(address).forEach((e) => func(e));
}

function allAttributes(e) {
  let opp = {};
  for (let i = 0; i < e.attributes.length; i++)
    opp[e.attributes[i].name] = e.attributes[i].value;
  return opp;
}

function check(loc, x = 0, y = 0) {
  if (loc.length > 2) return "x";
  else {
    x += +loc[0];
    y += +loc[1];
    if (x > 7 || x < 0 || y > 7 || y < 0) return "x";
    else {
      return location_arr[x][y];
    }
  }
}

function newLoc(loc, x = 0, y = 0) {
  x += +loc[0];
  y += +loc[1];
  return `${x}${y}`;
}
