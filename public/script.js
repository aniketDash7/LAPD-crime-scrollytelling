// Global Variables
let crimeData;
let svg, g;
let width, height;
let map;
let currentStep = 0;

// D3 Setup
const margin = { top: 40, right: 40, bottom: 60, left: 60 };

// Initialize
async function init() {
    // 1. Load Data
    try {
        const response = await fetch('crime_data_processed.json');
        crimeData = await response.json();
    } catch (error) {
        console.error("Error loading data:", error);
        return;
    }

    // 2. Setup D3 SVG
    const container = document.getElementById('viz-container');
    width = container.clientWidth - margin.left - margin.right;
    height = container.clientHeight - margin.top - margin.bottom;

    svg = d3.select("#viz-container")
        .append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // 3. Setup Leaflet Map
    map = L.map('map-container').setView([34.0522, -118.2437], 10);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);

    // Add points to map (initially hidden or shown? Let's add them but maybe control visibility via CSS or opacity)
    // Actually, let's add them now.
    crimeData.map_sample.forEach(point => {
        L.circleMarker([point.LAT, point.LON], {
            radius: 3,
            fillColor: "#38bdf8",
            color: "#000",
            weight: 0,
            opacity: 1,
            fillOpacity: 0.6
        }).addTo(map).bindPopup(`<b>${point['Crm Cd Desc']}</b><br>${point['AREA NAME']}`);
    });

    // 4. Setup Scrollama
    const scroller = scrollama();

    scroller
        .setup({
            step: ".step",
            offset: 0.5,
            debug: false
        })
        .onStepEnter(handleStepEnter);

    // Initial render
    updateViz(1);
}

// Handle Scroll Steps
function handleStepEnter(response) {
    const step = response.element.dataset.step;

    // Update active state for text
    document.querySelectorAll('.step').forEach(el => el.classList.remove('is-active'));
    response.element.classList.add('is-active');

    if (step !== currentStep) {
        updateViz(step);
        currentStep = step;
    }
}

// Main Visualization Update Logic
function updateViz(step) {
    // Reset Views
    d3.select("#viz-container").style("opacity", 1).style("z-index", 2);
    d3.select("#map-container").style("opacity", 0).style("z-index", 1);

    // Clear previous D3 elements
    svg.selectAll("*").remove();

    if (step === '1') {
        renderTrendChart();
    } else if (step === '2') {
        renderTopCrimesChart();
    } else if (step === '3') {
        // Show Map
        d3.select("#viz-container").style("opacity", 0).style("z-index", 1);
        d3.select("#map-container").style("opacity", 1).style("z-index", 2);
        map.invalidateSize(); // Important for Leaflet to render correctly after being hidden
    } else if (step === '4') {
        renderAreasChart();
    } else if (step === '5') {
        // Final state - maybe show a summary or keep the last chart
        renderAreasChart();
    }
}

// --- Chart Render Functions ---

function renderTrendChart() {
    const data = Object.entries(crimeData.monthly_counts).map(([date, count]) => ({ date: new Date(date), count }));

    const x = d3.scaleTime()
        .domain(d3.extent(data, d => d.date))
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.count)])
        .range([height, 0]);

    // Axes
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).ticks(5).tickFormat(d3.timeFormat("%b %Y")))
        .attr("color", "#94a3b8")
        .style("font-size", "12px");

    svg.append("g")
        .call(d3.axisLeft(y))
        .attr("color", "#94a3b8")
        .style("font-size", "12px");

    // Line
    const line = d3.line()
        .x(d => x(d.date))
        .y(d => y(d.count))
        .curve(d3.curveMonotoneX);

    const path = svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "#38bdf8")
        .attr("stroke-width", 3)
        .attr("d", line);

    // Animation: Draw Line
    const totalLength = path.node().getTotalLength();
    path
        .attr("stroke-dasharray", totalLength + " " + totalLength)
        .attr("stroke-dashoffset", totalLength)
        .transition()
        .duration(2000)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0);

    // Title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .style("fill", "#e2e8f0")
        .style("font-size", "16px")
        .text("Monthly Crime Reports");
}

