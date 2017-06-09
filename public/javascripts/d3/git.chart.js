var margin = {top: 20, right: 20, bottom: 30, left: 40},
    // width = 1900 - margin.left - margin.right,
    width = parseInt(d3.select('#graph-placeholder').style('width'), 10) - 30 * 2, // Minus css padding
    height = 600 - margin.top - margin.bottom,
    xAxisHeight = 12,
    svg = d3.select("#graph-placeholder")
        .append("svg:svg")
        .attr("border", 1)
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");


// load the data
d3.json("/git", function (error, data) {

    var strictIsoParse = d3.utcParse("%Y-%m-%dT%H:%M:%S.%LZ");

    var tooltipDateFormatter = d3.timeFormat("%d/%m : %A");

    // var nest = d3.nest()
    //     .key(function(d) { return d.authorEmail; })
    //     .entries(data);


    var dateFn = function (d) {
        return strictIsoParse(d.commitDate)
    };

    var x = d3.scaleTime()
        .range([200, width])
        .domain(d3.extent(data, dateFn));

    var y = d3.scalePoint()
        .range([height - 20, 0])
        .domain(data.map(function (d) {
            return d.authorEmail
        }));

    var tool_tip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-8, 0])
        // .html(function(d) { console.log(d); return "Radius: " + d.authorEmail; });
        .html(function (d) {




            return '<div class="panel radius">' +
                '<h5>' + d.authorEmail + ' ' + d.authorName + '</h5>' +
                '<p>' + tooltipDateFormatter(strictIsoParse(d.commitDate)) + '</p>' +
                '</div>'

        });
    svg.call(tool_tip);

    svg.append("g")
        .selectAll("circle")
        .data(data).enter()
        .append("svg:circle")

        .attr("r", 4)
        .attr("cx", function (d) {
            return x(dateFn(d))
        })
        .attr("cy", function (d) {
            return y(d.authorEmail)
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

    // Add the x Axis
    svg.append("g")
        .attr("transform", "translate(0," + (height - xAxisHeight) + ")")
        .call(d3.axisBottom(x));
    // Add the y Axis
    svg.append("g")
        .attr("transform", "translate(200,0)")
        .call(d3.axisLeft(y));
    // text label for the x axis
    svg.append("text")
        .attr("transform",
            "translate(" + (width / 2) + " ," +
            (height + margin.top) + ")")
        .style("text-anchor", "middle")
        .text("Date");
});
