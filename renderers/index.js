const { ipcRenderer } = require('electron');
const { dialog } = require('electron').remote;
const parse = require('csv-parse/lib/sync')

var fs = require('fs');
var left, right, leftCols = null;

function leftFile() {
    dialog.showOpenDialog({
        filters: [
            { name: 'csv file', extensions: ['csv'] }
        ]
    }, (fileNames) => {
        if (fileNames === undefined) {
            console.log('No file selected');
            return;
        }
        var fileName = fileNames[0];
        var input = fs.readFileSync(fileName, 'utf-8');

        left = parse(input, {
            columns: null,
            skip_empty_lines: true
        });

        leftCols = left.shift();

        $('#leftButton').hide();
        $('#leftSelected').show();

        checkState();
    });
}

function rightFile() {
    dialog.showOpenDialog({
        filters: [
            { name: 'csv file', extensions: ['csv'] }
        ]
    }, function (fileNames) {
        if (fileNames === undefined) return;
        var fileName = fileNames[0];
        var input = fs.readFileSync(fileName, 'utf-8');

        right = parse(input, {
            columns: null,
            skip_empty_lines: true
        });

        right.shift();

        $('#rightButton').hide();
        $('#rightSelected').show();

        checkState();
    });
}

function checkState() {
    if (left && right) {
        $('#after_files').show();
        $('#results_pane').show();
        $('#aggregates').empty();
        $('#idSelection').find('option').remove()

        $.each(leftCols, function (key, value) {
            var checkbox = '<div class="form-check"><input class="form-check-input" type="checkbox" value="' + key + "|" + value + '" name="aggregates" id=agg_"' + value + '"><label class="form-check-label" for=agg_"' + value + '">' + value + '</label></div>';
            $('#idSelection').append(
                $("<option></option>").attr("value", key).text(value)
            );

            $('#aggregates').append(checkbox);
        });

    } else {
        $('#after_files').hide();
    }
}

function showLeftButton() {
    $('#leftButton').show();
    $('#leftSelected').hide();
}

function showRightButton() {
    $('#rightButton').show();
    $('#rightSelected').hide();
}

function downloadResults() {
    //get inputs
    var aggregateCols = [];
    var aggregate = [];

    $.each($("input[name='aggregates']:checked"), function () {
        var val = $(this).val().split('|');
        aggregateCols.push({ id: val[0], name: val[1] });
    });

    //iterate through each selected aggregate
    $.each(aggregateCols, (aggKey, aggValue) => {
        var aggregateCol = {};

        $.each(left, (key, value) => {
            if (!aggregateCol.hasOwnProperty(value[aggValue.id])) {
                aggregateCol[value[aggValue.id]] = { left: 1, right: 0 };
            } else {
                aggregateCol[value[aggValue.id]].left++;
            }
        });

        $.each(right, (key, value) => {
            if (!aggregateCol.hasOwnProperty(value[aggValue.id])) {
                aggregateCol[value[aggValue.id]] = { left: 0, right: 1 };
            } else {
                aggregateCol[value[aggValue.id]].right++;
            }
        });

        aggregate.push(aggregateCol);
    });

    var retVal = {
        aggregate: aggregate,
        cols: aggregateCols
    };

    ipcRenderer.send('show-results', retVal);
    require('electron').remote.getGlobal('sharedObject').csv = retVal;
}