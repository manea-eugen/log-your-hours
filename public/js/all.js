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

$(function () {

    $.ajax({
        url: '/git/get-all-authors-email',
        method: 'GET',
    })
        .done(function (res) {
            var authorDropdown = $('#authorEmail');

            authorDropdown.append('<option value="">Any</option>');
            res.forEach(function (dropdown, authorEmail) {
                authorDropdown.append('<option value="' + authorEmail +'">'+ authorEmail + '</option>');
            }.bind(this, authorDropdown))

        })
        .fail(function (res) {
            var error = jQuery.parseJSON(res.responseText);
            alert(error.message)
        })
        .always(function () {
            $('#authorEmailLoader').remove();
        })



    $.ajax({
        url: '/git/get-all-repositories',
        method: 'GET',
    })
        .done(function (res) {
            var repositoriesDropdown = $('#repositories');

            repositoriesDropdown.append('<option value="">Any</option>');
            res.forEach(function (repositoriesDropdown, repository) {
                repositoriesDropdown.append('<option value="' + repository._id +'">'+ repository.name + '</option>');
            }.bind(this, repositoriesDropdown))

        })
        .fail(function (res) {
            var error = jQuery.parseJSON(res.responseText);
            alert(error.message)
        })
        .always(function () {
            $('#repositoriesLoader').remove();
        })


    

});
var g;

