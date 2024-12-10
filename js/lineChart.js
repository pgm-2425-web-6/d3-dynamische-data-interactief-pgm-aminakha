import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export default function lineChart(selector, data, attributes = { width: 1500, height: 600, margin: { top: 50, right: 30, bottom: 70, left: 60 } }) {

    // Set up dimensions and margins
    const { width, height, margin } = attributes;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create the SVG container
    const svg = d3.select(selector)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("background-color", "#f4f4f4")
        .style("border-radius", "8px");

    // Parse date and prepare data
    data.forEach(d => {
        d.release_date = new Date(d.release_date);
    });

    // Set the scales for the axes
    const xScale = d3.scaleTime()
        .domain(d3.extent(data, d => d.release_date))
        .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.popularity)])
        .range([innerHeight, 0]);

    // Add the X and Y axes
    const xAxis = d3.axisBottom(xScale).ticks(d3.timeYear.every(1)).tickSize(6);
    const yAxis = d3.axisLeft(yScale).ticks(6);

    svg.append("g")
        .attr("transform", `translate(${margin.left}, ${innerHeight + margin.top})`)
        .call(xAxis)
        .selectAll("text")
        .style("font-size", "12px")
        .style("fill", "#333");

    svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`)
        .call(yAxis)
        .selectAll("text")
        .style("font-size", "12px")
        .style("fill", "#333");

    // Create the line generator function
    const line = d3.line()
        .x(d => xScale(d.release_date))
        .y(d => yScale(d.popularity))
        .curve(d3.curveMonotoneX);  // Smooth curve for the line

    // Append the line path to the SVG with a smooth transition
    svg.append("path")
        .data([data])
        .attr("class", "line")
        .attr("transform", `translate(${margin.left}, ${margin.top})`)
        .attr("d", line)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .transition()
        .duration(1500)
        .ease(d3.easeCubicInOut);

    // Add circles for each track on the line chart with hover effects
    svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d.release_date) + margin.left)
        .attr("cy", d => yScale(d.popularity) + margin.top)
        .attr("r", 6)
        .attr("fill", "red")
        .attr("stroke", "white")
        .attr("stroke-width", 2)
        .on("mouseover", function (event, d) {
            // Highlight the circle and display tooltip on hover
            d3.select(this).transition().duration(200).attr("r", 8).attr("fill", "orange");
            tooltip.style("visibility", "visible")
                .text(`${d.track_name} - Popularity: ${d.popularity}`)
                .style("background-color", "#333")
                .style("color", "#fff")
                .style("padding", "8px")
                .style("border-radius", "5px")
                .style("box-shadow", "0px 0px 10px rgba(0, 0, 0, 0.2)");
        })
        .on("mousemove", function (event) {
            tooltip.style("top", `${event.pageY + 10}px`)
                .style("left", `${event.pageX + 10}px`);
        })
        .on("mouseout", function () {
            // Restore the circle size and hide tooltip
            d3.select(this).transition().duration(200).attr("r", 6).attr("fill", "red");
            tooltip.style("visibility", "hidden");
        });

    // Create a tooltip for interactivity
    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("pointer-events", "none");

    // Optional: Add axis labels with styling
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height - 10)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("fill", "#333")
        .text("Release Date");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("fill", "#333")
        .text("Popularity");
}
