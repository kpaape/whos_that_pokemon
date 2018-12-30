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
    console.log(time);
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
    if($("#pokemonName").text().toUpperCase() == $("#guessName").val().toUpperCase()) {
        var wins = Number($("#winCount").text()) + 1;
        $("#winCount").text(wins);
    } else {
        var losses = Number($("#lossCount").text()) + 1;
        $("#lossCount").text(losses);
    }
}

function playAgain() {
    $("#pokemonImg").hide();
    $("#pokemonName").hide();
    $("#playAgain").hide();
    $("#processCanvas").show();
    $("#hiddenName").show();
    showPokemon();
}