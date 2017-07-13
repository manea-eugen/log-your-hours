var ReposTable = {
    load: function () {
        $('table#repos-table').find('tbody tr').remove();
        $.ajax({
            url: '/api/repo',
            method: 'GET',
        })
            .done(function (res) {
                $.each(res, function (index, entry) {
                    ReposTable.addRow(entry._id, entry.name, entry.path);
                });
            })
            .fail(function (res) {
                var error = jQuery.parseJSON( res.responseText );
                alert(error.message)
            })
            ;
    },

    addRow: function (id, name, path) {
        var repoTable = $('table#repos-table');

        repoTable.find('tbody')
            .append($('<tr>')
                .append($('<td>')
                    .addClass('id-cell')
                    .html(id)
                )
                .append($('<td>')
                    .addClass('name-cell')
                    .append($('<input>')
                        .attr('type', 'text')
                        .val(name)
                    )
                )
                .append($('<td>')
                    .addClass('path-cell')
                    .append($('<input>')
                        .attr('type', 'text')
                        .val(path)
                    )
                )
                .append($('<td>')
                    .append($('<div>')
                        .addClass('button-group')
                        .append($('<button>')
                            .addClass('success')
                            .addClass('tiny')
                            .addClass('save-repo')
                            .text(' Save')
                            .prepend($('<i>')
                                .addClass('fa')
                                .addClass('fa-floppy-o')
                                .attr('aria-hidden', true)
                            )
                        )
                        .append($('<button>')
                            .addClass('alert')
                            .addClass('tiny')
                            .addClass('delete-repo')
                            .text(' Delete')
                            .prepend($('<i>')
                                .addClass('fa')
                                .addClass('fa-times')
                                .attr('aria-hidden', true)
                            )
                        )
                    )
                )
            )
    }
};



$(function () {

    ReposTable.load();



    $(document).on('click', '#new-repo', function () {
        // Add a new empty row
        ReposTable.addRow();
    });

    // Save action
    $(document).on('click', '.save-repo', function () {
        var el = $(this),
            currentRow = el.closest('tr'),
            idCell = currentRow.find('td.id-cell'),
            nameCell = currentRow.find('td.name-cell'),
            pathCell = currentRow.find('td.path-cell'),
            id = idCell.html(),
            name = nameCell.find('input').val(),
            path = pathCell.find('input').val();

        el.attr('disabled', true);


        var method, url, data;

        data = {
            name: name,
            path: path
        };

        if (!id) {
            method = 'POST';
            url = '/api/repo';
        } else {
            method = 'PUT';
            url = '/api/repo/' + id
        }

        $.ajax({
            url: url,
            method: method,
            data: data
        })
            .done(function (res) {
                idCell.html(res._id);
            })
            .fail(function (res) {
                var error = jQuery.parseJSON( res.responseText );
                alert(error.message)
            })
            .always(function () {
                el.attr('disabled', false);

            });
    });

    // Delete action
    $(document).on('click', '.delete-repo', function () {
        var el = $(this),
            currentRow = el.closest('tr'),
            idCell = currentRow.find('td.id-cell'),
            id = idCell.html()
            ;

        el.attr('disabled', true);

        if(!id){
            currentRow.remove();
        }

        var url = '/api/repo/' + id;

        $.ajax({
            url: url,
            method: 'DELETE',
        })
            .done(function () {
                currentRow.remove();
            })
            .fail(function (res) {
                var error = jQuery.parseJSON( res.responseText );
                el.attr('disabled', false);
                alert(error.message)
            })
    })
});