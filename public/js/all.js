$(function () {
    // Menu active state

    $('.top-bar .top-bar-section li').each(function () {
        var el = $(this),
            link = el.find('a')[0];
        if ($(link).attr('href') === window.location.pathname) {
            el.addClass('active');
        } else {
            el.removeClass('active')
        }
    })
});

// d3.json("get-authors.json", function(error, treeData) {
//
// });


// TODO Find the right way to do this
if (document.getElementById('graph-placeholder')) {


    var margin = {top: 20, right: 20, bottom: 30, left: 40},
// width = 1900 - margin.left - margin.right,
        width = parseInt(d3.select('#graph-placeholder').style('width'), 10) - (margin.left + margin.right) - 15, // Minus css padding
        height = 600 - margin.top - margin.bottom,
        xAxisHeight = 12,
        svg = d3.select("#graph-placeholder")
            .append("svg:svg")
            .attr("border", 1)
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)

            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")"),

        authorFieldValue = d3.select('#authorEmail').node().value;


    var strictIsoParse = d3.utcParse("%Y-%m-%dT%H:%M:%S.%LZ");

    var dateCommitFn = function (d) {
        return strictIsoParse(d.commitDate)
    };
    var tooltipDateFormatter = d3.timeFormat("%d/%m : %A");

    var tool_tip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-8, 0])
        .html(function (d) {
            return '<div class="panel radius">' +
                '<h5>' + d.authorEmail + ' ' + d.authorName + '</h5>' +
                '<p>' + tooltipDateFormatter(strictIsoParse(d.commitDate)) + '</p>' +
                '</div>'

        });


// load the data
    d3.json("/git", function (error, data) {

        var xScale = d3.scaleTime()
            .range([200, width])
            .domain(d3.extent(data, dateCommitFn));

        var yScale = d3.scalePoint()
            .range([height - 20, 0])
            .domain(data.map(function (d) {
                return d.authorEmail
            }));

        svg.call(tool_tip);

        var circle = svg.append("g")
            .selectAll("circle")
            .data(data)
            .enter()
            .append("svg:circle")
            .attr("class", "circle")
            .attr("r", 4)
            .attr("cx", function (d) {
                return xScale(dateCommitFn(d))
            })
            .attr("cy", function (d) {
                return yScale(d.authorEmail)
            })
            .attr("fill", function (d) {
                switch (d.authorEmail) {
                    case 'e.manea@youwe.nl':
                        return 'lightblue';
                        break;
                    default:
                        return 'rgba(0,0,0,0.5)';
                }
            })
            .on('mouseover', tool_tip.show)
            .on('mouseout', tool_tip.hide);

        // Add the xScale Axis
        svg.append("g")
            .attr("class", "xScale axis")
            .attr("transform", "translate(0," + (height - xAxisHeight) + ")")
            .call(d3.axisBottom(xScale));
        // Add the yScale Axis
        svg.append("g")
            .attr("class", "yScale axis")
            .attr("transform", "translate(200,0)")
            .call(d3.axisLeft(yScale));
        // text label for the xScale axis
        svg.append("text")
            .attr("transform",
                "translate(" + (width / 2) + " ," +
                (height + margin.top) + ")")
            .style("text-anchor", "middle")
            .text("Date");
    });

    function updateData() {

        var data = ['c'];

        console.log(this.svg);
        var circle = svg.selectAll("circle")
            .data(data);


        circle.exit().transition()
            .duration(2000)
            .attr("r", 0)
            .remove();

        // var enter = update.enter()
        //     .append('circle')
        //     .attr('r', 200)


        // Get the data again
        d3.json("/git?authorEmail=" + authorFieldValue, function (error, data) {


            var x = d3.scaleTime()
                .range([200, width])
                .domain(d3.extent(data, dateCommitFn));

            var y = d3.scalePoint()
                .range([height - 20, 0])
                .domain(d3.extent(data, dateCommitFn));

            // Select the section we want to apply our changes to
            var svg = d3.select("#graph-placeholder").transition();
            // svg.selectAll("circle").remove()

            // Make the changes
            var circle = svg.selectAll("circle")   // change the line
                .duration(750)
                .attr("cx", function (d) {
                    return x(dateCommitFn(d))
                })
                .attr("cy", function (d) {
                    return y(dateCommitFn(d))
                })
                .attr("fill", function (d) {
                    return 'rgba(0,0,0,0.5)';
                })
            svg.select(".x.axis") // change the x axis
                .duration(750)
                .call(d3.axisBottom(x));
            svg.select(".y.axis") // change the y axis
                .duration(750)
                .call(d3.axisLeft(y));

        });
    }
}

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