var CommitsVisualizer = function () {

    var margin = {top: 10, right: 10, bottom: 10, left: 10},
        marginArea = {top: 10, right: 15, bottom: 10, left: 0},
        // graphWidth = d3.select('#graph-placeholder').node().getBoundingClientRect().width,
        graphWidth = 600,
        width = graphWidth - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom,
        areaHeight = height, // TO BE CALCULATED
        xAxisHeight = 12,
        yAxisWidth = 200,
        areaWidth = width - marginArea.left- marginArea.right  - yAxisWidth;

console.log(graphWidth);
console.log(margin.left);
console.log(margin.right);
console.log(width);
console.log(marginArea.left);
console.log(marginArea.right);
console.log(areaWidth);





    // console.log(width - marginArea.left - marginArea.right);
    // console.log(areaHeight);

    var strictIsoParse = d3.utcParse("%Y-%m-%dT%H:%M:%S.%LZ");
    var tooltipDateFormatter = d3.timeFormat("%d/%m : %A")

    var dateCommitFn = function (d) {
        return strictIsoParse(d.commitDate)
    };



    var tool_tip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-8, 0])
        .html(function (d) {
            return '<div class="panel radius">' +
                '<h5>' + d.authorEmail + ' ' + d.authorName + '</h5>' +
                '<p>' + d.repo.name + '</p>' +
                '<p>' + d.message + '</p>' +
                '<p>' + tooltipDateFormatter(strictIsoParse(d.commitDate)) + '</p>' +
                '</div>'

        });




    this.init = function () {
        this.svg = d3.select("#graph-placeholder")
            .append("svg:svg")
            .attr("border", 1)
            .attr("width", width)
            .attr("height", height)

            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


        this.area = this.svg
            .append('g')
            .attr('class', 'area')
            .attr("transform", "translate(" + (marginArea.left + yAxisWidth) + "," + margin.top + ")");

        // console.log()

        var borderPath = this.area.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("height", height)
            .attr("width", areaWidth)
            .style("stroke", '#000')
            .style("fill", "none")
            .style("stroke-width", 1);



        var rectangle = this.area.append("rect")
                                    .attr("x", areaWidth  -  50)
                                    .attr("y", 0)
                                    .attr("width", 50)
                                    .attr("height", 100);


        d3.json("/git", reloadView.bind(this))
    };

    this.updateView = function () {
        var authorFieldValue = d3.select('#authorEmail').node().value,
            repositoryValue = d3.select('#repositories').node().value;

        var paramsUrl = 'authorEmail=' + authorFieldValue;
        paramsUrl += '&repoId=' + repositoryValue;

        // Get the data again
        d3.json("/git?" + paramsUrl, reloadView.bind(this))

    };


    var reloadView = function (error, data) {
        if (error) throw error;


        var xScale = d3.scaleTime()
            .range([0, areaWidth - marginArea.right])
            .domain(d3.extent(data, dateCommitFn));

        var yScale = d3.scalePoint()
            .range([height - 20, 0])
            .domain(data.map(function (d) {
                return d.authorEmail
            }));

        var xScaleByCommitDate = function (d) {
            return xScale(dateCommitFn(d))
        };

        var yScaleByAuthorEmail = function (d) {
            return yScale(d.authorEmail)
        };

        var colorByMyEmail = function (d) {
            switch (d.authorEmail) {
                case 'e.manea@youwe.nl':
                    return 'lightblue';
                    break;
                default:
                    return 'rgba(0,0,0,0.5)';
            }
        }

        // TODO CONTINUES FROM HERE the zoom functionality https://bl.ocks.org/mbostock/431a331294d2b5ddd33f947cf4c81319

        var zoomed = function(){
            var t = d3.event.transform,
                xt = t.rescaleX(xScale);
            console.log(xt);
            this.svg.select(".circle").attr("cx", xScaleByCommitDate)
            // this.svg.select(".axis--x").call(xAxis.scale(xt));
        };

        var zoom = d3.zoom()
            .scaleExtent([1, 32])
            .translateExtent([[0, 0], [width, height]])
            .extent([[0, 0], [width, height]])
            .on("zoom", zoomed.bind(this));


        this.svg.call(tool_tip);


        var circle = this.area
            .selectAll("circle")
            .data(data)
            .attr("cx", xScaleByCommitDate)
            .attr("cy", yScaleByAuthorEmail)
            .attr("fill", colorByMyEmail)
            ;


        // Exit
        circle.exit()
            .attr("fill-opacity", 1)
            .attr("stroke-opacity", 1)
            .transition()
            .duration(300)
            //change fill and stroke opacity to avoid CSS conflicts
            .attr("fill-opacity", 0)
            .attr("stroke-opacity", 0)
            .remove() //remove after transitions are complete
        ;


        // Add new
        circle.enter()
            .append("svg:circle")
            .attr("class", "circle")
            .attr("r", 4)
            .attr("cx", xScaleByCommitDate)
            .attr("cy", yScaleByAuthorEmail)
            .attr("fill", colorByMyEmail)
            .on('mouseover', tool_tip.show)
            .on('mouseout', tool_tip.hide);


        d3.selectAll('.xScale').remove();
        d3.selectAll('.yScale').remove();

        // Add the xScale Axis
        this.svg.append("g")
            .attr("class", "xScale axis")
            .attr("transform", "translate(0," + (height - xAxisHeight) + ")")
            .call(d3.axisBottom(xScale));
        // Add the yScale Axis
        this.svg.append("g")
            .attr("class", "yScale axis")
            .attr("transform", "translate(200,0)")
            .call(d3.axisLeft(yScale));


//         var d0 = new Date(2017, 0, 1),
//             d1 = new Date(2017, 0, 30);
// // Gratuitous intro zoom!
//         this.svg.call(zoom).transition()
//             .duration(1500)
//             .call(zoom.transform, d3.zoomIdentity
//                 .scale(width / (xScale(d1) - xScale(d0)))
//                 .translate(-xScale(d0), 0));
        g = this.svg;
    }

}


$(function () {
// Only init the chart on homepage
    if (window.location.pathname === '/') {
        var commitsVisualizer = new CommitsVisualizer();
        commitsVisualizer.init();

        $(document).on('click', '#updateButton', function () {
            commitsVisualizer.updateView();
        })
    }


});


