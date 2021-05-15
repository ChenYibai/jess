// Based on ybj's code

function cAlert(html) {
  $(document.body).append(`<div class="modal fade" id="cAlert" tabindex="-1">
    <div class="modal-dialog"><div class="modal-content">
    <div class="modal-body" style="text-align:center">${html}</div>
    <div class="modal-footer">
    <button type="button" class="btn btn-secondary" data-dismiss="modal">Confirm</button>
    </div></div></div></div>`);
  $("#cAlert").modal("show").on("shown.bs.modal", function () {
    $("#cAlert .btn-secondary").trigger("focus");
  });
  return new Promise(function (resolve, reject) {
    $("#cAlert").on("hidden.bs.modal", function () {
      $("#cAlert").remove();
      resolve();
    });
  });
}
function pos(x, y) {
  return `top: ${Number(x) * 50}px; left: ${Number(y) * 50}px; `;
}
var board = [[-1, -1, -1, -1, -1, -1, -1, -1], [-1, -1, -1, -1, -1, -1, -1, -1],
[-1, -1, -1, -1, -1, -1, -1, -1], [-1, -1, -1, -1, -1, -1, -1, -1],
[-1, -1, -1, -1, -1, -1, -1, -1], [-1, -1, -1, -1, -1, -1, -1, -1],
[-1, -1, -1, -1, -1, -1, -1, -1], [-1, -1, -1, -1, -1, -1, -1, -1]];
// board format: [team, level, effect(array), blood, bone]
var nam = ["姚", "姚", "华", "华", "马", "马", "贾", "猴"];
var blood = [2, 2, 2, 2, 2, 2, 2, 2];
var attack = [2, 2, 2, 2, 2, 2, 2, 2];
var initPos = [[0, 0], [0, 7], [0, 1], [0, 6], [1, 0], [1, 7], [1, 2], [1, 5]];
var sqrColor = ["#fff", "#faa", "#8af"];
var player = 0;
var going = 0;
var killedi = 0, killedii = 0;
var turn = 0; // number of goes made up to now
var tot = [0, 0]; // Total score(number of bones). Format: [red, blue]
var reviveList = []; // List of pieces waiting for reviveion

function inProducer(x, y) {
  return (x >= 3 && x <= 4 && y >= 3 && y <= 4);
}
function inBoard(x, y) {
  return (x >= 0 && x <= 7 && y >= 0 && y <= 7);
}
function getColor(x, y) {
  let $square = $("#board>tr").eq(x).children("td").eq(y);
  return Number($square.attr("data-color"));
}
function changeColor(x, y, c) {
  if (inProducer(x, y)) return;
  let $square = $("#board>tr").eq(x).children("td").eq(y);
  let curColor = Number($square.attr("data-color"));
  curColor = (c == undefined ? (curColor + 1) % sqrColor.length : c);
  $square.attr("data-color", curColor);
  $square.css("background", sqrColor[curColor]);
}

window.onload = function () {
  let ht = "";
  for (let i = 0; i < 8; i++) {
    ht += "<tr>";
    for (let i = 0; i < 8; i++) ht += '<td data-color="0"></td>';
    ht += "</tr>";
  }
  $("#board").html(ht);
  for (let i = 0; i < 8; i++) {
    let xI = 7 - initPos[i][0], yI = 7 - initPos[i][1];
    let nameI = nam[i];
    document.body.innerHTML += `<div class="piece teami" id="piece${i}" style
      ="${pos(xI, yI)}" onclick="control(${xI}, ${yI})">${nameI}</div>`;
    board[xI][yI] = [0, i, [0, 0], blood[i], 0];
  }
  for (let i = 0; i < 8; i++) {
    let xI = initPos[i][0], yI = initPos[i][1];
    let nameI = nam[i];
    document.body.innerHTML += `<div class="piece teamii" id="piece${String(Number(i) + 16)}" style
      ="${pos(xI, yI)}" onclick="control(${xI}, ${yI})">${nameI}</div>`;
    board[xI][yI] = [1, i, [0, 0], blood[i], 0];
  }
  updateBoneProducer();
}

