class GraphCanvas {
  constructor(wiki_response, gh_elem) {
    this.graph_canavs_holder_elem = gh_elem;
    this.init_graph_holder();

    this.wiki_response_obj = wiki_response;
    this.wiki_resp_obj_keys = Object.keys(this.wiki_response_obj);
    this.init_circles();
  }

  init_circles() {
    this.pid180 = Math.PI / 180;

    this.circles_amount = this.wiki_resp_obj_keys.length;
    this.min_dis = 10 + 10 * Math.log10(this.circles_amount);

    this.min_size = (1 / Math.log10(this.circles_amount)) * 13;
    this.size_d = (1 / Math.log10(this.circles_amount)) * 15;

    this.circle_spmin = 1;
    this.circle_spmd = (1 / Math.log10(this.circles_amount)) * 20;

    this.c_rand_offset = Math.log10(this.circles_amount) * 5;
    this.angle_d = this.radians(5);

    this.start_ang = this.radians(45);
    this.start_ang_d = this.radians(30);

    this.central_point = { x: 0, y: 0 };

    this.node_list = [];
    this.elements_list = [];
  }

  init_graph_holder() {
    this.graph_canavs_holder_elem.prevMousePos = { x: 0, y: 0 };
    this.graph_canavs_holder_elem.scale_speed = 0.0004;
    this.graph_canavs_holder_elem.min_scale = 0.1;
    this.graph_canavs_holder_elem.cur_scale = 1;

    this.graph_canavs_holder_elem.graph_holder = document.createElement("div");
    this.graph_canavs_holder_elem.graph_holder.className = "GraphHolder";
    this.graph_canavs_holder_elem.graph_holder.style.cssText =
      "position: absolute; top: 50%; left: 50%; width: 0%; height: 0%";

    this.graph_canavs_holder_elem.appendChild(
      this.graph_canavs_holder_elem.graph_holder
    );

    this.canvas_ups = 10;
    this.graph_canavs_holder_elem.graph_holder.need_update = false;
    this.graph_canavs_holder_elem.graph_holder.cur_pos = {
      x: this.graph_canavs_holder_elem.graph_holder.offsetLeft,
      y: this.graph_canavs_holder_elem.graph_holder.offsetTop,
    };
    this.graph_canavs_holder_elem.graph_holder.style.transition =
      1 / this.canvas_ups + "s cubic-bezier(0.4, 0, 1, 1)";

    this.graph_canavs_holder_elem.addEventListener(
      "mousemove",
      this.onMouseMoveEvent
    );
    this.graph_canavs_holder_elem.addEventListener(
      "wheel",
      this.onMouseWheelEvent
    );

    this.canvas_updater_var = setInterval(
      this.canvas_updater,
      1000 / this.canvas_ups,
      this.graph_canavs_holder_elem.graph_holder
    );

    ////////////////////////////////////////////////////////////////////////////tmp
    document.getElementById(
      "tmpbtn"
    ).graph_holder = this.graph_canavs_holder_elem.graph_holder;
    document.getElementById("tmpbtn").addEventListener("click", this.spawn_div);
  }

  spawn_div() {
    var tmp = document.createElement("div");
    tmp.style.background = "red";
    tmp.style.width = "20px";
    tmp.style.height = "20px";
    tmp.style.position = "absolute";
    tmp.style.left = (Math.random() - 0.5) * 1000 + "px";
    tmp.style.top = (Math.random() - 0.5) * 1000 + "px";
    // tmp.style.display = "none";
    this.graph_holder.appendChild(tmp);
  }

  render() {
    this.node_list.forEach((c) => {
      var tmp = document.createElement("div");
      tmp.style.cssText =
        "position: absolute; height: " +
        c.r * 10 +
        "px; width: " +
        c.r * 10 +
        "px; left: " +
        c.x * 10 +
        "px; top: " +
        c.y * 10 +
        "px; border-radius: " +
        c.r * 5 +
        "px; background-color: red; overflow: hidden; opacity: 0; transition: opacity " +
        Math.random() * 4 +
        1 +
        "s ease-in-out;";
      tmp.wiki_obj = this.wiki_response_obj[c.key];
      tmp.wiki_obj.art_name = c.key;
      this.elements_list.push(tmp);
    });

    var tmp = document.createElement("div");
    tmp.style.cssText =
      "position: absolute; height: " +
      200 +
      "px; width: " +
      200 +
      "px; left: " +
      this.central_point.x * 10 +
      "px; top: " +
      this.central_point.x * 10 +
      "px; border-radius: " +
      100 +
      "px; background-color: green;";

    this.elements_list.push(tmp);

    this.elements_list.forEach((el) => {
      if (!el.wiki_obj) return;

      var tmp = document.createElement("img");
      tmp.style.cssText =
        "position: absolute; height: 100%; width: 100%; left: 0px; top: 0px;";
      tmp.src = el.wiki_obj.img_url;
      el.addEventListener(
        "click",
        window.open(
          "https://.wikipedia.org/wiki/".insert(
            8,
            url_parser.wiki_api.lang_ext
          ) + el.wiki_obj.art_name
        )
      );
      el.appendChild(tmp);
    });

    this.elements_list.forEach((el) =>
      this.graph_canavs_holder_elem.graph_holder.appendChild(el)
    );

    this.elements_list.sort(() => Math.random() - 0.5);

    this.elements_list.forEach((el) => (el.style.opacity = 1));
  }

