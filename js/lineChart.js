import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export default function raceChart(selector, data, attributes = { width: 700, height: 400, margin: { top: 50, right: 30, bottom: 70, left: 60 } }) {

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
        d.year = d.release_date.getFullYear();  // Extract year from release date
    });

    // Group data by year
    const yearGroups = d3.group(data, d => d.year);

    // Set up scales for x (popularity) and y (track rank)
    const xScale = d3.scaleLinear()
        .domain([0, 100])  // Popularity range (0 to 100)
        .range([0, innerWidth]);

    const yScale = d3.scaleBand()
        .domain(d3.range(10))  // Limit to top 10 tracks per year
        .range([0, innerHeight])
        .padding(0.1);

    // Add X and Y axis
    const xAxis = d3.axisBottom(xScale).ticks(5);
    const yAxis = d3.axisLeft(yScale).tickFormat(i => `Rank ${i + 1}`).ticks(10);

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

    // Create a placeholder for the track bars
    const trackBarsGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Create a race animation function
    function animateRace(yearIndex = 0) {
        const currentYearData = yearGroups.get(Array.from(yearGroups.keys())[yearIndex]) || [];

        // Sort the tracks by popularity
        currentYearData.sort((a, b) => b.popularity - a.popularity);

        // Limit to the top 10 tracks
        const topTracks = currentYearData.slice(0, 10);

        // Bind data to the bars (rectangles representing tracks)
        const bars = trackBarsGroup.selectAll("rect")
            .data(topTracks, d => d.track_name);

        // Remove bars that are no longer in the top 10 for this year
        bars.exit().transition().duration(500).attr("width", 0).remove();

        // Enter and update the bars
        bars.enter().append("rect")
            .attr("x", 0)
            .attr("y", (d, i) => yScale(i))
            .attr("width", 0)
            .attr("height", yScale.bandwidth())
            .attr("fill", "#4caf50")
            .attr("stroke", "#333")
            .merge(bars)  // Merge enter and update
            .transition()
            .duration(1000)
            .ease(d3.easeCubicInOut)
            .attr("width", d => xScale(d.popularity));  // Set width based on popularity

        // Add text labels for the track names
        const labels = trackBarsGroup.selectAll("text")
            .data(topTracks, d => d.track_name);

        // Remove labels that are no longer in the top 10
        labels.exit().transition().duration(500).style("opacity", 0).remove();

        // Add or update the labels
        labels.enter().append("text")
            .attr("x", 10)
            .attr("y", (d, i) => yScale(i) + yScale.bandwidth() / 2)
            .attr("dy", ".35em")
            .style("font-size", "12px")
            .style("fill", "#333")
            .merge(labels)
            .transition()
            .duration(1000)
            .ease(d3.easeCubicInOut)
            .text(d => d.track_name);

        // Move to the next year
        if (yearIndex < Array.from(yearGroups.keys()).length - 1) {
            setTimeout(() => animateRace(yearIndex + 1), 1500); // Wait before moving to the next year
        }
    }

    // Start the animation from the first year
    animateRace();

    // Add a play/pause button for interactivity
    const playPauseButton = d3.select(selector).append("button")
        .text("Pause")
        .style("position", "absolute")
        .style("top", "20px")
        .style("right", "20px")
        .style("padding", "10px")
        .style("background-color", "#333")
        .style("color", "#fff")
        .style("border", "none")
        .style("cursor", "pointer");

    let isPlaying = true;
    playPauseButton.on("click", function () {
        isPlaying = !isPlaying;
        if (isPlaying) {
            playPauseButton.text("Pause");
            animateRace();  // Restart the animation
        } else {
            playPauseButton.text("Play");
        }
    });
}
