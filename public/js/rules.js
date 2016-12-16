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
function unique(arr) {
    var a = [];
    for (var i=0, l=arr.length; i<l; i++)
        if (a.indexOf(arr[i]) === -1 && arr[i] !== '')
            a.push(arr[i]);
    return a;
}
function getVariables(grid, tile, x, y) {
    var xTiles = [];
    // start at x and go left
    var a = x - 1;
    while(a > x - 4 && grid[a][y] && grid[a][y].type === "tile"){
        xTiles.push(grid[a][y]);
        a--;
    }
    // start at x and go right
    a = x + 1;
    while(a < x + 4 && grid[a][y] && grid[a][y].type === "tile"){
        xTiles.push(grid[a][y]);
        a++;
    }
    // add the tile to be inserted
    xTiles.push(tile);

    var yTiles = [];
    // start at y and go up
    a = y - 1;
    while(a > y - 4 && grid[x][a] && grid[x][a].type === "tile"){
        yTiles.push(grid[x][a]);
        a--;
    }
    // start at y and go down
    a = y + 1;
    while(a < y + 4 && grid[x][a] && grid[x][a].type === "tile"){
        yTiles.push(grid[x][a]);
        a++;
    }
    // add the tile to be inserted
    yTiles.push(tile);

    var retVal = [];
    retVal.push({dimension: "x", tiles: xTiles});
    retVal.push({dimension: "y", tiles: yTiles});

    retVal.forEach(function(item){
        var colours = [], shapes = [], numbers = [];
        var tiles = item.tiles;
        tiles.forEach(function(tile){
            colours.push(tile.colour);
            shapes.push(tile.shape);
            numbers.push(tile.number);
        });

        item.colours = unique(colours);
        item.shapes = unique(shapes);
        item.numbers = unique(numbers);
        item.count = tiles.length;
    });

    return retVal;
}

var rulesAllValid = [];

var ruleInEmptyLocation = function (grid, tile, x, y) {
    if (grid[x][y] === null || grid[x][y].type !== "tile") {
        console.log("ruleInEmptyLocation true");
        return 1;
    }
    console.log("ruleInEmptyLocation false");
    return 0;
};
rulesAllValid.push(ruleInEmptyLocation);

var ruleNextToTile = function (grid, tile, x, y) {
    if ((grid[x - 1][y] && grid[x - 1][y].type === "tile") ||
        (grid[x + 1][y] && grid[x + 1][y].type === "tile") ||
        (grid[x][y - 1] && grid[x][y - 1].type === "tile") ||
        (grid[x][y + 1] && grid[x][y + 1].type === "tile")) {
        console.log("ruleNextToTile true");
        return 1;
    }
    console.log("ruleNextToTile false");
    return 0;
};
rulesAllValid.push(ruleNextToTile);

var ruleNextToHistoryTile = function (grid, tile, x, y, previousTiles) {
    if(previousTiles.length === 0){
        return 1;
    }
    var valid = false;
    for(var i = 0; i < previousTiles.length; i++){
        if(Math.abs(x - previousTiles[i].x) === 1 && (Math.abs(y - previousTiles[i].y) === 1)){
            valid = true;
        }
    }
    return valid;
};
rulesAllValid.push(ruleNextToHistoryTile);

var ruleNewTileInALine = function (grid, tile, x, y, previousTiles) {
    var tiles = previousTiles.map(function(item){return item}); // copy list
    tile.x = x;
    tile.y = y;
    tiles.push(tile);

    var xs = [];
    var ys = [];
    tiles.forEach(function (item) {
        if (xs.indexOf(item.x) === -1) {
            xs.push(item.x);
        }
        if (ys.indexOf(item.y) === -1) {
            ys.push(item.y);
        }
    });
    console.log("ruleNewTileInALine", ys.length === 1 || xs.length === 1);
    return ys.length === 1 || xs.length === 1
};
rulesAllValid.push(ruleNewTileInALine);

var rulesAtLeastOneValid = [];

var ruleNothingInCommon = function (grid, tile, x, y, index) {
    var retVal = getVariables(grid, tile, x, y);
    var axis = retVal[index];

    var colours = axis.colours.length;
    var shapes = axis.shapes.length;
    var numbers = axis.numbers.length;
    var count = axis.count;

    if (colours === count &&
        shapes === count &&
        numbers === count ) {
        console.log("ruleNothingInCommon", index, true);
        return 1;
    } else {
        console.log("ruleNothingInCommon", index, false);
        return 0;
    }
};
rulesAtLeastOneValid.push(ruleNothingInCommon);

var ruleOneTheSame = function (grid, tile, x, y, index) {
    var retVal = getVariables(grid, tile, x, y);
    var axis = retVal[index];

    var colours = axis.colours.length;
    var shapes = axis.shapes.length;
    var numbers = axis.numbers.length;
    var count = axis.count;

    if ((colours === 1 && shapes === count && numbers === count ) ||
        (colours === count && shapes === 1 && numbers === count ) ||
        (colours === count && shapes === count && numbers === 1)) {
        console.log("ruleOneTheSame", index, true);
        return 1;
    } else {
        console.log("ruleOneTheSame", index, false);
        return 0;
    }
};
rulesAtLeastOneValid.push(ruleOneTheSame);

var ruleTwoTheSame = function (grid, tile, x, y, index) {
    var retVal = getVariables(grid, tile, x, y);
    var axis = retVal[index];

        var colours = axis.colours.length;
        var shapes = axis.shapes.length;
        var numbers = axis.numbers.length;
        var count = axis.count;

        if ((colours === 1 && shapes === 1 && numbers === count) ||
            (colours === 1 && shapes === count && numbers === 1) ||
            (colours === count && shapes === 1 && numbers === 1)) {
            console.log("ruleTwoTheSame", index, true);
            return 1;
        } else {
            console.log("ruleTwoTheSame", index, false);
            return 0;
        }
};
rulesAtLeastOneValid.push(ruleTwoTheSame);

function isValidMove(grid, newTile, x, y, tilesPlaced){
    // all rulesAllValid must be valid
    var allValidCount = 0;
    rulesAllValid.forEach(function(rule){
        allValidCount += rule(grid, newTile, x, y, tilesPlaced);
    });

    // one or more of rulesAtLeastOne needs to be valid in x and y direction
    var atLeastOneValidCountX = 0;
    rulesAtLeastOneValid.forEach(function(rule){
        atLeastOneValidCountX += rule(grid, newTile, x, y, 0);
    });
    var atLeastOneValidCountY = 0;
    rulesAtLeastOneValid.forEach(function(rule){
        atLeastOneValidCountY += rule(grid, newTile, x, y, 1);
    });

    return  allValidCount === rulesAllValid.length && atLeastOneValidCountX >= 1 && atLeastOneValidCountY >= 1;
}
