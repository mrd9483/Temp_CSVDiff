const { ipcRenderer } = require('electron');
const { dialog, app } = require('electron').remote;
var fs = require('fs');
var path = require('path');
const stringify = require('csv-stringify');
var csvFile = [
    ["Group Name", "Group Value", "First", "Second", "Both Have Value"]
];

ipcRenderer.on('results', (event, results) => {
    setTimeout(() => {
        var tbody = $('table>tbody');
        $.each(results.cols, (colKey, colValue) => {
            var tr = $('<tr>');
            var header = true;
            $.each(results.aggregate[colKey], (key, value) => {
                var csvRow = [];
                
                if (!header) {
                    tr = $('<tr>');
                    tr.append('<td>&nbsp;</td>');
                    csvRow.push('');
                } else {
                    tr.append('<td>' + colValue.name + '</td>');
                    csvRow.push(colValue.name);
                }

                header = false;
                tr.append('<td>' + key + '</td>');
                tr.append('<td>' + value.left + '</td>');
                tr.append('<td>' + value.right + '</td>');
                var empty = (value.left == 0 || value.right == 0);
                tr.append('<td ' + (empty ? 'class="table-danger"' : '') + '>' + (empty ? "no" : "yes") + '</td>');
                tbody.append(tr);

                csvRow.push(key);
                csvRow.push(value.left);
                csvRow.push(value.right);
                csvRow.push(empty ? "no" : "yes");

                csvFile.push(csvRow);
            });
        });
    }, 2000);
});

function download() {
    var toLocalPath = path.resolve(app.getPath("desktop")); 

    var options = {
        filters: [
            { name: 'CSV file', extensions: ['csv'] },
        ],
        defaultPath: toLocalPath
    };

    dialog.showSaveDialog(options, (filename) => {
        stringify(csvFile, (err, output) => {
            try { fs.writeFileSync(filename, output, 'utf-8'); }
            catch(e) { alert('Failed to save the file !'); }
        });
        
    });
};