// TODO Find the right way to do this
if (!document.getElementById('graph-placeholder')) {

//     var margin = {top: 20, right: 20, bottom: 30, left: 40},
// // width = 1900 - margin.left - margin.right,
//         width = parseInt(d3.select('#graph-placeholder').style('width'), 10) - (margin.left + margin.right) - 15, // Minus css padding
//         height = 600 - margin.top - margin.bottom,
//         xAxisHeight = 12,
//         svg = d3.select("#graph-placeholder")
//             .append("svg:svg")
//             .attr("border", 1)
//             .attr("width", width + margin.left + margin.right)
//             .attr("height", height + margin.top + margin.bottom)
//
//             .append("g")
//             .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
//


    // var dateCommitFn = function (d) {
    //     return strictIsoParse(d.commitDate)
    // };
    // var tooltipDateFormatter = d3.timeFormat("%d/%m : %A");

    // var tool_tip = d3.tip()
    //     .attr("class", "d3-tip")
    //     .offset([-8, 0])
    //     .html(function (d) {
    //         return '<div class="panel radius">' +
    //             '<h5>' + d.authorEmail + ' ' + d.authorName + '</h5>' +
    //             '<p>' + d.repo.name + '</p>' +
    //             '<p>' + d.message + '</p>' +
    //             '<p>' + tooltipDateFormatter(strictIsoParse(d.commitDate)) + '</p>' +
    //             '</div>'
    //
    //     });


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

        var circle = svg.selectAll("circle")
            .data(data);


        circle.exit().transition()
            .duration(2000)
            .attr("r", 0)
            .remove();

        // var enter = update.enter()
        //     .append('circle')
        //     .attr('r', 200)

        var authorFieldValue = d3.select('#authorEmail').node().value,
            repositoryValue = d3.select('#repositories').node().value;

        var paramsUrl = 'authorEmail=' + authorFieldValue;
        paramsUrl += '&repoId=' + repositoryValue;

        // Get the data again
        d3.json("/git?" + paramsUrl, function (error, data) {


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
                var error = jQuery.parseJSON(res.responseText);
                alert(error.message)
            });
    },
    validateInput: function (el) {
        var required = el.attr('required');


        if (required === 'required' && el.val() === '') {
            if (!el.hasClass('error')) {
                el.addClass('error')
                    .after($('<small>')
                        .addClass('error')
                        .html('Required field')
                    );
            }
        } else {
            el.removeClass('error')
                .next('small.error')
                .remove()
        }
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
                    .append($('<div>')
                        .append($('<input>')
                            .attr('type', 'text')
                            .attr('required', true)
                            .val(name)
                        )
                    )
                )
                .append($('<td>')
                    .addClass('path-cell')
                    .append($('<div>')
                        .append($('<input>')
                            .attr('type', 'text')
                            .attr('required', true)
                            .val(path)
                        )
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
                            .addClass('warning')
                            .addClass('tiny')
                            .addClass('sync-repo')
                            .text(' Sync')
                            .prepend($('<i>')
                                .addClass('fa')
                                .addClass('fa-refresh')
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

        if (!name) {
            ReposTable.validateInput(nameCell.find('input'));
        }
  if (!path) {
            ReposTable.validateInput(pathCell.find('input'));
        }
        if(!name || !path){
            el.attr('disabled', false);
            return;
        }


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
                var error = jQuery.parseJSON(res.responseText);
                alert(error.message)
            })
            .always(function () {
                el.attr('disabled', false);

            });
    });

    $(document).on('blur', '#repos-table input', function () {
        var el = $(this);
        ReposTable.validateInput(el);
    });

    // Delete action
    $(document).on('click', '.delete-repo', function () {
        var el = $(this),
            currentRow = el.closest('tr'),
            idCell = currentRow.find('td.id-cell'),
            id = idCell.html()
            ;

        el.attr('disabled', true);

        if (!id) {
            currentRow.remove();
            return;
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
                var error = jQuery.parseJSON(res.responseText);
                el.attr('disabled', false);
                alert(error.message)
            })
    });

    // Delete action
    $(document).on('click', '.sync-repo', function () {
        var el = $(this),
            currentRow = el.closest('tr'),
            idCell = currentRow.find('td.id-cell'),
            id = idCell.html()
            ;

        el.attr('disabled', true);
        el.find('.fa-refresh').addClass('fa-spin');

       

        var url = '/git/fetch/' + id;

        $.ajax({
            url: url,
            method: 'POST',
        })
            .done(function () {
                console.log('got response from server');
                // currentRow.remove();
            })
            .fail(function (res) {
                var error = jQuery.parseJSON(res.responseText);
                el.attr('disabled', false);
                alert(error.message)
            })
            .always(function () {
                el.attr('disabled', false);
                el.find('.fa-refresh').removeClass('fa-spin');
            })
    })
});