function control(x, y) {
  function controlHelper(x, y, nx, ny, player) {
    if (!inBoard(nx, ny)) return;
    if (board[nx][ny][0] == player) return;
    if (inProducer(nx, ny) && numBone > 0)
      $("#go").append(`<div class="go-bone" onclick="go(${x},${y},${nx},${ny})"
        style="${pos(nx, ny)}"></div>`);
    else if (board[nx][ny] == -1)
      $("#go").append(`<div class="go-empty" onclick="go(${x},${y},${nx},${ny})"
        style="${pos(nx, ny)}"></div>`);
    else if (board[nx][ny][0] != player) {
      $("#go").append(`<div class="go-kill" onclick="go(${x},${y},${nx},${ny})"
        style="${pos(nx, ny)}"></div>`);
    }
  }

  $("#control").fadeToggle(function () {
    $("#blood").empty();
    $("#attack").empty();
    $("#bone").empty();
    $("#effect").empty();
    let boardXY = board[x][y];
    // let srcXY = "../../img/";
    // if (nam[boardXY[1]][boardXY[2]] == "lyf") srcXY += "lyf.gif";
    // else srcXY += nam[boardXY[1]][boardXY[2]] + ".png";
    // document.getElementById("control-img").src = srcXY;
    document.getElementById("control-name").innerHTML = nam[boardXY[1]];
    document.getElementById("control").style.left = String(8 + (Number(y) + 1) * 51) + "px";
    document.getElementById("control").style.top = String(8 + (Number(x) + 1) * 51) + "px";
    for (let i = 0; i < boardXY[3]; i++) document.getElementById("blood").innerHTML
      += `<img src="img/heart.png" style="width: 25px">`;
    document.getElementById("bone").innerHTML = boardXY[4];
    for (var k = 0; k < boardXY[2].length; k++) if (boardXY[2][k])
      $("#effect").append(`<div class="little-square" style="background:${sqrColor[k + 1]};"></div>`);
    if (player == boardXY[0] && going == 0) {
      going = 2;
      // Compute where the piece can go and store the destinations in `res`
      var res = [];
      switch (boardXY[1]) {
        case 0:
        case 1:
          var dx = [-1, 0, 1, 0], dy = [0, -1, 0, 1];
          for (let d = 0; d < 4; d++) {
            let nx = Number(x) + Number(dx[d]), ny = Number(y) + Number(dy[d]);
            while (inBoard(nx, ny) && board[nx][ny] == -1) {
              if (!inProducer(nx, ny) || numBone > 0)
                res.push([nx, ny]);
              nx += dx[d], ny += dy[d];
            }
            if (inBoard(nx, ny) && !(inProducer(nx, ny) && numBone == 0)
              && (board[nx][ny] == -1 || board[nx][ny][0] != player))
              res.push([nx, ny]);
          }
          break;
        case 2:
        case 3:
          var dx = [-1, -1, 1, 1], dy = [-1, 1, -1, 1];
          for (let d = 0; d < 4; d++) {
            let nx = Number(x) + Number(dx[d]), ny = Number(y) + Number(dy[d]);
            while (inBoard(nx, ny) && board[nx][ny] == -1) {
              if (!inProducer(nx, ny) || numBone > 0)
                res.push([nx, ny]);
              nx += dx[d], ny += dy[d];
            }
            if (inBoard(nx, ny) && !(inProducer(nx, ny) && numBone == 0)
              && (board[nx][ny] == -1 || board[nx][ny][0] != player))
              res.push([nx, ny]);
          }
          break;
        case 4:
        case 5:
          var dx = [1, -1, 1, -1, 2, -2, 2, -2], dy = [2, 2, -2, -2, 1, 1, -1, -1];
          for (let d = 0; d < 8; d++) {
            let nx = Number(x) + Number(dx[d]), ny = Number(y) + Number(dy[d]);
            if (inBoard(nx, ny) && !(inProducer(nx, ny) && numBone == 0)
              && (board[nx][ny] == -1 || board[nx][ny][0] != player))
              res.push([nx, ny]);
          }
          break;
        case 6:
          var dx = [1, -1, 0, 0], dy = [0, 0, 1, -1];
          for (let d = 0; d < 4; d++) {
            let nx = Number(x) + dx[d], ny = Number(y) + dy[d];
            if (inBoard(nx, ny) && !(inProducer(nx, ny) && numBone == 0)
              && (board[nx][ny] == -1 || board[nx][ny][0] != player))
              res.push([nx, ny]);
          }
          // All the squares next to player's 华
          for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++)
            if (board[i][j] != -1 && (board[i][j][1] == 2 || board[i][j][1] == 3)
              && board[i][j][0] == player) { // If this is player's 华
              for (let d = 0; d < 4; d++) {
                let nx = i + dx[d], ny = j + dy[d];
                if (inBoard(nx, ny) && !(inProducer(nx, ny) && numBone == 0)
                  && (board[nx][ny] == -1 || board[nx][ny][0] != player)
                  && JSON.stringify(res).indexOf(JSON.stringify([nx, ny])) == -1) // Avoid duplication
                  res.push([nx, ny]);
              }
            }
          break;
        case 7:
          for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) {
            if (Math.abs(i - x) + Math.abs(j - y) <= 2 && // Manhattan distance <= 2
              inBoard(i, j) && !(inProducer(i, j) && numBone == 0)
              && (board[i][j] == -1 || board[i][j][0] != player))
              res.push([i, j]);
          }
          break;
      }
      // Render the clickable green(or other colors) squares
      for (var pos of res) controlHelper(x, y, pos[0], pos[1], player);
    }
    if (going == 1) {
      $("#go").empty();
      going = 0;
    }
    if (going == 2) going = 1;
  });
}

