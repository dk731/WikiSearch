var out_DOM;

var all_a_hrefs;
var unique_a_hrefs;

var out_json;

var wiki_api;

var main_url;

var url_parser;
var graph_canvas;

async function startButtonClick() {
  document.getElementsByClassName("StartInputHolder")[0].children[1].value =
    "https://en.wikipedia.org/wiki/Keanu_Reeves";

  url_parser = new UrlParser(
    document.getElementsByClassName("StartInputHolder")[0].children[1].value
  );

  await url_parser.fetch_main_url();
  await url_parser.gather_url_nodes_data();

  console.log("All data was gathered, initializing canvas and its elements");

  // graph_canvas = new GraphCanvas(
  //   1,
  //   document.getElementsByClassName("GraphCanvasHolder")[0]
  // );

  graph_canvas = new GraphCanvas(
    url_parser.wiki_api.response_obj,
    document.getElementsByClassName("GraphCanvasHolder")[0]
  );
  graph_canvas.calculate_circles();

  console.log("All data prepeared, rendering...");
  graph_canvas.render();
}
