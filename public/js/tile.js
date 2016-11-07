/**
 * Created by James on 07/11/2016.
 */

var shape = ["square", "circle", "triangle", "cross"], colour = ["blue", "red", "green", "yellow"], number = ["1", "2", "3", "4"], deck = [];

for (var i = 0; len = shape.length, i < len; i++) {
    for (var j = 0; len = colour.length, j < len; j++) {
        for (var k = 0; len = number.length, k < len; k++) {
            //deck.push(shape[i] + " " + colour[j] + " " + number[k])
            deck.push({shape: shape[i], colour: colour[j], number: number[k]});
        }
    }
}