var numBone = 0; // Number of bones left in the bone producer
function updateBoneProducer() {
  for (var i = 3; i <= 4; i++)
    for (var j = 3; j <= 4; j++) {
      var ele = $("#board>tr").eq(i).children("td").eq(j);
      if (numBone == 0) ele.css("background", "#aaa");
      else ele.css("background", "url(img/bone.png)");
      if (numBone > 1) ele.html(numBone);
      else ele.html("");
    }
}

// The 3 functions below are just for displaying.
// They don't change the value of `board`, so you should change it manually.
// Just to move a piece without considering anything else
function movePiece(x, y, nx, ny) {
  var bxy = board[x][y];
  var ele = document.getElementById("piece" + String(Number(bxy[0]) * 16 + Number(bxy[1])));
  ele.onclick = function () {
    control(nx, ny);
  }
  ele.style = pos(nx, ny);
}
// Display a piece as dead (put it out of the board)
function killPiece(x, y) {
  var bxy = board[x][y];
  var ele = document.getElementById("piece" + String(Number(bxy[0]) * 16 + Number(bxy[1])));
  if (bxy[0] == 0) ele.style = pos(bxy[1], 9);
  else ele.style = pos(bxy[1], 10);
  ele.onclick = function () { };
  reviveList.push([bxy, 5]); // `5` means reviveion after 5 goes
}
// Display a piece as alive (put it back in the board)
function revivePiece(i, nx, ny) {
  // if (bxy[0] == 0) killedi--;
  // else killedii--;
  var bxy = reviveList[i][0];
  var ele = document.getElementById("piece" + String(Number(bxy[0]) * 16 + Number(bxy[1])));
  ele.style = pos(nx, ny);
  ele.onclick = function () {
    control(nx, ny);
  };
  reviveList.splice(i, 1);
}

