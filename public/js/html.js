function handToHtml(hand) {
    html = '<table>';
    html += '<tr>';
    for (var y = 0; y < hand.length; y++) {
        if(hand[y] && hand[y].type === "tile"){
            html += '<td>' + tileToHtml(hand[y], -1, y) + '</td>';
        } else {
            html += '<td>' + blankToHtml(hand[y]) + '</td>';
        }
    }
    html += '</tr>';
    html += '</table>';
    return html;
}
function targetToHtml(x, y) {
    var html = '<div class="target" data-x="' + x + '" data-y="' + y + '"></div>';
    return html;
}
function blankToHtml() {
    var html = '<div class="blank"></div>';
    return html;
}
function tileToHtml(tile, x, y) {
    var html = '<div id="x' + x + 'y' + y + '" class="tile" data-x="' + x + '" data-y="' + y + '"><span class="alignleft">' +
        tile.number +
        '</span><span class="alignright">' +
        tile.number +
        '</span><div style="clear: both;"></div><div class="shapeback"><div class="' +
        tile.shape + '"';

    switch (tile.shape) {
        case "square":
        case "circle":
        case "cross": {
            html += 'style="background:' + tile.colour + '"';
            break;
        }
        case "triangle": {
            html += 'style="border-bottom-color:' + tile.colour + '"';
            break;
        }
    }

    html += '></div></div><span class="alignleft">' +
        tile.number +
        '</span><span class="alignright">' +
        tile.number +
        '</span><div style="clear: both;"></div></div>';

    return html;
}
function gridToHtml(grid) {
    html = '<table>';
    for (var y = 0; y < grid.length; y++) {
        html += '<tr>';
        for (var x = 0; x < grid[y].length; x++) {
            if (grid[x][y] !== null) {
                switch (grid[x][y].type) {
                    case "tile":
                        html += '<td>' + tileToHtml(grid[x][y], x, y) + '</td>';
                        break;
                    case "target":
                        html += '<td>' + targetToHtml(x, y) + '</td>';
                        break;
                    case "blank":
                        html += '<td>' + blankToHtml() + '</td>';
                }

            } else {
                html += '<td></td>'
            }
        }
        html += '</tr>';
    }
    html += '</table>';
    return html;
}