import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import lineChart from "./lineChart.js";
d3.csv("./csv/eminem-Dataset.csv").then(data => {
    console.log(data);    
    lineChart("#lineChart",data);
});