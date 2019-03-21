
// coded and designed by Dmitriy Maslov
const w =  1000;
const h = 600;

const topoSvg = d3.select("body")
                  .append("svg")
                  .attr("width", w)
                  .attr("height", h + 150)
                  .attr("class","topoSvg");
const tooltip = d3.select("body")
                  .append("div")
                  .attr("id", "tooltip")
                  .style("opacity", 0)
                  .style("font-size", "22px")
                  .style("pointer-events", "none") // prevent stiking tooltip

const path = d3.geoPath() // create generator of geographic path
              
  
Promise.all([
            d3.json("https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json"),
            d3.json("https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json")
            ]) // async  download data
        .then(([counties, education]) => {
        topoSvg.append("text")
               .text("United States Educational Attainment")
                .attr("id", "title")
                .attr("x", w/3.6)
                .attr("y", 50)
                .style("font-size", "30px")
                .attr("fill", "hsl(300,30%,75%)");
       const tip = d3.tip()
        .attr("id", "tooltip")
        .html(d => d)
        .offset([-10,0]);
       const bachNum = education.map(d => d["bachelorsOrHigher"]);
       const minBach = Math.min(...bachNum);
       const maxBach = Math.max(...bachNum);
      
       const color = d3.scaleThreshold() // method color scheme
                        .domain(((min, max) =>{
                          let step = (max - min)/8;
                          let arr = [];
                          let correct = ''; 
                          for(let i = 0; i < 9; i++){ // length color
                            correct = (min + i*step).toFixed(2) // decimal .00
                             arr.push(correct);
                          }
                          return arr;
                        })(minBach, maxBach))
                        .range(d3.schemeRdPu[9])  // color scheme
       
        topoSvg.append("g").selectAll("rect")
               .data(topojson.feature(counties, counties["objects"]["counties"]).features)
               .enter()
               .append("path")
               .attr("class", "county")
               .attr("data-fips", d => d.id)
               .attr("data-education", d => {
                 let arr = education.filter(fip => fip.fips === d.id)  // create new arr with value in education and counties
                   return arr[0] ? arr[0].bachelorsOrHigher : 0;
                 })
               .attr("fill", d => {
                 let arr = education.filter(fip => fip.fips === d.id)  
                   return arr[0] ? color(arr[0].bachelorsOrHigher) : color(0);
                 }) 
               .attr("transform", "translate(0, 100)") 
               .attr("d", path)  // render the map
               .on("mouseover", d => {
                 tooltip.style("opacity", 1) // shoe tooltip
                   .style("position", "absolute")
                   .style("color", "white")
                    let arr = education.filter(fip => fip.fips === d.id);
                    
                 tooltip.html(arr[0]['area_name'] + ', ' + arr[0]['state'] +
                       ': ' + arr[0].bachelorsOrHigher + '%') 
                        .style("top", d3.event.pageY - 80 + "px") // position on bar bit lower cursor
                        .style("left", d3.event.pageX + 5 + "px")
                        .attr("data-education", arr[0].bachelorsOrHigher )

                 })
               .on("mouseout",  d => tooltip.style("opacity", 0))
  
        const xScale = d3.scaleLinear() // method color scheme
                        .domain(d3.extent(color.domain())) 
                        .range([0, 400])
 
       const xAxis = d3.axisBottom(xScale).tickValues(color.domain()).tickFormat(d => d + "%")
       
       const legend = topoSvg.append("g")
              .attr("id", "legend")
              .attr("transform", "translate(550, 100)")
              .call(xAxis)
       
       legend.append("g")
              .selectAll("rect")
              .data(color.range().map(d => color.invertExtent(d)))
              .enter()
              .append("rect")
              .attr("x", d => xScale(d[0]))
              .attr("y", -20)
              .attr("height", 20)
              .attr("width", d => xScale(d[1]) - xScale(d[0]))
              .attr("fill", d => color(d[0])) 
         
        legend.append("text")
              .text("Percentage of people with a bachelor's degree or higher, years: 2010-2014")
              .attr("id", "description")
              .attr("x", 175)
              .attr("y", -25)
              .style("font-size", 14)
              .attr("fill", "hsl(300,30%,75%)")         
      });
