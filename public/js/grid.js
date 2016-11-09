/**
 * Created by James on 08/11/2016.
 */
var size = 64;
var grid = [];

for (var x = 0; x < size; x++) {
    grid.push([]);
    for (var y = 0; y < size; y++) {
        grid[x].push(null);
    }
};

// console.log(grid);

//http://codepen.io/GreenSock/pen/dPZLEp
//http://greensock.com/forums/topic/12047-sortable-grid-with-draggable-tiles-demo-put-contentimages-in-tiles/
//https://troolee.github.io/gridstack.js/
//http://jqueryui.com/sortable/