  check_intersect(c) {
    if (
      ((this.node_list[c].x - this.central_point.x) ** 2 +
        (this.node_list[c].y - this.central_point.y) ** 2) **
        0.5 +
        (Math.random() - 0.5) * this.c_rand_offset <
      this.min_dis
    )
      return false;

    for (var i = 0; i < c; i++)
      if (
        ((this.node_list[i].x - this.node_list[c].x) ** 2 +
          (this.node_list[i].y - this.node_list[c].y) ** 2) **
          0.5 <
        this.node_list[i].r / 2 + this.node_list[c].r / 2 + this.circle_spmin
      )
        return false;

    return true;
  }

  calculate_circles() {
    this.wiki_resp_obj_keys.sort(
      (a, b) =>
        this.wiki_response_obj[a].pageviews -
        this.wiki_response_obj[b].pageviews
    );
    var min_views = this.wiki_response_obj[
      this.wiki_resp_obj_keys[this.wiki_resp_obj_keys.length - 1]
    ].pageviews;
    var max_views = this.wiki_response_obj[this.wiki_resp_obj_keys[0]]
      .pageviews;

    var mmd = max_views - min_views;
    var id_count = 0;
    this.wiki_resp_obj_keys.forEach((k) => {
      var tmp_obj = { x: undefined, y: undefined, id: id_count++ };
      tmp_obj.key = k;
      tmp_obj.r =
        this.min_size +
        this.size_d * ((this.wiki_response_obj[k].pageviews - min_views) / mmd);
      this.node_list.push(tmp_obj);
    });

    var rand_angle = Math.random() * Math.PI * 2;

    // var lst_ind = 1;

    this.node_list[0].x =
      Math.cos(rand_angle) *
        (this.min_dis +
          (Math.random() - 0.5) * this.c_rand_offset +
          this.node_list[0].r) +
      this.central_point.x;
    this.node_list[0].y =
      Math.sin(rand_angle) *
        (this.min_dis +
          (Math.random() - 0.5) * this.c_rand_offset +
          this.node_list[0].r) +
      this.central_point.y;

    for (var i = 1; i < this.node_list.length; i++) {
      let cur_c = this.node_list[i - 1];
      let cur_rand_l =
        cur_c.r + this.circle_spmin + Math.random() * this.circle_spmd;

      let cur_r =
        ((cur_c.x - this.central_point.x) ** 2 +
          (cur_c.y - this.central_point.y) ** 2) **
        0.5;

      let ratio = 1 - cur_rand_l / cur_r;

      let cur_new_point = {
        x: this.central_point.x + (cur_c.x - this.central_point.x) * ratio,
        y: this.central_point.y + (cur_c.y - this.central_point.y) * ratio,
      };

      let cur_ang =
        Math.atan2(cur_new_point.y - cur_c.y, cur_new_point.x - cur_c.x) -
        this.start_ang +
        (Math.random() - 0.5) * this.start_ang_d;

      this.node_list[i].x = cur_c.x + Math.cos(cur_ang) * cur_rand_l;
      this.node_list[i].y = cur_c.y + Math.sin(cur_ang) * cur_rand_l;

      while (!this.check_intersect(i)) {
        cur_ang -= this.angle_d;
        this.node_list[i].x = cur_c.x + Math.cos(cur_ang) * cur_rand_l;
        this.node_list[i].y = cur_c.y + Math.sin(cur_ang) * cur_rand_l;
      }
    }

    console.log(this.node_list);
  }

  canvas_updater(graph_holder) {
    if (graph_holder.need_update) {
      graph_holder.style.cssText = graph_holder.style.cssText
        .replace(/(?<=left: ).*?(?=;)/, graph_holder.cur_pos.x + "px")
        .replace(/(?<=top: ).*?(?=;)/, graph_holder.cur_pos.y + "px");
      graph_holder.need_update = false;
    }
  }

  onMouseMoveEvent(event) {
    if (event.buttons & 1) {
      this.graph_holder.need_update = true;
      this.graph_holder.cur_pos.x += event.screenX - this.prevMousePos.x;
      this.graph_holder.cur_pos.y += event.screenY - this.prevMousePos.y;
    }
    this.prevMousePos.x = event.screenX;
    this.prevMousePos.y = event.screenY;
  }

  onMouseWheelEvent(event) {
    this.cur_scale += event.deltaY * this.scale_speed;
    if (this.cur_scale > 2) this.cur_scale = 2;
    else if (this.cur_scale < this.min_scale) this.cur_scale = this.min_scale;
    this.graph_holder.style.transform = "scale(" + this.cur_scale + ")";
  }

  radians(ang) {
    return this.pid180 * ang;
  }
}
