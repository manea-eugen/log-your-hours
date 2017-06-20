// d3.json("get-authors.json", function(error, treeData) {
//
// });



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