// Main function triggered when player wants to move a piece
function go(x, y, nx, ny) {
  let color = getColor(x, y), colorn = getColor(nx, ny);
  let bxy = board[x][y], nbxy = board[nx][ny];
  $("#go").empty();
  $("#control").fadeOut();
  going = 0;
  player = 1 - player;
  if (player == 0) document.getElementById("player").style.background = "red";
  else document.getElementById("player").style.background = "blue";
  if (nbxy == -1) { // Steps into empty square
    if (inProducer(nx, ny)) { // Steps into bone producer
      board[x][y][4] += numBone;
      tot[board[x][y][0]] += numBone;
      numBone = 0;
      updateBoneProducer();
    }
    else {
      movePiece(x, y, nx, ny);
      board[x][y] = -1;
      board[nx][ny] = bxy;
      changeColor(x, y);
    }
  }
  else { // Attack another piece
    board[nx][ny][3] -= Math.ceil(attack[board[x][y][1]] * (colorn == 2 || board[nx][ny][2][1] ? 0.5 : 1));
    // board[x][y][3]--;
    nbxy = board[nx][ny]; bxy = board[x][y];
    if (nbxy[3] <= 0) { // Knock Out
      killPiece(nx, ny);
      var bonesGain = Math.ceil(nbxy[4] / 2) + (color == 1 || board[x][y][2][0] ? 1 : 0);
      tot[bxy[0]] += bonesGain, tot[nbxy[0]] -= nbxy[4]; // Transfer scores
      bxy[4] += bonesGain, nbxy[4] = 0; // Transfer bones
      if (getColor(nx, ny) > 0)
        bxy[2][getColor(nx, ny) - 1] = 10; // Duration of the effect(buff) is 10 goes (5 rounds)
      // if (killedi == 8) {
      //     alert("Blue Wins!");
      //     location.reload();
      // }
      // else if (killedii == 8) {
      //     alert("Red Wins!");
      //     location.reload();
      // }
      movePiece(x, y, nx, ny);
      board[x][y] = -1; board[nx][ny] = bxy; changeColor(x, y);
    }
    else { // Still alive; Knockback
      var kb = [0, 0];
      var sign = (x) => (x > 0 ? 1 : (x == 0 ? 0 : -1));
      kb[0] = sign(nx - x), kb[1] = sign(ny - y);
      var kbnx = nx + kb[0], kbny = ny + kb[1];
      if (inBoard(kbnx, kbny) && board[kbnx][kbny] == -1 && !inProducer(kbnx, kbny)) {
        movePiece(nx, ny, kbnx, kbny);
        board[kbnx][kbny] = board[nx][ny], board[nx][ny] = -1;
        changeColor(nx, ny);
      }
    }
    // if (bxy[3] <= 0) {
    //     if (bxy[0] == 0) document.getElementById("piece"
    //         + String(Number(bxy[0]) * 16 + Number(bxy[1]))).style = pos(killedi++, 9);
    //     else document.getElementById("piece"
    //         + String(Number(bxy[0]) * 16 + Number(bxy[1]))).style = pos(killedii++, 10);
    //     if (killedi == 8) {
    //         alert("Blue Wins!");
    //         location.reload();
    //     }
    //     else if (killedii == 8) {
    //         alert("Red Wins!");
    //         location.reload();
    //     }
    //     document.getElementById("piece"
    //         + String(Number(bxy[0]) * 16 + Number(bxy[1]))).onclick = function () { };
    //     board[x][y] = -1;
    // }
  }

  // Update scores
  $("#red-score").text(tot[0]);
  $("#blue-score").text(tot[1]);
  if (tot[0] >= 8) cAlert("<h2>Red wins!</h2>");
  if (tot[1] >= 8) cAlert("<h2>Blue wins!</h2>");

  // Process bone production
  turn++;
  if (turn % 5 == 0) {
    numBone++;
    updateBoneProducer();
  }

  // Revive pieces
  for (var i in reviveList) {
    var item = reviveList[i];
    item[1]--;
    if (item[1] == 0) {
      var rx, ry;
      if (item[0][0] == 0) {
        rx = 7, ry = 7;
        while (board[rx][ry] != -1 || inProducer(rx, ry)) {
          ry--;
          if (ry == -1) ry = 7, rx--;
        }
      }
      else {
        rx = 0, ry = 0;
        while (board[rx][ry] != -1 || inProducer(rx, ry)) {
          ry++;
          if (ry == 8) ry = 0, rx++;
        }
      }
      board[rx][ry] = [item[0][0], item[0][1], [0, 0], blood[item[0][1]], 0];
      revivePiece(i, rx, ry);
    }
  }

  // Process effect durations
  for (var i = 0; i < 8; i++) for (var j = 0; j < 8; j++)
    if (board[i][j] != -1)
      for (var k = 0; k < board[i][j][2].length; k++)
        board[i][j][2][k] = Math.max(board[i][j][2][k] - 1, 0);
}

function giveUp() {
  if (player == 0) {
    cAlert("<h2>Blue Wins!</h2>");
  }
  else {
    cAlert("<h2>Red Wins!</h2>");
  }
}