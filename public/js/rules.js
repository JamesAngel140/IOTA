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
var getVariables = function (grid, tile, x, y) {
    var xTiles = [];
    // start at x and go left
    for (var a = x - 1; a > x - 3; a--) {
        if (grid[a][y] && grid[a][y].type !== "tile") {
            continue;
        }
        xTiles.push(grid[a][y]);
    }
    // start at x and go right
    for (a = x + 1; a < x + 3; a++) {
        if (grid[a][y] && grid[a][y].type !== "tile") {
            continue;
        }
        xTiles.push(grid[a][y]);
    }
    // add the tile to be inserted
    xTiles.push(tile);

    var yTiles = [];
    // start at y and go up
    for (a = y - 1; a > y - 3; a--) {
        if (grid[x][a] && grid[x][a].type !== "tile") {
            continue;
        }
        yTiles.push(grid[x][a]);
    }
    // start at x and go right
    for (a = y + 1; a < y + 3; a++) {
        if (grid[x][a] && grid[x][a].type !== "tile") {
            continue;
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

    if (colours === count && shapes === count && numbers === count ) {
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

    if ((colours === 1 && shapes > 1 && numbers > 1 ) ||
        (colours > 1 && shapes === 1 && numbers > 1 ) ||
        (colours > 1 && shapes > 1 && numbers === 1)) {
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

        if ((colours === 1 && shapes === 1 && numbers > 1) ||
            (colours === 1 && shapes > 1 && numbers === 1) ||
            (colours > 1 && shapes === 1 && numbers === 1)) {
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
};
