var g;

var CommitsVisualizer = function () {

    var margin = {top: 20, right: 20, bottom: 30, left: 40},
// width = 1900 - margin.left - margin.right,
        width = parseInt(d3.select('#graph-placeholder').style('width'), 10) - (margin.left + margin.right) - 15, // Minus css padding
        height = 600 - margin.top - margin.bottom,
        xAxisHeight = 12;

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
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)

            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

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
            .range([200, width])
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


        var circle = this.svg
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


        var d0 = new Date(2017, 0, 1),
            d1 = new Date(2017, 0, 30);
// Gratuitous intro zoom!
        this.svg.call(zoom).transition()
            .duration(1500)
            .call(zoom.transform, d3.zoomIdentity
                .scale(width / (xScale(d1) - xScale(d0)))
                .translate(-xScale(d0), 0));
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
