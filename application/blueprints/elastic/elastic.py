# -*- coding: utf-8 -*-
import json
from flask import Blueprint, render_template, jsonify, request, Response
from jinja2 import TemplateNotFound
from .. import app, es

node = Blueprint("elastic", __name__, 
                    template_folder="templates",
                    static_folder="static")

@node.route('/webpack')
def webpack():
    return render_template("elastic/webpack.html")

@node.route('/index')
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

@node.route('/query/<index>', methods=['GET', 'POST'])
def query(index):
    keyword = request.values.get("keyword", None)
    search_result = es.client.search(index, "document", body = {
        "_source": ["filename", "title", "page_number" ],
            "query" : {
                "match" : { "attachment.content": keyword }
            },
            "highlight": {
                "fields" : {
                    "attachment.content" : {
                        "fragment_size" : 150,
                        "number_of_fragments" : 3,
                        "no_match_size": 50
                    }
                }
        }
    })

    hits = search_result["hits"]["hits"]

    hits_dict = {}

    for hit in hits:
        source = hit["_source"]
        content = hit["highlight"]["attachment.content"]
        result = {
            "title" : source["title"],
            "filename" : source["filename"],
            "page_number" : source["page_number"],
            "content" : content
        }

        data = hits_dict.get(source["title"], [])
        data.append(result)
        hits_dict[source["title"]] = data

    json_string = json.dumps([ { "title" : key, "hits" : value} for key, value in hits_dict.items()], ensure_ascii=False, indent=4)
    response = Response(json_string,content_type="application/json; charset=utf-8" )
    return response



@node.route('/search')
def search():
    return render_template("elastic/search.html", elastic_index="thienquan", elastic_type="document")