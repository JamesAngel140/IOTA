/**
 * Created by James on 07/11/2016.
 */

var item = {shape:["square", "circle", "triangle", "cross"], colour:["blue", "red", "green", "yellow"], number:["1", "2", "3", "4"], deck:[]};


for (var i = 0; len = item.shape.length, i < len; i++) {
    for (var j = 0; len = item.colour.length, j < len; j++) {
        for (var k = 0; len = item.number.length, k < len; k++) {
            item.deck.push(item.shape[i] + " " + item.colour[j] + " " + item.number[k])
        }
    }
}

console.log(item.deck)