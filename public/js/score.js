/**
 * Created by james on 26/11/2016.
 */
function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function getXYTiles(grid, x, y) {
    var xTiles = [];
    // start at x and go left
    var a = x - 1;
    while (a > x - 4 && grid[a][y] && grid[a][y].type === "tile") {
        xTiles.push(grid[a][y]);
        a--;
    }
    // start at x and go right
    a = x + 1;
    while (a < x + 4 && grid[a][y] && grid[a][y].type === "tile") {
        xTiles.push(grid[a][y]);
        a++;
    }
    var yTiles = [];
    // start at y and go up
    a = y - 1;
    while (a > y - 4 && grid[x][a] && grid[x][a].type === "tile") {
        yTiles.push(grid[x][a]);
        a--;
    }
    // start at y and go down
    a = y + 1;
    while (a < y + 4 && grid[x][a] && grid[x][a].type === "tile") {
        yTiles.push(grid[x][a]);
        a++;
    }

    return {x: xTiles, y: yTiles};
}

function calculateScore(originlGrid, originalTilesHistory) {
    var score = 0;
    var grid = clone(originlGrid); // don't use the current grid because we mustn't change it
    var doubleIt = 0;
    var tilesHistory = [];

    // if we have used all 4 tile double the core
    if (originalTilesHistory.length === 4) {
        doubleIt++;
    }

    // update the grid to mark all tile plces with tileHistory true
    originalTilesHistory.forEach(function (tmp) {
        tile = grid[tmp.x][tmp.y];
        tile.tileHistory = true;
    });

    // add some additional attributes to the tiles and build the tile history from the grid
    grid.forEach(function (row) {
        row.forEach(function (tile) {
            if (tile && tile.type === 'tile') {
                tile.xScore = 0;
                tile.yScore = 0;
                if (tile.tileHistory) {
                    tilesHistory.push(tile);
                }
            }
        })
    });

    tilesHistory.forEach(function (hTile) {
        xyTiles = getXYTiles(grid, hTile.x, hTile.y);

        xyTiles.x.forEach(function (tile) {
            tile.xScore = parseInt(tile.number);
            hTile.xScore = parseInt(hTile.number);
        });

        xyTiles.y.forEach(function (tile) {
            tile.yScore = parseInt(tile.number);
            hTile.yScore = parseInt(hTile.number);
        });
    });

    grid.forEach(function (row) {
        row.forEach(function (tile) {
            if (tile && tile.type === 'tile') {
                score += tile.xScore;
                score += tile.yScore;
            }
        })
    });

    // where we have scores count if we have a 4 in a row
    for (var x = 0; x < size; x++) {
        var test = 0;
        for (var y = 0; y < size; y++) {
            var tile = grid[x][y];
            if (tile && tile.type === 'tile' && tile.yScore) {
                test++;
            }
        }
        if (test === 4) {
            doubleIt++;
        }
    }
    for (var y = 0; y < size; y++) {
        var test = 0;
        for (var x = 0; x < size; x++) {
            var tile = grid[x][y];
            if (tile && tile.type === 'tile' && tile.xScore) {
                test++;
            }
        }
        if (test === 4) {
            doubleIt++;
        }
    }

    for (var i = 0; i < doubleIt; i++) {
        score = score * 2;
    }
    return score;
}