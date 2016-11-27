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
    while (a > x - 3 && grid[a][y] && grid[a][y].type === "tile") {
        //if (!grid[a][y].tileHistory) {
        xTiles.push(grid[a][y]);
        //}
        a--;
    }
    // start at x and go right
    a = x + 1;
    while (a < x + 3 && grid[a][y] && grid[a][y].type === "tile") {
        //if (!grid[a][y].tileHistory) {
        xTiles.push(grid[a][y]);
        //}
        a++;
    }

    var yTiles = [];
    // start at y and go up
    a = y - 1;
    while (a > y - 3 && grid[x][a] && grid[x][a].type === "tile") {
        //if (!grid[x][a].tileHistory) {
        yTiles.push(grid[x][a]);
        //}
        a--;
    }
    // start at y and go down
    a = y + 1;
    while (a < y + 3 && grid[x][a] && grid[x][a].type === "tile") {
        //if (!grid[x][a].tileHistory) {
        yTiles.push(grid[x][a]);
        //}
        a++;
    }

    return {x: xTiles, y: yTiles};
}

function calculateScore(originlGrid, originalTilesHistory) {
    var score = 0;
    var grid = clone(originlGrid);
    //var tilesHistory = clone(originalTilesHistory);

    originalTilesHistory.forEach(function (tmp) {
        // tile.score = 0;
        tile = grid[tmp.x][tmp.y];
        tile.tileHistory = true;
    });

    var tilesHistory = [];

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
        //var scoreX = 0;
        //var scoreY = 0;

        xyTiles.x.forEach(function (tile) {
            //if (!tile.xScore) {
            //scoreX += parseInt(tile.number);
            tile.xScore = parseInt(tile.number);
            hTile.xScore = parseInt(hTile.number);
            //}
        });

        xyTiles.y.forEach(function (tile) {
            //if (!tile.yScore) {
            //scoreY += parseInt(tile.number);
            tile.yScore = parseInt(tile.number);
            hTile.yScore = parseInt(hTile.number);
            //}
        });

        //if (scoreX + scoreY !== 0) {
        //hTile.score = parseInt(hTile.number) + scoreX + scoreY;
        //}
    });

    // if (tilesHistory.length === 1) {
    //     score = tilesHistory[0].score;
    // } else {
    //     tilesHistory.forEach(function (tile) {
    //         score += parseInt(tile.score) + parseInt(tile.number);
    //     });
    // }
    grid.forEach(function (row) {
        row.forEach(function (tile) {
            if (tile && tile.type === 'tile') {
                score += tile.xScore;
                score += tile.yScore;
            }
        })
    });

    // tilesHistory.forEach(function (tile) {
    //     score += tile.xScore;
    //     score += tile.yScore;
    // });

    return score;
}