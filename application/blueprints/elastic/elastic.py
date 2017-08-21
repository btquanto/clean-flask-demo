# -*- coding: utf-8 -*-
import json
from flask import Blueprint, render_template, jsonify, request, Response
from jinja2 import TemplateNotFound
from .. import app, es

node = Blueprint("elastic", __name__,
                    template_folder="templates",
                    static_folder="static")

@node.route('/')
@node.route('/index')
def webpack():
    return render_template("elastic/webpack.html")

@node.route('/index2')
def index():
    return render_template("elastic/index.html",
                            elastic_host=app.config["ELASTICSEARCH_HOST"],
                            elastic_index="thienquan",
                            elastic_type="document")

@node.route('/test/index')
def test():
    return render_template("elastic/index.html",
                            elastic_host=app.config["ELASTICSEARCH_HOST"],
                            elastic_index="thienquan",
                            elastic_type="document")

@node.route('/indices')
def list_indices():
    indices = es.client.cat.indices(h=["index"]).split('\n')
    return jsonify({
        "success" : True,
        "data" : indices
    })

@node.route('/query', methods=['GET', 'POST'])
def query():
    index = request.values.get("index", None)
    if index is None:
        return jsonify(success = False, error = "missing_index")
    keyword = request.values.get("keyword", None)
    sorted_by = request.values.get("sorted_by", "page_number")
    body = {
        "_source": ["filename", "title", "page_number", "pages"],
        "highlight": {
            "fields" : {
                "attachment.content" : {
                    "pre_tags" : ["<mark>"],
                    "post_tags" : ["</mark>"],
                    "order" : "score",
                    "fragment_size" : 150,
                    "number_of_fragments" : 3,
                    "no_match_size": 50
                }
            }
        },
        "query" : {
            "bool" : {
                "must" : [
                    {
                        "match" : {
                            "attachment.content" : keyword
                        }
                    }
                ],
                "filter": [
                    {
                        "term" : { "isEnabled" : True }
                    }
                ]
            }
        }
    }

    if keyword is None:
        del body["query"]

    search_result = es.client.search(index, "document", body = body)

    # return Response(json.dumps(search_result, ensure_ascii=False, indent=4),content_type="application/json; charset=utf-8" )

    hits = search_result["hits"]["hits"]

    hits_dict = {}

    for hit in hits:
        source = hit["_source"]
        highlights = hit["highlight"]["attachment.content"]
        result = {
            "score" : hit["_score"],
            "filename" : source["filename"],
            "pages" : source["pages"]
        }

        if result["score"] != 1.0:
            result["page_number"] = source["page_number"]
            result["highlights"] = highlights

        data = hits_dict.get(source["title"], [])
        data.append(result)
        hits_dict[source["title"]] = data

    if "page_number" in result:
        json_string = json.dumps(
                {
                    "success" : True,
                    "hits" : [
                        {
                            "title" : key,
                            "pages" : sorted(value, key=lambda p : p[sorted_by], reverse=(sorted_by == "score"))
                        }
                        for key, value in hits_dict.items()
                    ]
                }
                , ensure_ascii=False, indent=4
            )
    else:
        json_string = json.dumps(
                {
                    "success" : True,
                    "hits" : [
                        {
                            "title" : key,
                            "pages" : value
                        }
                        for key, value in hits_dict.items()
                    ]
                }
                , ensure_ascii=False, indent=4
            )

    response = Response(json_string,content_type="application/json; charset=utf-8" )
    return response



@node.route('/search')
def search():
    return render_template("elastic/search.html", elastic_index="thienquan", elastic_type="document")
