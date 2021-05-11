// Copied from ybj's repo

function new_web(webUrl) {
    window.open(webUrl);
}
function open_web(webUrl) {
    location = webUrl;
}
function mathjax_dy(elementId) {
    if (!window.MathJax) {
        return;
    }
    window.MathJax.Hub.Queue(["Typeset", window.MathJax.Hub, document.getElementById(elementId)]);
}
function pos(x, y) {
    return "top: " + (8 + Number(x) * 51) + "px; left: " + (8 + Number(y) * 51) + "px;";
}
var board = [[-1, -1, -1, -1, -1, -1, -1, -1], [-1, -1, -1, -1, -1, -1, -1, -1],
[-1, -1, -1, -1, -1, -1, -1, -1], [-1, -1, -1, -1, -1, -1, -1, -1],
[-1, -1, -1, -1, -1, -1, -1, -1], [-1, -1, -1, -1, -1, -1, -1, -1],
[-1, -1, -1, -1, -1, -1, -1, -1], [-1, -1, -1, -1, -1, -1, -1, -1]];
var shown = [[-1, -1, -1, -1, -1, -1, -1, -1], [-1, -1, -1, -1, -1, -1, -1, -1],
[-1, -1, -1, -1, -1, -1, -1, -1], [-1, -1, -1, -1, -1, -1, -1, -1],
[-1, -1, -1, -1, -1, -1, -1, -1], [-1, -1, -1, -1, -1, -1, -1, -1],
[-1, -1, -1, -1, -1, -1, -1, -1], [-1, -1, -1, -1, -1, -1, -1, -1]];
var nam = [["ybj", "cyb"], ["wyx", "kyl"], ["lt", "qjh"],
["fyh", "sbw", "xry", "qhy", "yxd"], ["mbj", "kpq", "yzh", "hyk"],
["zcx"], ["ztzy"], ["lyf"]];
var nameCN = [["俞伯驹", "陈怿白"], ["王聿煊", "阚云雷"], ["刘涛", "钱锦鸿"],
["范语涵", "孙博为", "熊若渔", "邱泓议", "郁肖栋"], ["马伯驹", "阚皮球", "姚宗昊", "华奕开"],
["曾楚笑"], ["张田泽宇"], ["吕一凡"]];
var blood = [[4, 4], [2, 4], [4, 4], [3, 1, 4, 4, 6], [4, 4, 4, 4], [3], [4], [1]];
var player = 0;
var going = 0;
var killedi = 0, killedii = 0;
window.onload = function () {
    $("#board tr td").addClass("hide");
    for (let i = 0; i < 8; i++) {
        let xI = Math.floor(Math.random() * 1000) % 8,
            yI = Math.floor(Math.random() * 999) % 8;
        while (board[xI][yI] != -1) xI = Math.floor(Math.random() * 1000) % 8,
            yI = Math.floor(Math.random() * 999) % 8;
        let nameINum = Math.floor(Math.random() * 999) % nam[i].length;
        let nameI = nam[i][nameINum];
        document.body.innerHTML += "<div class=\"piece teami\" id=\"piece" + i
            + "\" style=\"" + pos(xI, yI) + "display: none;\" onclick=\"control(" + xI + ", " + yI
            + ")\">" + nameI + "</div>";
        board[xI][yI] = [0, i, nameINum, blood[i][nameINum]];
    }
    for (let i = 0; i < 8; i++) {
        let xI = Math.floor(Math.random() * 1000) % 8,
            yI = Math.floor(Math.random() * 999) % 8;
        while (board[xI][yI] != -1) xI = Math.floor(Math.random() * 1000) % 8,
            yI = Math.floor(Math.random() * 999) % 8;
        let nameINum = Math.floor(Math.random() * 999) % nam[i].length;
        let nameI = nam[i][nameINum];
        document.body.innerHTML += "<div class=\"piece teamii\" id=\"piece" + String(Number(i) + 16)
            + "\" style=\"" + pos(xI, yI) + "display: none;\" onclick=\"control(" + xI + ", " + yI
            + ")\">" + nameI + "</div>";
        board[xI][yI] = [1, i, nameINum, blood[i][nameINum]];
    }
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < nam[i].length; j++)
            document.body.innerHTML += "<div class=\"piece instr\" style=\""
                + pos(i, j + 12) + "\">" + nam[i][j] + "</div>";
    }
}
function showPiece(x, y, t) {
    $("#go").empty();
    $("#control").fadeOut();
    going = 0;
    let boardXY = board[x][y];
    $("#board").children("tr").eq(x).children("td").eq(y).removeClass("hide");
    if (boardXY != -1) document.getElementById("piece"
        + String(Number(boardXY[0]) * 16 + Number(boardXY[1]))).style.display = "inline";
    player = 1 - player;
    if (player == 0) document.getElementById("player").style.background = "red";
    else document.getElementById("player").style.background = "blue";
    shown[x][y] = 0;
    t.onclick = function () { };
}
function openName(name) {
    localStorage.setItem("school.resume.name", name);
    localStorage.setItem("school.resume.logged", "logged");
    new_web("../..");
}
function control(x, y) {
    $("#control").fadeToggle(function () {
        $("#blood").empty();
        let boardXY = board[x][y];
        let srcXY = "../../img/";
        if (nam[boardXY[1]][boardXY[2]] == "lyf") srcXY += "lyf.gif";
        else srcXY += nam[boardXY[1]][boardXY[2]] + ".png";
        document.getElementById("control-img").src = srcXY;
        document.getElementById("control-name").innerHTML = nameCN[boardXY[1]][boardXY[2]];
        document.getElementById("control").style.left = String(8 + (Number(y) + 1) * 51) + "px";
        document.getElementById("control").style.top = String(8 + (Number(x) + 1) * 51) + "px";
        for (let i = 0; i < boardXY[3]; i++) document.getElementById("blood").innerHTML
            += "<img src=\"../../img/heart.png\" style=\"width: 25px\">";
        if (player == boardXY[0] && going == 0) {
            going = 2;
            let dx = [-1, 0, 1, 0], dy = [0, -1, 0, 1];
            for (let d = 0; d < 4; d++) {
                let nx = Number(x) + Number(dx[d]), ny = Number(y) + Number(dy[d]);
                if (nx < 0 || nx >= 8 || ny < 0 || ny >= 8) continue;
                if (board[nx][ny][0] == player || shown[nx][ny] == -1) continue;
                if (board[nx][ny] == -1) document.getElementById("go").innerHTML
                    += "<div class=\"go-empty\" onclick=\"go(" + x + ", " + y + ", "
                    + nx + ", " + ny + ")\" style=\"" + pos(nx, ny) + "\"></div>";
                else if (board[nx][ny][0] != player && board[nx][ny][1] >= board[x][y][1]) {
                    document.getElementById("go").innerHTML
                        += "<div class=\"go-kill\" onclick=\"go(" + x + ", " + y + ", "
                        + nx + ", " + ny + ")\" style=\"" + pos(nx, ny) + "\"></div>";
                }
            }
        }
        if (going == 1) {
            $("#go").empty();
            going = 0;
        }
        if (going == 2) going = 1;
    });
}
function min(a, b) {
    if (a < b) return a; return b;
}
function go(x, y, nx, ny) {
    let bxy = board[x][y], nbxy = board[nx][ny];
    $("#go").empty();
    $("#control").fadeOut();
    going = 0;
    player = 1 - player;
    if (player == 0) document.getElementById("player").style.background = "red";
    else document.getElementById("player").style.background = "blue";
    if (nbxy == -1) {
        document.getElementById("piece"
            + String(Number(bxy[0]) * 16 + Number(bxy[1]))).onclick = function () {
                control(nx, ny);
            }
        document.getElementById("piece"
            + String(Number(bxy[0]) * 16 + Number(bxy[1]))).style = pos(nx, ny);
        board[x][y] = -1; board[nx][ny] = bxy;
    }
    else {
        board[nx][ny][3] -= 2;
        board[x][y][3]--;
        nbxy = board[nx][ny]; bxy = board[x][y];
        if (nbxy[3] <= 0) {
            if (nbxy[0] == 0) document.getElementById("piece"
                + String(Number(nbxy[0]) * 16 + Number(nbxy[1]))).style = pos(killedi++, 9);
            else document.getElementById("piece"
                + String(Number(nbxy[0]) * 16 + Number(nbxy[1]))).style = pos(killedii++, 10);
            if (killedi == 8) {
                alert("Blue Wins!");
                location.reload();
            }
            else if (killedii == 8) {
                alert("Red Wins!");
                location.reload();
            }
            document.getElementById("piece"
                + String(Number(nbxy[0]) * 16 + Number(nbxy[1]))).onclick = function () { };
            document.getElementById("piece"
                + String(Number(bxy[0]) * 16 + Number(bxy[1]))).onclick = function () {
                    control(nx, ny);
                }
            document.getElementById("piece"
                + String(Number(bxy[0]) * 16 + Number(bxy[1]))).style = pos(nx, ny);
            board[x][y] = -1; board[nx][ny] = bxy;
        }
        if (bxy[3] <= 0) {
            if (bxy[0] == 0) document.getElementById("piece"
                + String(Number(bxy[0]) * 16 + Number(bxy[1]))).style = pos(killedi++, 9);
            else document.getElementById("piece"
                + String(Number(bxy[0]) * 16 + Number(bxy[1]))).style = pos(killedii++, 10);
            if (killedi == 8) {
                alert("Blue Wins!");
                location.reload();
            }
            else if (killedii == 8) {
                alert("Red Wins!");
                location.reload();
            }
            document.getElementById("piece"
                + String(Number(bxy[0]) * 16 + Number(bxy[1]))).onclick = function () { };
            board[x][y] = -1;
        }
    }
}
function giveUp() {
    if (player == 0) {
        alert("Blue Wins!");
        location.reload();
    }
    else {
        alert("Red Wins!");
        location.reload();
    }
}