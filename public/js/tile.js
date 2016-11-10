/**
 * Created by James on 07/11/2016.
 */

// Create the 3 variables of a tile
var shapes=["square", "circle", "triangle", "cross"],
    colours=["blue", "red", "green", "yellow"],
    numbers=["1", "2", "3", "4"],
    deck=[];

// using the variables above create a deck of cards
shapes.forEach(function(shape){
    colours.forEach(function(colour) {
        numbers.forEach(function (number) {
            deck.push({shape: shape, colour: colour, number: number, type:"tile"});
        })
    })
});

// The Fisher-Yates (aka Knuth) Shuffle.
// See https://github.com/coolaj86/knuth-shuffle
// You can see a great visualization here (and the original post linked to this)
function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

// shuffle the deck so that it has a random order
deck = shuffle(deck);
//console.log(deck);

var hand = [];

function dealHand(){
    for(var i = 0; i < 4; i++){
        hand.push(deck.pop());
    }
}