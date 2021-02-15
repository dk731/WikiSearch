class UrlParser {
  constructor(murl) {
    this.img_scr_ignore_list = [
      "/static/",
      "Symbol_book_class",
      "Folder_Hexagonal_Icon",
    ];
    this.main_url = murl;
    this.tmp_DOM = document.createElement("html");

    this.unique_a_hrefs = new Set();

    var p_date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    var n_date = new Date();

    this.wiki_api = {
      lang_ext: this.main_url.substr(
        8,
        this.main_url.indexOf(".wikipedia.org") - 8
      ),
      cur_date:
        n_date.getFullYear() +
        String(n_date.getMonth() + 1).padStart(2, "0") +
        String(n_date.getDate()).padStart(2, "0"),
      past_date:
        p_date.getFullYear() +
        String(p_date.getMonth() + 1).padStart(2, "0") +
        String(p_date.getDate()).padStart(2, "0"),
      pageviews_base_url: "",
      images_base_url: "",
      response_obj: {},
    };

    this.wiki_api.images_base_url = "https://.wikipedia.org/wiki/".insert(
      8,
      this.wiki_api.lang_ext
    );

    this.wiki_api.pageviews_base_url =
      "https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/.wikipedia/all-access/all-agents//daily//"
        .insert(-1, this.wiki_api.past_date)
        .insert(64, this.wiki_api.lang_ext) + this.wiki_api.cur_date;
  }

  async fetch_main_url() {
    await fetch(this.main_url)
      .then((response) => response.text())
      .then((data) => (this.tmp_DOM.innerHTML = data));

    Array.from(
      this.tmp_DOM
        .getElementsByClassName("mw-body")[0]
        .getElementsByTagName("a")
    ).forEach((el) => {
      var tmp = el.getAttribute("href");
      if (tmp && tmp.includes("/wiki/") && !tmp.includes(":")) {
        tmp = tmp.substring(6);
        if (tmp.includes("#")) tmp = tmp.substring(0, tmp.indexOf("#"));

        this.unique_a_hrefs.add(tmp);
      }
    });
  }

  async gather_url_nodes_data() {
    var prev_millis = Date.now();
    var promise_list = [];
    this.unique_a_hrefs.forEach((art_name) => {
      this.promise_count++;
      while (Date.now() - prev_millis < 10);
      this.wiki_api.response_obj[art_name] = { pageviews: 0, img_url: "" };
      promise_list.push(
        fetch(this.wiki_api.pageviews_base_url.insert(-24, art_name))
          .then((response) => response.json())
          .then((data) => {
            data.items.forEach((l) => {
              this.wiki_api.response_obj[art_name].pageviews += l.views;
            });

            promise_list.push(
              fetch(this.wiki_api.images_base_url + art_name)
                .then((response) => response.text())
                .then((data) => {
                  this.tmp_DOM.innerHTML = data;
                  var valid_scrs = [];

                  Array.from(this.tmp_DOM.getElementsByTagName("img"))
                    .filter((el) => {
                      var passed = true;
                      var tmp_src = el.getAttribute("src");
                      this.img_scr_ignore_list.forEach(
                        (ignr) => (passed &= !tmp_src.includes(ignr))
                      );
                      return passed;
                    })
                    .forEach((el) => valid_scrs.push(el.getAttribute("src")));

                  if (valid_scrs.length == 0)
                    this.wiki_api.response_obj[art_name].img_url =
                      "https://www.wikipedia.org/portal/wikipedia.org/assets/img/Wikipedia-logo-v2.png";
                  else
                    this.wiki_api.response_obj[art_name].img_url =
                      valid_scrs[0];
                })
            );
          })
          .catch(
            (err) =>
              (this.wiki_api.response_obj.art_name = {
                pageviews: 1,
                img_url:
                  "https://www.wikipedia.org/portal/wikipedia.org/assets/img/Wikipedia-logo-v2.png",
              })
          )
      );
      prev_millis = Date.now();
    });

    await Promise.all(promise_list);
    await Promise.all(promise_list);
  }
}

String.prototype.insert = function (index, string) {
  var ind = index < 0 ? this.length + index : index;
  return this.substring(0, ind) + string + this.substr(ind);
};
