from flask import Flask, render_template, request
# from flask_restful import Api, Resource
from models.recommendationSystem import recommend_movie


app = Flask(__name__,template_folder='./frontend/templates', static_folder='./frontend/static')
# api = Api(app)


# class SearchName(Resource):
#     def get(self, movie):
#         return {"movie" : movie}
#     def post(self,movie):
#         return recommend(movie)

# class Recommend(Resource):
#     def get(self):
#         return {"movie" : "Harry Potter"}

# api.add_resource(SearchName, "/recommend/<string:name>")

@app.route("/", methods=['GET', 'POST'])
@app.route("/search", methods=['GET', 'POST'])
def search():
    return render_template('index.html')

@app.route("/recommend", methods=['GET', 'POST'])
def recommend():
    movie = request.args.get('movie')
    list_movies = []
    try : 
        list_movies = recommend_movie(movie)
    except Exception as e:
        print(e)
    return render_template('results.html', list_movies=list_movies, movie=movie)

if __name__ == '__main__':
    app.run(debug=False)