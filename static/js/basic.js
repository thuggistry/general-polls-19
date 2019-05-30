var margin = {top: 20, right: 160, bottom: 35, left: 30};

var width = 600 - margin.left - margin.right,
    height = 450 - margin.top - margin.bottom;

// d3.csv('static/data/data.csv', function(data){console.log(data);});

$('.dropdown-menu').on('click', '.dropdown-item' ,function(){
  var selected_year = $(this).text();
  $.ajax({
    type: "GET",
    url: '/data',
  })
  .done(function(data){
    res_data = data.response;
    
    var year_dataset = _.filter(res_data, function(res){
      return res.YEAR == selected_year; 
    });

    var pollsters = _.map(year_dataset, 'POLLSTERS');
    
    var party  =  ['NDA','UPA','OTHERS']
    var colors =  ['#A9A9A9','#D2691E',"#DAA520"]

    /* Data in strings like it would be if imported from a csv */

    var stack = d3.stack().keys(party)

    var dataset = stack(year_dataset)

    $('#canvas1').empty();
    $('#canvas2').empty();
    var svg = d3.selectAll("#canvas1, #canvas2")
    .append("svg")
    .attr("width", width + 2*margin.left + 2*margin.right)
    .attr("height", height + 2*margin.top + 2*margin.bottom)
    .append("g")
    .attr("transform", "translate(" + 2*margin.left + "," + 2*margin.top + ")");

    // Set x, y and colors
    var x = d3.scaleBand()
      .domain(pollsters.map(function(d) { return d; }))
      .range([10, width-10], 0.02);

    var y = d3.scaleLinear()
      .domain([0, d3.max(dataset, function(d) {  return d3.max(d, function(d) { return d[1]; });  })])
      .range([height, 0]);

    // Define and draw axes
    var yAxis = d3.axisLeft(y)
      .ticks(5)
      .tickSize(-width, 0, 0)
      .tickFormat( function(d) { return d } );

    var xAxis = d3.axisBottom(x)

    svg.append("g")
      .attr("class", "y axis")
      .call(yAxis);

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);


    // Create groups for each series, rects for each segment 
    var groups = svg.selectAll("g.cost")
      .data(dataset)
      .enter().append("g")
      .attr("class", "cost")
      .style("fill", function(d, i) { return colors[i]; });

    console.log(_.each(dataset, function(d){ return d } ))

    var rect = groups.selectAll("rect")
      .data(function(d) { return d; })
      .enter()
      .append("rect")
      .attr("x", function(d) { return _.each(d.data, function(k) { return x(k.POLLSTERS)}) })
      .attr("y", function(d) { return y(d[1]); })
      .attr("height", function(d) { return y(d[0]) - y(d[1]); })
      .attr("width", x.bandwidth()-10)
      .on("mouseover", function() { tooltip.style("display", null); })
      .on("mouseout", function() { tooltip.style("display", "none"); })
      .on("mousemove", function(d) {
        var xPosition = d3.mouse(this)[0] - 15;
        var yPosition = d3.mouse(this)[1] - 25;
        tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
        tooltip.select("text").text(d[1]-d[0]);
    });


    svg.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "end")
    .attr("x", -180)
    .attr("y",-40)
    .attr("font-size", "18")
    .attr("dy", ".35em")
    .attr("transform", "rotate(-90)")
    .text("SEATS");

    svg.append("text")
      .attr("class", "x label")
      .attr("text-anchor", "end")
      .attr("x",width-150)
      .attr("y",height+40)
      .attr("font-size", "18")
      .attr("dy", ".35em")
      .text("POLLSTERS");


  // Draw legend
    var legend = svg.selectAll(".legend")
      .data(colors)
      .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(30," + i * 20 + ")"; });
      
    legend.append("rect")
      .attr("x", width + 18)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", function(d, i) {return colors[i];});


    legend.append("text")
      .attr("x", width + 40)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "start")
      .text(function(d, i) { 
        switch (i) {
          case 0: return party[0];
          case 1: return party[1];
          case 2: return party[2];
        }
      });
      
      
      // Prep the tooltip bits, initial display is hidden
      var tooltip = svg.append("g")
        .attr("class", "tooltip")
        .style("display", "none");
          
      tooltip.append("rect")
        .attr("width", 30)
        .attr("height", 20)
        .attr("fill", "white")
        .style("opacity", 0.5);
      
      tooltip.append("text")
        .attr("x", 15)
        .attr("dy", "1.2em")
        .style("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("font-weight", "bold");

  })
  .fail(function (error) {
    console.log(error);
  })  
});