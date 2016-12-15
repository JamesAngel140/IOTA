/**
 * Created by James on 08/11/2016.
 */
var size = 64;
function createGrid() {
    var grid = [];

    for (var x = 0; x < size; x++) {
        grid.push([]);
        for (var y = 0; y < size; y++) {
            grid[x].push(null);
        }
    }
    return grid;
}

function clearGrid(grid){
    for (var x = 0; x < size; x++) {
        for (var y = 0; y < size; y++) {
            if(grid[x][y] && grid[x][y].type === "tile") {
                grid[x][y].placed = false;
            } else {
                grid[x][y] = null;
            }
        }
    }
    return grid;
}

//http://codepen.io/GreenSock/pen/dPZLEp
//http://greensock.com/forums/topic/12047-sortable-grid-with-draggable-tiles-demo-put-contentimages-in-tiles/
//https://troolee.github.io/gridstack.js/
//http://jqueryui.com/sortable/