/**
 * Created by James on 12/11/2016.
 */
function isGridEmpty(grid) {
    for (var x = 0; x < grid.length; x++) {
        for (var y = 0; y < grid[x].length; y++) {
            if (grid[x][y] !== null && grid[x][y].type === "tile") {
                return 0;
            }
        }
    }
    return 1;
}

var rulesAllValid = [];
var ruleInEmptyLocation = function (grid, tile, x, y) {
    if (grid[x][y] === null || grid[x][y].type !== "tile") {
        return 1;
    }
    return 0;
};
rulesAllValid.push(ruleInEmptyLocation);

var ruleNextToTile = function (grid, tile, x, y) {
    if (grid[x - 1][y].type === "tile" ||
        grid[x + 1][y].type === "tile" ||
        grid[x][y - 1].type === "tile" ||
        grid[x][y + 1].type === "tile") {
        return 1;
    }
    return 0;
};
rulesAllValid.push(ruleNextToTile);

// function pushTileToArray(tiles, obj){
//     if(obj === null){
//         return;
//     } else if(obj !== "tile"){
//         return;
//     }
//     tiles.push(obj);
//     return tiles;
// }

var rulesAtLeastOneValid = [];
var getVariables = function (grid, tile, x, y) {
    var xTiles = [];
    // start at x and go left
    for (var a = x-1; a > x - 3; a--) {
        if(grid[a][y] && grid[a][y].type !== "tile"){
            break;
        }
        xTiles.push(grid[a][y]);
    }
    // start at x and go right
    for ( a = x+1; a < x + 3; a++) {
        if(grid[a][y] && grid[a][y].type !== "tile"){
            break;
        }
        xTiles.push(grid[a][y]);
    }
    // add the tile to be inserted
    xTiles.push(tile);

    var yTiles = [];
    // start at y and go up
    for ( a = y-1; a > y - 3; a--) {
        if(grid[x][a] && grid[x][a].type !== "tile"){
            break;
        }
        yTiles.push(grid[x][a]);
    }
    // start at x and go right
    for ( a = y+1; a < y + 3; a++) {
        if(grid[x][a] && grid[x][a].type !== "tile"){
            break;
        }
        yTiles.push(grid[x][a]);
    }
    // add the tile to be inserted
    yTiles.push(tile);

    var retVal = [];
    retVal.push({dimension: "x", tiles: xTiles});
    retVal.push({dimension: "y", tiles: yTiles});

    for (var j = 0; j < retVal.length; j++) {
        var tiles = retVal[j].tiles;
        var colours = [], shapes = [], numbers = [];
        var count = 0;
        for (var i = 0; i < tiles.length; i++) {
            count++;
            if (colours.indexOf(tiles[i].colour) === -1) {
                colours.push(tiles[i].colour)
            }
            if (shapes.indexOf(tiles[i].shape) === -1) {
                shapes.push(tiles[i].shape)
            }
            if (numbers.indexOf(tiles[i].number) === -1) {
                numbers.push(tiles[i].number)
            }
        }
        retVal[j].colours = colours;
        retVal[j].shapes = shapes;
        retVal[j].numbers = numbers;
        retVal[j].count = count;
    }

    return retVal;
};
var ruleNothingInCommon = function (grid, tile, x, y) {
    var retVal = getVariables(grid, tile, x, y);

    for (var j = 0; j < retVal.length; j++) {
        if (!(
            retVal[j].colours.length === retVal[j].count &&
            retVal[j].shapes.length === retVal[j].count &&
            retVal[j].numbers.length === retVal[j].count)) {
            return 0;
        }
    }
    return 1;
};
rulesAtLeastOneValid.push(ruleNothingInCommon);

var ruleTwoTheSame = function (grid, tile, x, y) {
    var retVal = getVariables(grid, tile, x, y);

    for (var j = 0; j < retVal.length; j++) {
        if (!(
            retVal[j].colours.length === retVal[j].count &&
            retVal[j].shapes.length === retVal[j].count &&
            retVal[j].numbers.length === retVal[j].count)) {
            return 0;
        }
    }
    return 1;
};
rulesAtLeastOneValid.push(ruleTwoTheSame);