var CommitsVisualizer = function () {

    var margin = {top: 10, right: 0, bottom: 10, left: 0},
        marginArea = {top: 10, right: 10, bottom: 10, left: 10},
        graphWidth = d3.select('#graph-placeholder').node().getBoundingClientRect().width,
        width = graphWidth - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom,
        yAxisHeight = 50,
        xAxisWidth = 200,
        areaWidth = width - marginArea.left - marginArea.right - margin.left  - margin.right - xAxisWidth ,
        areaHeight = height - marginArea.top - marginArea.bottom - margin.top - margin.bottom - yAxisHeight,
        defaultCircleSize = 5;


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


    var dataAuthorEmail = function (d) {
        return d.authorEmail ;
    };

    var handleMouseEnterCircle = function (d) {
        var circle = d3.select(this),
            svg = d3.select(circle.node().parentNode.parentNode);

        circle.attr('r', defaultCircleSize * 2 )
            .classed('active', true)

        svg.select('.yScale.tick[data-author-email="' + d.authorEmail + '"]')
            .classed('active', true)

        tool_tip.show(d, circle);
    };
    var handleMouseOutCircle = function (d) {
        var circle = d3.select(this),
            svg = d3.select(circle.node().parentNode.parentNode);

        circle.attr('r', defaultCircleSize )
            .classed('active', false)

        svg.select('.yScale.tick[data-author-email="' + d.authorEmail + '"]')
            .classed('active', false)

        tool_tip.hide(d, circle);
    };

    var handleMouseEnterOnYAxis = function (element, label) {
        d3.select(element).classed('active', true);

        var svg = d3.select(element.parentNode.parentNode);
        svg.selectAll('[data-author-email="' + label + '"]')
                .classed('active', true)
    };
    var handleMouseOutOnYAxis = function (element, label) {
        d3.select(element).classed('active', false);
        var svg = d3.select(element.parentNode.parentNode);
        svg.selectAll('[data-author-email="' + label + '"]')
            .classed('active', false)
    };

    this.init = function () {
        var rootSvg = d3.select("#graph-placeholder")
            .append("svg:svg")
            .attr("border", 1)
            .attr("width", width)
            .attr("height", height);

        var areaMask = rootSvg.append("defs")
            .append("clipPath")
            .attr("id", "areaMask")
            .style("pointer-events", "none")
            .append("rect")
            .attr('x' , 0)
            .attr('y' , margin.top )
            .attr('width' ,areaWidth)
            .attr('height' , areaHeight)

        this.svg = rootSvg
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");



        this.area = this.svg
            .append('g')
            .attr('class', 'area')
            .attr("clip-path", "url(#areaMask)")

            .attr("transform", "translate(" + (marginArea.left + xAxisWidth) + ",0)")

        var rect = this.area.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .style("opacity", 0.7)
            .attr('width', areaWidth)
            .attr('height', areaHeight)
            .style("fill", "white")
            .style("pointer-events", "all")
        ;

        d3.json("/git", reloadView.bind(this))
    };

    /**
     * Passing parameters to this function will over-rule
     * @param author
     * @param repository
     */
    this.updateView = function (author, repository) {

        var params = [];

        if(author){
            params.push('authorEmail=' + author);
        }

        if(repository){
            params.push('repoId=' + repository);
        }

        var paramsUrl = params.length > 0 ? '?' + params.join('&'): '';

        d3.json("/git" + paramsUrl, reloadView.bind(this))
    };


    var reloadView = function (error, data) {
        if (error) throw error;

        var xScale = d3.scaleTime()
            .range([0, areaWidth - marginArea.right])
            .domain(d3.extent(data, dateCommitFn));

        var yScale = d3.scalePoint()
            .range([areaHeight, 0])
            .domain(data.map(function (d) {
                return d.authorEmail
            }));

        var xAxis = d3.axisBottom(xScale),
            yAxis = d3.axisLeft(yScale);


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
        };


        var zoomed = function(){
            var t = d3.event.transform,
                xt = t.rescaleX(xScale);
            this.area.selectAll(".circle").attr("cx", function (d) {
                return xt(dateCommitFn(d))
            });

            this.svg.select(".xScale").call(xAxis.scale(xt));
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
            .attr('data-author-email', dataAuthorEmail)

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
            .attr("class", 'circle')
            .attr('data-author-email', dataAuthorEmail)
            .attr("r", 4)
            .attr("cx", xScaleByCommitDate)
            .attr("cy", yScaleByAuthorEmail)
            .attr("fill", colorByMyEmail)
            .on('mouseenter', handleMouseEnterCircle)
            // .on('mouseenter', tool_tip.show)
            .on('mouseout', handleMouseOutCircle);


        d3.selectAll('.xScale').remove();
        d3.selectAll('.yScale').remove();

        // Date scale
        this.svg.append("g")
            .attr("class", "xScale axis")
            .attr("transform", "translate(" + (xAxisWidth + marginArea.left ) + "," + (areaHeight + marginArea.top) + ")")
            .call(xAxis);

        // Author scale
        this.svg.append("g")
            .attr("class", "yScale axis")
            .attr("transform", "translate(" + (xAxisWidth ) + ",0)")
            .call(yAxis);

        this.svg.selectAll('.yScale .tick')
            .style("pointer", "none")
            .attr('data-author-email', function (label) {
                return label;
            })
            .on('click', function (label) {
                var repositoryValue = d3.select('#repositories').node().value;
                this.updateView(label, repositoryValue)
            }.bind(this))
            .on('mouseenter', function (label) {
                handleMouseEnterOnYAxis(this, label);
            })
            .on('mouseout', function (label) {
                handleMouseOutOnYAxis(this, label);
            })
        ;

        var today = new Date(),
            twoWeeksAgo  = d3.timeWeek.offset(new Date(), -50);

        this.area.call(zoom)
            .transition()
            .duration(500   )
            .call(zoom.transform, d3.zoomIdentity
                .scale(areaWidth / (xScale(today) - xScale(twoWeeksAgo)))
                .translate(-xScale(twoWeeksAgo), 0));
        g = this.svg;
    }

};


$(function () {
    // Only init the chart on homepage
    if (window.location.pathname === '/') {
        var commitsVisualizer = new CommitsVisualizer();
        commitsVisualizer.init();

        $(document).on('click', '#reloadButton', function () {

            var authorFieldValue = d3.select('#authorEmail').node().value,
                repositoryValue = d3.select('#repositories').node().value;

            commitsVisualizer.updateView(authorFieldValue, repositoryValue);
        })
    }


});
