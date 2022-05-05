// Please see documentation at https://docs.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.

// Code to read the all words dictionary

// Code to read the rarity score table



// Code to read JSON of puzzle details (high score etc, currently causes errors)
//var puzzlesDetail = [];
//// var text;
//var xmlhttp3;
//if (window.XMLHttpRequest) { // code for IE7+, Firefox, Chrome, Opera, Safari
//	xmlhttp3 = new XMLHttpRequest();
//} else { // code for IE6, IE5
//	xmlhttp3 = new ActiveXObject("Microsoft.XMLHTTP");
//}
//xmlhttp3.onreadystatechange = function () {
//	if (xmlhttp3.readyState == 4 && xmlhttp3.status == 200) {
//		var text3 = xmlhttp3.responseText;
//		// Now convert it into array using regex
//		puzzlesDetail = text3; // /\n|\r/g
//		puzzlesDetail = JSON.parse(puzzlesDetail);
//		//allWords = allWords.join();
//	}
//}
//xmlhttp3.open("GET", "puzzles.txt", true);
//xmlhttp3.send();

//$(window).load(function () {

// Initializing variables
	var puzzles = ["PROPERTIES", "COMPUTER", "EXPLOSION", "CHAIRMAN","UNIVERSITY","STATISTICS","BEHAVIORAL","DICTIONARY","AMPLIFIER","LIBRARIAN","PROGRAMMER","HOSPITAL"];
	var LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

	var randPuzzleNum = Math.floor(Math.random() * (puzzles.length));
	//const fs = require('fs');
	var puzzle = puzzles[randPuzzleNum];
	var green = '#ccffcc';
	var blue = '#ccccff';

	var xs = new Array(puzzle.length + 1); // x coords of letter tiles
	var ys = new Array(puzzle.length + 1); // y coords of letter tiles
	var pw = new Array(Math.ceil(puzzle.length / 2)); //potential words
	var words = new Array(Math.ceil(puzzle.length / 2)); //true words
	var letterTiles = new Array(puzzle.length);

	var tw = 70; //tileWidth
	var tp = 0; //tilePadding
	var snapLeft = $("#snaptarget")[0].offsetLeft; // coord for left side of game box
	var snapTop = $("#snaptarget")[0].offsetTop; // coord for top of game box
	var wordArray = Array.from(Array(puzzle.length), () => new Array(puzzle.length).fill(" "));
	var draggableArray = Array.from(Array(puzzle.length), () => new Array(puzzle.length).fill(""));
	//var canvas = document.getElementById("snaptarget");
	//var ctx = canvas.getContext("2d");
	//for (var i = 0; i < puzzle.length; i++) {
	//	ctx.moveTo(0, 72.5 + (tw + tp) * i); ctx.lineTo((tw + tp) * puzzle.length, 72.5 + (tw + tp) * i); ctx.strokeStyle = "#6c757d";ctx.stroke();
	//}

