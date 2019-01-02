// add generation selection

var pokemonId = 1;
var cnv = "";
var ctx = "";

$("body").ready(function() {
    cnv = document.getElementById("processCanvas");
    ctx = cnv.getContext("2d");

    $("#startGame").click(function() {
        $("#startGame").hide();
        playAgain();
    });
    $("#playAgain").click(function() {
        playAgain();
    });
    $("#pokemonImg").hide();
    $("#pokemonName").hide();
    $("#playAgain").hide();
});


function showPokemon(usrInput) {
    pokemonId = Math.floor(Math.random() * 802 + 1);
    if(usrInput) {
        pokemonId = usrInput;
    }
    $.get(`https://pokeapi.co/api/v2/pokemon/${pokemonId}/`, function(response) {
        var pokemonName = "";
        pokemonName = response.species.name;
        var pokemonName = pokemonName[0].toUpperCase() + pokemonName.substr(1);
        $("#pokemonName").text(pokemonName);
        var pokemonImg = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/" + pokemonId + ".png";
        $("img#pokemonImg").attr("src", pokemonImg);
        var img = new Image();
        img.setAttribute('crossOrigin', 'anonymous');
        img.src = pokemonImg;
        img.onload = function() {
            makeSilhouette(img);
        }
    });
}

function makeSilhouette(img) {
    ctx.clearRect(0, 0, cnv.width, cnv.height);
    ctx.drawImage(img, 0, 0, cnv.width, cnv.height);    // draw the image to the canvas to grab the image data
    var imgData = ctx.getImageData(0, 0, cnv.width, cnv.height);
    var data = imgData.data;
    var imgDataLen = data.length;   // Better to set the length to a variable and not get the length everytime the loop is itterated
    for(i = 0; i < imgDataLen; i+=4){   // cycle through all pixel data and make opaque pixels black
        if((data[i] + data[i+1] + data[i+2]) / 3 <= 255) {
            data[i] = 0;
            data[i+1] = 0;
            data[i+2] = 0;
        } else {
            data[i+3] = 1;
        }
    }
    ctx.clearRect(0, 0, cnv.width, cnv.height);
    ctx.putImageData(imgData, 0, 0);    // draw the silhouette to the canvas

    countDown(10);
}

function countDown(time) {
    $("#guessTimer").text("Time: " + time);
    time -= 1;
    if(time < 5) {
        ctx.clearRect(0, 0, cnv.width, cnv.height);
    }
    if(time >= 0) {
        setTimeout(countDown, 1000, time=time);
    } else {
        submitName();
    }
}

function submitName() {
    $("#processCanvas").hide();
    $("#hiddenName").hide();
    $("#pokemonImg").show();
    $("#pokemonName").show();
    $("#playAgain").show();

    if(checkNames()) {
        var wins = Number($("#winCount").text()) + 1;
        $("#winCount").text(wins);
    } else {
        var losses = Number($("#lossCount").text()) + 1;
        $("#lossCount").text(losses);
    }
}

function checkNames() {
    actualName = $("#pokemonName").text().toUpperCase();
    guessedName = $("#guessName").val().toUpperCase();
    // get rid of any characters that could cause errors due to the api (example: "Mr. Mime" is stored as "mr-mime")
    actualName = actualName.replace(/ /g, "").replace(/-/g, "").replace(/\./g, "");
    guessedName = guessedName.replace(/ /g, "").replace(/-/g, "").replace(/\./g, "");
    var guessedLen = guessedName.length;
    var isWin = false;
    
    var nameCheck = actualName;
    var guessedCheck = guessedName;
    var j = 0;
    for(var i = 0; i < guessedLen; i++) {
        var prevCheck = nameCheck;
        // console.log("CHECK FOR: " + guessedCheck[j]);
        nameCheck = nameCheck.replace(guessedCheck[j], "");
        if(prevCheck != nameCheck) {
            guessedCheck = guessedCheck.replace(guessedCheck[j], "");
        } else {
            j++;
        }
        // console.log("ACTUAL: " + nameCheck);
        // console.log("GUESS: " + guessedCheck);
    }

    var errorTotal = (nameCheck.length + guessedCheck.length) / 2;
    var errorMargin = Math.ceil(actualName.length * 0.1)
    // console.log("ERROR TOTAL: " + errorTotal);
    // console.log("ERROR MARGIN: " + errorMargin);
    if(errorTotal >= errorMargin) {
        console.log("SHOULD LOSE");
    } else {
        console.log("SHOULD WIN");
        isWin = true;
    }

    // TLDR
    // iterate through the guessed name
        // remove the guessed letter inside the actual name if it is found
        // if the replace() changes the string, replace the guessed letter from the guessed string

        // last, average the lengths of the processed version of the actual name and processed version of the guessed name (if the guess was perfect, this should be 0)
        // *this average length is used as the name accuracy score - like golf, the lower the better
        // if the error total is less than or equal to the error margin, the user gets it correct

    return isWin;
}

function playAgain() {
    $("#pokemonImg").hide();
    $("#pokemonName").hide();
    $("#playAgain").hide();
    $("#processCanvas").show();
    $("#hiddenName").show();
    showPokemon();
}