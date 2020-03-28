'use strict';

function stripPGNcomments(pgnstr) {
  let commentless = "";
  let termination;

  for (let i=0; i<pgnstr.length; i++) {
    if (termination) {
      if (pgnstr[i] === termination) {
        termination = false;
      }
    } else {
      if (pgnstr[i] === "{") {
        termination = "}";
      } else if (pgnstr[i] === ";") {
        termination = "\n";
      } else {
        commentless += pgnstr[i];
      }
    }
  }
  return commentless;
}

function tokenifyPGN(pgnstr) {
  const selfTerminated = "[]()<>.*";
  const symbolStart = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
  const symbolContinuation = symbolStart + "_+#=:-";
  let state = "default";
  let tokens = [];
  let token = "";
  let i = 0;

  while (i < pgnstr.length) {
    if (state === "default") {
      if (selfTerminated.includes(pgnstr[i])) {
        tokens.push(pgnstr[i++]);
      } else if (pgnstr[i] === "\"") {
        token += pgnstr[i++];
        state = "string";
      } else if (symbolStart.includes(pgnstr[i])) {
        token += pgnstr[i++];
        state = "symbol";
      } else if (pgnstr[i] === "$") {
        token += pgnstr[i++];
        state = "nag";
      } else {
        i++;
      }
    } else if (state === "string") {
      if (pgnstr[i] === "\"") {
        token += pgnstr[i++];
        tokens.push(token);
        token = "";
        state = "default";
      } else if (pgnstr[i] === "\\") {
        token += pgnstr[i] + pgnstr[i+1];
        i += 2;
      } else {
        token += pgnstr[i++];
      }
    } else if (state === "symbol") {
      if (symbolContinuation.includes(pgnstr[i])) {
        token += pgnstr[i++];
      } else {
        tokens.push(token);
        token = "";
        state = "default";
      }
    } else if (state === "nag") {
      if ("1234567890".includes(pgnstr[i])) {
        token += pgnstr[i++];
      } else {
        tokens.push(token);
        token = "";
        state = "default";
      }
    }
  }

  if (token) {
    tokens.push(token);
  }
  return tokens;
}

function processPGN(pgnstr) {
  return buildGameObjects(tokenifyPGN(stripPGNcomments(pgnstr)));
}

function buildGameObjects(pgnTokens) {
  let go = {};
  go.moveTextTokens = []
  let i = 0;
  let tagSection = true;
  let gameObjects = [];

  function parseMainLine(g) {
    const moveRe = /.*[a-h][1-8].*/;
    let mainline = [];
    let RAVlevel = 0;
    for (let i=1; i<g.moveTextTokens.length; i++) {
      let t = g.moveTextTokens[i];
      if (RAVlevel) {
        if (t === ")") {
          RAVlevel--;
        }
      } else {
        if (t === "(") {
          RAVlevel++;
        } else {
          if (moveRe.test(t)) {
            mainline.push(t);
          }
        }
      }
    }
    g["mainline"] = mainline;
  }

  while (i < pgnTokens.length) {
    if (tagSection) {
      if (pgnTokens[i] === "[") {
        go[pgnTokens[i+1]] = pgnTokens[i+2];
        i += 4;
      } else {
        tagSection = false;
      }
    } else {
      go.moveTextTokens.push(pgnTokens[i]);
      if (pgnTokens[i++] === go.Result.slice(1,-1)) {
        parseMainLine(go);
        gameObjects.push(go);
        go = {};
        go.moveTextTokens = [];
      }
    }
  }
  return gameObjects;
}

var test = document.getElementById("testpgn")
test = test.textContent;
test = processPGN(test);
test = test[0];
console.log(test.mainline);