// This is run automatically when game begins, and when Random puzzle button is clicked.
// Generates draggable letter tiles with properties based on the selected Puzzle.
function gameStart() {
	// This function sets up the HTML elements for the draggable letter tiles, and the objects that represent them
	$(function () {
		let tab = ``;
		for (i = 0; i < puzzle.length; i++) {
			let tmp = {};
			let draggablei = "draggable" + i;
			tmp['id'] = draggablei;
			tmp['letter'] = puzzle.substr(i, 1);
			tmp['bg'] = 'white';
			letterTiles[i] = tmp;
			tab += `<div id="${draggablei}" class="draggable ui-widget-content" name="${puzzle.substr(i, 1)}">
  	    <div class="center">
    	    <p>${puzzle.substr(i, 1)}</p>
  	    </div>
	    </div>`;
		}
		document.getElementById("letterStart").innerHTML = tab;
	});

	//document.getElementById("puzzleName").innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;" + puzzle;
	$("#puzzleName").html("&nbsp;&nbsp;&nbsp;&nbsp;" + puzzle);

	// This function initializes and sets the properties of each draggable letter.
	$(function () {
		snapLeft = $("#snaptarget")[0].offsetLeft;
		snapTop = $("#snaptarget")[0].offsetTop;
		for (i = 0; i < puzzle.length; i++) {
			let draggablei = "#draggable" + i;
			let it = parseInt(i.toString());
			$(draggablei).draggable({
				snap: ".ui-widget-header", grid: [tw, tw],
				stop: function (event, ui) {
					var pos = $(this).offset();
					//console.log(pos);
					if (pos.top > (puzzle.length + 2) * tw || checkWordArray(pos.left, pos.top)) {
						$(draggablei).css({ 'left': '0px', 'top': '0px' });
						xs[it] = pos.left;
						ys[it] = pos.top;
						setLetterTileXY(xs[it], ys[it], it);
					} else {
						clearPrevWordArray(xs[it], ys[it]);
						xs[it] = pos.left;
						ys[it] = pos.top;
						setWordArray(it);
						setLetterTileXY(xs[it], ys[it], it);
					}
				},
				containment: [snapLeft - 1, snapTop - 1, snapLeft + (puzzle.length * tw), snapTop + (puzzle.length + 1) * tw]
			});

			xs[it] = $(draggablei)[0].offsetLeft;
			ys[it] = $(draggablei)[0].offsetTop;
			setLetterTileXY(xs[it], ys[it], it);
		}
	});
	document.getElementById("snaptarget").style.width = (tw * (puzzle.length + 1)-30) + "px";
	document.getElementById("snaptarget").style.height = (tw * (puzzle.length + 1) - 30) + "px";
}

gameStart();

// Stores the current location properties of the draggable to its object representation
	function setLetterTileXY(x, y, i) {
		letterTiles[i]['xs'] = x;
		letterTiles[i]['ys'] = y;
		letterTiles[i]['top'] = Math.round((y - snapTop) / tw);
		letterTiles[i]['left'] = Math.round((x - snapLeft) / tw);
	}

// Stores letters in the word array based on tile position onscreen
	function setWordArray(it) {
		let di = "#draggable" + it;
		let diLeft = Math.round(($(di)[0].offsetLeft - snapLeft) / tw);
		let diTop = Math.round(($(di)[0].offsetTop - snapTop) / tw);
		wordArray[diTop][diLeft] = $(di).attr("name");
		draggableArray[diTop][diLeft] = it;
	}

// Checks if the word array is empty at the queried location, returns true/false
	function checkWordArray(x, y) {
		let diLeft = Math.round((x - snapLeft) / tw);
		let diTop = Math.round((y - snapTop) / tw);
		return wordArray[diTop][diLeft] !== " ";
	}

// After moving a tile within the playfield, clears the previous entry in the word array so no duplicates
	function clearPrevWordArray(x, y) {
		if (y <= (puzzle.length + 2) * tw) {
			let diLeft = Math.round((x - snapLeft) / tw);
			let diTop = Math.round((y - snapTop) / tw);
			wordArray[diTop][diLeft] = " ";
			draggableArray[diTop][diLeft] = "";
		}
	}

// Creates an array containing just the letters present in the current word array
	function getWordArrayLetters() {
		let lets = [];
		for (let i = 0; i < wordArray.length; i++) {
			lets = lets.concat(removeBlank(wordArray[i]));
		}
		return lets;
	}

// Removes empty entries from an array
	function removeEmpty(arr) {
		const results = arr.filter(element => {
			return element !== '';
		});
		return results;
	}

// Removes blank entries from an array
	function removeBlank(arr) {
		const results = arr.filter(element => {
			return element !== ' ';
		});
		return results;
	}

// Checks if the supplied word is in the allWords dictionary of accepted words
	function checkWord(word) {
		let b = false;
		let tmp;
		for (let i = 0; i < allWords.length; i++) {
			tmp = allWords[i];
			if (tmp == word || (tmp + "S") == word) {
				b = true;
				break;
			}
		}
		return b;
	}

