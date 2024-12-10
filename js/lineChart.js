import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export default function raceChart(selector, data, attributes = { width: 700, height: 400, margin: { top: 50, right: 30, bottom: 70, left: 60 } }) {

    const { width, height, margin } = attributes;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Maak de SVG-container
    const svg = d3.select(selector)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("background-color", "#f4f4f4")
        .style("border-radius", "8px");

    // Datum parsen en jaar toevoegen
    data.forEach(d => {
        d.release_date = new Date(d.release_date);
        d.year = d.release_date.getFullYear();  // Haal jaar uit releasedatum
    });

    // De data groeperen per jaar
    const yearGroups = d3.group(data, d => d.year);

    const xScale = d3.scaleLinear()
        .domain([0, 100])  
        .range([0, innerWidth]);

    const yScale = d3.scaleBand()
    // Alleen de top 10 populairste nummers per jaar weergeven
        .domain(d3.range(10))  
        .range([0, innerHeight])
        .padding(0.1);

    const xAxis = d3.axisBottom(xScale).ticks(5);
    const yAxis = d3.axisLeft(yScale).tickFormat(i => `Rang ${i + 1}`).ticks(10);

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

    // Maak een canvas voor de track balken
    const trackBarsGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    function animateRace(yearIndex = 0) {
        const currentYearData = yearGroups.get(Array.from(yearGroups.keys())[yearIndex]) || [];

        //De tracks sorteren op populariteit
        currentYearData.sort((a, b) => b.popularity - a.popularity);

        // Beperk tot de top 10 tracks
        const topTracks = currentYearData.slice(0, 10);

        // Koppel data aan de balken (rechthoeken die tracks vertegenwoordigen)
        const bars = trackBarsGroup.selectAll("rect")
            .data(topTracks, d => d.track_name);

        // Verwijder balken die niet langer in de top 10 van dit jaar staan
        bars.exit().transition().duration(500).attr("width", 0).remove();

        // De  balken toe en werk ze bij
        bars.enter().append("rect")
            .attr("x", 0)
            .attr("y", (d, i) => yScale(i))
            .attr("width", 0)
            .attr("height", yScale.bandwidth())
            .attr("fill", "#4caf50")
            .attr("stroke", "#333")
            .merge(bars)  
            .transition()
            .duration(1000)
            .ease(d3.easeCubicInOut)
             // Stel breedte in op basis van populariteit
            .attr("width", d => xScale(d.popularity)); 

        // De tekstlabels toevoegen voor de tracknamen
        const labels = trackBarsGroup.selectAll("text")
            .data(topTracks, d => d.track_name);

        // De oude labels verwijderen
        labels.exit().transition().duration(500).style("opacity", 0).remove();

        // Voeg labels toe 
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

        // Ga naar het volgende jaar
        if (yearIndex < Array.from(yearGroups.keys()).length - 1) {
            //timer voor het afwachten van de animatie voordat de volgende animatie begint
            setTimeout(() => animateRace(yearIndex + 1), 1500); 
        }
    }

    // Start de animatie vanaf het eerste jaar
    animateRace();

    // Een play/pauze knop toevoegen voor interactiviteit
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
            // Opnieuw opstarten van animatie
            animateRace();  
        } else {
            playPauseButton.text("Play");
        }
    });
}
