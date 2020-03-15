'use strict';

/*
svg data for chess pieces obtained from:
https://commons.wikimedia.org/w/index.php?title=Template:SVG_chess_pieces&oldid=345938729
*/

var ascii2name = {
  "K": "white king",
  "Q": "white queen",
  "R": "white rook",
  "B": "white bishop",
  "N": "white knight",
  "P": "white pawn",
  "k": "black king",
  "q": "black queen",
  "r": "black rook",
  "b": "black bishop",
  "n": "black knight",
  "p": "black pawn",
  " ": "empty square"
}

var ascii2svg = function(a) {
  if (a === " ") {
    return "";
  }
  const asciiPieces = "KQRBNPkqrbnp";
  const svgId = [
    "kl", "ql", "rl", "bl", "nl", "pl",
    "kd", "qd", "rd", "bd", "nd", "pd"
  ];
  let i = asciiPieces.indexOf(a);
  return `<img src="svg/Chess_${svgId[i]}t45.svg">`
};

function Chessboard(divId) {
  this.div = document.getElementById(divId);
  this.flipped = false;
  this.whiteToPlay = true;
  this.FEN = "";
}

Chessboard.prototype.expandPosition = function(posStr) {
  let expanded = "";
  for (let i = 0; i < posStr.length; i++) {
    if ("123456789".includes(posStr[i])) {
      let sCount = Number(posStr[i]);
      while (sCount) {
        expanded += " ";
        sCount--;
      }
    } else if ("KQRBNPkqrbnp".includes(posStr[i])) {
      expanded += posStr[i];
    }
  }
  return(expanded);
};

Chessboard.prototype.isDarkSquare = function(sq) {
  let f = "abcdefgh".indexOf(sq[0]);
  let r = Number(sq[1]);
  return((r + f) % 2 == 1);
};

Chessboard.prototype.renderFEN = function(FEN) {
  this.FEN = FEN;
  let squareNames = [];
  for (let i = 8; i; i--) {
    for (let j = 0; j < 8; j++) {
      squareNames.push("abcdefgh"[j] + i);
    }
  }
  let position = this.expandPosition(FEN.trim().split(" ")[0]);
  if (FEN.trim().split(" ")[1] === "w") {
    this.whiteToPlay = true;
  } else {
    this.whiteToPlay = false;
  }
  if (this.flipped) {
    squareNames.reverse();
    position = position.split("").reverse().join("");
  }
  let html = "";
  html += "<table>\n<tbody>\n"
  let rowCounter = 0;
  for (let i = 0; i < 64; i++) {
    if (rowCounter === 8) {
      html += "</tr>\n";
      rowCounter = 0;
    }
    if (rowCounter === 0) {
      html += "<tr>\n";
    }
    let sqColor = this.isDarkSquare(squareNames[i]) ? "dark" : "light";
    let pieceName = ascii2name[position[i]];
    html += `<td id="${squareNames[i]}" class="${sqColor}" title="${pieceName} at ${squareNames[i]}">`;
    html += `${ascii2svg(position[i])}</td>\n`;
    rowCounter++;
  }
  html += "</td>\n</tbody>\n</table>\n";
  html += "<p>";
  html += this.whiteToPlay ? "white to play" : "black to play";
  html += "</p>\n";
  this.div.innerHTML = html;
};

Chessboard.prototype.flip = function() {
  this.flipped = !(this.flipped);
  this.renderFEN(this.FEN);
};


// testing
var f = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
var cb = new Chessboard("chessboard");
cb.renderFEN(f);
var testhand = function(e) {
  let t = e.target;
  if (t.tagName === "IMG") {
    console.log(t.parentElement.attributes.id.nodeValue);
  } else {
    console.log(t.attributes.id.nodeValue);
  }
};
for (const element of cb.div.getElementsByTagName('td')){
  element.addEventListener('click', testhand);
}