// Creates an array of potential words from adjacent letter tiles in the word array playfield
	function getPotentialWords() {
		//check left-right for potential words
		let k = 0;
		for (let i = 0; i < wordArray.length; i++) {
			let tmp = wordArray[i].join("").trim().split(" ");
			for (let j = 0; j < tmp.length; j++) {
				if (tmp[j].length > 1) {
					pw[k] = tmp[j];
					k++;
				}
			}
		}

		//check up-down for potential words
		for (let i = 0; i < wordArray.length; i++) {
			let tmp = "";
			for (let j = 0; j < wordArray.length; j++) {
				tmp += wordArray[j][i];
			}
			tmp = tmp.trim().split(" ");
			for (let j = 0; j < tmp.length; j++) {
				if (tmp[j].length > 1) {
					pw[k] = tmp[j];
					k++;
				}
			}
		}
		pw = removeEmpty(pw);
		return pw;
	}

// Gives each letter tile in the playfield that is part of an accepted word a green background (or blue if accepted more than once)
	function getGreenTiles() {

		let darkgreen = '#aaddaa';
		// horizontal green tiles
		for (let i = 0; i < wordArray.length; i++) {
			let tmp = wordArray[i].join("");
			if (tmp.trim().length > 0) {
				for (let j = 0; j < words.length; j++) {
					if (tmp.includes(words[j])) {
						let ind = tmp.indexOf(words[j]);
						for (let k = 0; k < words[j].length; k++) {
							let dn = draggableArray[i][(ind + k)];
							let di = "#draggable" + dn;
							$(di)[0].style['background-color'] = green;
							letterTiles[dn]['bg'] = green;
						}

					}
				}
			}
		}

		//vertical green tiles + blue for multiwords
		for (let i = 0; i < wordArray.length; i++) {
			let tmp = "";
			for (let j = 0; j < wordArray.length; j++) {
				tmp += wordArray[j][i];
			}
			if (tmp.trim().length > 0) {
				for (let j = 0; j < words.length; j++) {
					if (tmp.includes(words[j])) {
						let ind = tmp.indexOf(words[j]);
						for (let k = 0; k < words[j].length; k++) {
							let dn = draggableArray[(ind + k)][i];
							let di = "#draggable" + dn;
							if (letterTiles[dn]['bg'] == green) {
								$(di)[0].style['background-color'] = blue;
								letterTiles[dn]['bg'] = blue;
							} else {
								$(di)[0].style['background-color'] = green;
								letterTiles[dn]['bg'] = green;
							}

						}

					}
				}
			}
		}
	}

// Ends the current game, colors unused tiles red, calculates and displays the score information
	function scoreAnswer() {
		document.getElementById("instructions").style.visibility = "hidden";
		document.getElementById("submit").disabled = true;
		document.getElementById("scoreResults").style.visibility = "visible";
		//document.getElementById("letterStart").style.visibility = "hidden";
		// reds out any tiles left behind
		for (let i = 0; i < puzzle.length; i++) {
			let di = "#draggable" + i;
			if ($(di)[0].offsetTop > (puzzle.length + 2) * tw) {
				$(di)[0].style['background-color'] = '#ffcccc';
				letterTiles[i]['bg'] = '#ffcccc';
			}

		}

		// Find Total Words score:
		pw = getPotentialWords();
		// get true words out of potential words
		for (let i = 0; i < pw.length; i++) {
			if (checkWord(pw[i])) { // allWords.includes(pw[i])
				words[i] = pw[i];
			}
		}
		words = removeEmpty(words);
		getGreenTiles();
		document.getElementById("scoreNumWords").innerHTML = `Total Words: ${words.length} &emsp; ${words.join()} &emsp; Score &times;${words.length}`;

		// Find Letters Used score:
		let lun = 0;
		for (let i = 0; i < puzzle.length; i++) {
			if (letterTiles[i]['bg'] == blue || letterTiles[i]['bg'] == green) {
				lun++;
			}
		}

		let lu = getWordArrayLetters();
		let lus = lun / puzzle.length;
		document.getElementById("scoreLettersUsed").innerHTML = `Letters Used: ${lun}/${puzzle.length} &emsp; &emsp; Score &times;${Math.round(lus * 100) / 100}`;


		// Find Rarity score:
		let bs = 0;
		for (let i of lu) {
			bs += rarityScore[i];
		}
		let ar = bs / lu.length; //average rarity
		document.getElementById("scoreBase").innerHTML = `Base Score: &emsp; (Letter Rarity) &emsp;  ${Math.round(bs * 100) / 100}`;

		// Find blue tile score:
		let bt = 0;
		for (let i = 0; i < puzzle.length; i++) {
			if (letterTiles[i]['bg'] == blue) {
				bt++;
            }
        }
		let bts = bt + 1;
		document.getElementById("scoreBlue").innerHTML = `Blue Tiles: ${bt} &emsp; &emsp;  Score &times;${bts}`;

		let ts = bs * lus * words.length * bts
		document.getElementById("scoreTotal").innerHTML = `Total Score: &emsp; &emsp; ${Math.round(ts * 100) / 100}`


}

