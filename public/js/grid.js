/**
 * Created by James on 08/11/2016.
 */
function grid(size) {
    this.size = 64
}


var cells = [];

for (var x = 0; x < this.size; x++) {
    var row = cells[x] = [];

    for (var y = 0; y < this.size; y++) {
        row.push(null);
    }
};

console.log(grid)

//http://codepen.io/GreenSock/pen/dPZLEp
//http://greensock.com/forums/topic/12047-sortable-grid-with-draggable-tiles-demo-put-contentimages-in-tiles/
//https://troolee.github.io/gridstack.js/
//http://jqueryui.com/sortable/