function renderTopCrimesChart() {
    // Aggregate data
    const crimeTypeTotals = {};
    crimeData.top_crimes.forEach(type => crimeTypeTotals[type] = 0);
    for (const month in crimeData.crime_type_counts) {
        for (const type in crimeData.crime_type_counts[month]) {
            if (crimeTypeTotals[type] !== undefined) {
                crimeTypeTotals[type] += crimeData.crime_type_counts[month][type];
            }
        }
    }
    const data = Object.entries(crimeTypeTotals)
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count); // Sort descending

    const x = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.count)])
        .range([0, width]);

    const y = d3.scaleBand()
        .domain(data.map(d => d.type))
        .range([0, height])
        .padding(0.2);

    // Axes
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .attr("color", "#94a3b8");

    svg.append("g")
        .call(d3.axisLeft(y))
        .attr("color", "#94a3b8")
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em");

    // Bars
    svg.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", x(0))
        .attr("y", d => y(d.type))
        .attr("height", y.bandwidth())
        .attr("fill", "#818cf8")
        .attr("width", 0) // Start at 0 for animation
        .transition()
        .duration(1000)
        .attr("width", d => x(d.count));

    // Labels
    svg.selectAll(".label")
        .data(data)
        .enter()
        .append("text")
        .attr("class", "label")
        .attr("x", d => x(d.count) + 5)
        .attr("y", d => y(d.type) + y.bandwidth() / 2 + 4)
        .text(d => d.count)
        .style("fill", "#cbd5e1")
        .style("font-size", "12px")
        .style("opacity", 0)
        .transition()
        .delay(1000)
        .duration(500)
        .style("opacity", 1);

    // Title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .style("fill", "#e2e8f0")
        .style("font-size", "16px")
        .text("Top 5 Crimes (Total)");
}

function renderAreasChart() {
    // Aggregate data
    const areaTotals = {};
    crimeData.top_areas.forEach(area => areaTotals[area] = 0);
    for (const month in crimeData.area_counts) {
        for (const area in crimeData.area_counts[month]) {
            if (areaTotals[area] !== undefined) {
                areaTotals[area] += crimeData.area_counts[month][area];
            }
        }
    }
    const data = Object.entries(areaTotals).map(([area, count]) => ({ area, count }));

    // Donut Chart
    const radius = Math.min(width, height) / 2;
    const color = d3.scaleOrdinal()
        .domain(data.map(d => d.area))
        .range(['#38bdf8', '#818cf8', '#c084fc', '#f472b6', '#fb7185']);

    const pie = d3.pie()
        .value(d => d.count)
        .sort(null);

    const arc = d3.arc()
        .innerRadius(radius * 0.5)
        .outerRadius(radius * 0.8);

    const arcHover = d3.arc()
        .innerRadius(radius * 0.5)
        .outerRadius(radius * 0.9);

    const gPie = svg.append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

    const path = gPie.selectAll("path")
        .data(pie(data))
        .enter()
        .append("path")
        .attr("fill", d => color(d.data.area))
        .attr("d", arc)
        .each(function (d) { this._current = d; }); // Store the initial angles

    // Animation
    path.transition()
        .duration(1000)
        .attrTween("d", function (d) {
            const i = d3.interpolate(d.startAngle + 0.1, d.endAngle);
            return function (t) {
                d.endAngle = i(t);
                return arc(d);
            }
        });

    // Legend
    const legend = svg.append("g")
        .attr("transform", `translate(${width - 100}, 20)`);

    data.forEach((d, i) => {
        const row = legend.append("g").attr("transform", `translate(0, ${i * 20})`);
        row.append("rect").attr("width", 10).attr("height", 10).attr("fill", color(d.area));
        row.append("text").attr("x", 15).attr("y", 10).text(d.area).style("fill", "#cbd5e1").style("font-size", "10px");
    });

    // Title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .style("fill", "#e2e8f0")
        .style("font-size", "16px")
        .text("Top 5 Areas by Volume");
}


// Start
init();