// Ends the current game and starts a new game with a Random puzzle chosen from puzzles.
function randomPuzzle() {
	document.getElementById("instructions").style.visibility = "visible";
	document.getElementById("submit").disabled = false;
	document.getElementById("scoreResults").style.visibility = "hidden";
	for (let i = 0; i < puzzle.length; i++) {
		let di = "draggable" + i;
		document.getElementById(di).style.visibility = "hidden";
	}

	randPuzzleNum = Math.floor(Math.random() * (puzzles.length));
	puzzle = puzzles[randPuzzleNum];
	xs = new Array(puzzle.length + 1); // x coords of letter tiles
	ys = new Array(puzzle.length + 1); // y coords of letter tiles
	pw = new Array(Math.ceil(puzzle.length / 2)); //potential words
	words = new Array(Math.ceil(puzzle.length / 2)); //true words
	letterTiles = new Array(puzzle.length);
	snapLeft = $("#snaptarget")[0].offsetLeft; // coord for left side of game box
	snapTop = $("#snaptarget")[0].offsetTop; // coord for top of game box
	wordArray = Array.from(Array(puzzle.length), () => new Array(puzzle.length).fill(" "));
	draggableArray = Array.from(Array(puzzle.length), () => new Array(puzzle.length).fill(""));
	gameStart();

	for (let i = 0; i < puzzle.length; i++) {
		let di = "draggable" + i;
		document.getElementById(di).style.visibility = "visible";
	}

}


	//function splitCheck(w) {
	//	let ws = new Array(w.length);
	//	let tp = w.split(" ");
	//	let l = 0;
	//	for (let k = 0; k < tp.length; k++) {
	//		if ()
	//    }
	//}




	// This creates the rarityScore json object stored in rarityScore2.txt
	//let letterCount = {};
	//let rarityScore = {};
	//function calculateRarityTable(wa) {
	//	for (let i = 0; i < LETTERS.length; i++) {
	//		letterCount[LETTERS[i]] = 0;
	//	}

	//	for (let i = 0; i < wa.length; i++) {
	//		let tmp = wa[i];
	//			for (let j = 0; j < tmp.length; j++) {
	//				letterCount[tmp[j]] += 1;
	//            }
	//	}

	//	let countSum = 0;
	//	for (let i = 0; i < LETTERS.length; i++) {
	//		countSum += letterCount[LETTERS[i]];
	//	}

	//	let minRS = 1;
	//	let maxRS = 0;
	//	for (let i = 0; i < LETTERS.length; i++) {
	//		rarityScore[LETTERS[i]] = 1 - letterCount[LETTERS[i]] / countSum; // Math.round(... /.01)*.01
	//		if (rarityScore[LETTERS[i]] > maxRS) { maxRS = rarityScore[LETTERS[i]]; }
	//		if (rarityScore[LETTERS[i]] < minRS) { minRS = rarityScore[LETTERS[i]];}
	//	}

	//	for (let i = 0; i < LETTERS.length; i++) {
	//		rarityScore[LETTERS[i]] = (rarityScore[LETTERS[i]] - minRS) / (maxRS - minRS);
	//	}

	//	for (let i = 0; i < LETTERS.length; i++) {
	//		rarityScore[LETTERS[i]] = parseFloat((Math.round(rarityScore[LETTERS[i]] / .01) * .01).toString().substring(0, 4));
	//	}
	//}
	// calculateRarityTable(allWords);

//}
