/**
 * Created by james on 26/11/2016.
 */
function getXYTiles(grid, x, y){
    var xTiles = [];
    // start at x and go left
    var a = x - 1;
    while(a > x - 3 && grid[a][y] && grid[a][y].type === "tile"){
        if(!grid[a][y].tileHistory) {
            xTiles.push(grid[a][y]);
        }
        a--;
    }
    // start at x and go right
    a = x + 1;
    while(a < x + 3 && grid[a][y] && grid[a][y].type === "tile"){
        if(!grid[a][y].tileHistory) {
            xTiles.push(grid[a][y]);
        }
        a++;
    }

    var yTiles = [];
    // start at y and go up
    a = y - 1;
    while(a > y - 3 && grid[x][a] && grid[x][a].type === "tile"){
        if(!grid[x][a].tileHistory) {
            yTiles.push(grid[x][a]);
        }
        a--;
    }
    // start at y and go down
    a = y + 1;
    while(a < y + 3 && grid[x][a] && grid[x][a].type === "tile"){
        if(!grid[x][a].tileHistory) {
            yTiles.push(grid[x][a]);
        }
        a++;
    }

    return {x:xTiles, y: yTiles};
}

function calculateScore(grid, tilesHistory){
    var score = 0;

    // set some new temporary attributes on the tileHistory
    tilesHistory.forEach(function(tile){
        tile.score = 0;
        tile.tileHistory = true;
    });

    tilesHistory.forEach(function(tile){
        xyTiles = getXYTiles(grid, tile.x, tile.y);
        var scoreX = 0;
        var scoreY = 0;
        xyTiles.x.forEach(function(tile){
            scoreX += parseInt(tile.number);
        });
        xyTiles.y.forEach(function(tile){
            scoreY += parseInt(tile.number);
        });
        if(scoreX + scoreY !== 0) {
            tile.score = parseInt(tile.number) + scoreX + scoreY;
        }
    });

    if(tilesHistory.length === 1){
        score = tilesHistory[0].score;
    } else {
        tilesHistory.forEach(function (tile) {
            score += parseInt(tile.score) + parseInt(tile.number);
        });
    }

    // remove temporary attributes on the tileHistory
    tilesHistory.forEach(function(tile){
        delete tile.score;
        delete tile.tileHistory;
    });

    return score;
}