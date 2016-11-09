/**
 * Created by James on 07/11/2016.
 */

var  shapes=["square", "circle", "triangle", "cross"],
    colours=["blue", "red", "green", "yellow"],
    numbers=["1", "2", "3", "4"],
    deck=[];

shapes.forEach(function(shape){
    colours.forEach(function(colour) {
        numbers.forEach(function (number) {
            deck.push({shape: shape, colour: colour, number: number, type:"tile"});
        })
    })
});

console.log(deck);