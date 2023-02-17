import pandas as pd
import numpy as np
from collections import deque

from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer

from gensim.models.doc2vec import Doc2Vec, TaggedDocument
import gensim
import gensim.downloader as api
from nltk.corpus import stopwords

def recommend_movie(movie):
    movie_metadata = pd.read_csv("./data/movies_metadata.csv", 
                    low_memory=False)[['original_title', 'overview', 'genres',
                    'vote_count']].set_index('original_title').dropna()
    movie_metadata = movie_metadata[movie_metadata['vote_count']>10].drop('vote_count', axis=1)
    movie_metadata.sample(5)
    tfidf = TfidfVectorizer(stop_words='english')
    tfidf_matrix = tfidf.fit_transform(movie_metadata['overview'].dropna())
    similarity = cosine_similarity(tfidf_matrix)
    similarity -= np.eye(similarity.shape[0])
    n_plot = 12
    index = 0
    try :
        index = movie_metadata.reset_index(drop=True)[movie_metadata.index==movie].index[0]
    except Exception as e:
        print(e)

    similar_movies_index = np.argsort(similarity[index])[::-1][:n_plot]
    similar_movie_titles = movie_metadata.iloc[similar_movies_index].index

    similar_movie = movie_metadata.iloc[similar_movies_index, 0:2]
    overview_genre = similar_movie.to_numpy().tolist()
    titles = similar_movie.index.to_numpy().tolist()

    data_set = []
    genres = []
    for index in range(len(titles)):
        genres = overview_genre[index][1]
        idx1 = genres.index("'name': ")
        idx2 = genres.index("'}")
        res = ''
        # getting elements in between
        for idx in range(idx1 + len("'name': ") + 1, idx2):
            res = res + genres[idx]
        data_set.append([titles[index], overview_genre[index][0], res])

    # print(similar_movie.to_numpy().tolist())
    # print(similar_movie.index.to_numpy().tolist())
    # print(np.array(similar_movie[0].values.toList())
    # datedate = [np.array(similar_movie[0].values.toList()),
    #             np.array(similar_movie[1].values.toList()),
    #             np.array(similar_movie[2].values.toList())]
    # real_date = [[o, ov, g ] for o,ov,g in datedate ]
    # print(real_date)

    return data_set


#-------------------------------------
#-----------WORD2VEC METHOD-----------
#-------------------------------------
def preprocess(sentence): 
    stop_words = stopwords.words('english')
    return [w for w in sentence.lower().split() if w not in stop_words]

def compose_overview(array_of_string):
    ov = ''
    for word in array_of_string: 
        if word != '': 
            ov += word + ' '
    return ov

def process_genres(string_genres):
    genres_list = [] 
    for i in range(2, len(string_genres)):
        if string_genres[i-3:i] == ': \'':
            gen = ''
            j = i
            while (string_genres[j] != '\''): 
                gen += string_genres[j]
                j += 1
            genres_list.append(gen.lower())
    return genres_list

def recommend_doc2vec_movie(movie):
    doc2vec_model = api.load('word2vec-google-news-300')
    stop_words = stopwords.words('english')
    movies_file = 'movies_metadata.csv'
    movies = pd.read_csv(movies_file)
    movies = movies[movies['status'] == 'Released']
    movies.head()
    genres = movies['genres']
    genres_new = [process_genres(genre) for genre in movies['genres']]
    movies['genres'] = genres_new
    movies.head()
    # -------------GENRE-BASED FILTERING-----------------
    genres = []
    for i in range(3):
        genre = input('write a genre to search for [Max 3], write | OK | to end\n')
        if genre != '':
            genres.append(genre)
        else: 
            break
    if len(genres) != 0: 
        genres = set(genres)
        intersection = [len(list(set(x) & genres)) for x in movies['genres']]
        bool_mask = [x > 0 for x in intersection]
        movies = movies[bool_mask]
        # -------DATE-BASED FILTERING------------------------
    date = input('write the year from which you want to search a movies from')
    if date != '': 
        date += '-01-01'
        movies = movies[movies['release_date'] > date]
    movies.head()
        #--------------VOTE-BASED FILTERING-------------------
    vote = input('write the minimum vote you want to search a movie for [don\'t be too bad]')
    if vote != '':
        vote = float(vote)
        movies = movies[movies['vote_average'] > vote]
    movies.head()
        # -------------DURATION-BASED FILTERING-------------------
    duration = input('write the average duration of the movie you want to watch')
    if duration != '':
        duration = float(duration)
        movies = movies[(movies['runtime'] > duration - 10) & (movies['runtime'] < duration + 10)]
    movies.head()
    overview = input("write a brief summary of what do you want to see")
    overview = preprocess(overview)
    # display(overview)
    way_of_representation = input('do you want to search through the title or the overview? [T/O]')
    while (True):
        if way_of_representation == 'O':
            by_title = False
            overview = input('write the overview of the film you want to search a similar one for')
            overview = preprocess(overview)
            print(overview)
            break
        elif way_of_representation == 'T':
            title = input('write the title of the movie you want to search a similar one for')
            by_title = True
            try: 
                overview = name_overview[name_overview['original_title'] == title]['overview']
                print(title)
                break
            except Exception:
                print(title + ' does not exist in the database, check for its correctness or try another title' )
                # display(title + ' does not exist in the database, check for its correctness or try another title' )
        else: 
            way_of_representation = input('Sorry character not understood!\nPlease, write T if you want to search by Title, O if you want to search by Overview')
    reduced_dataset = movies[['original_title','overview','genres','release_date','runtime','vote_average']]
    reduced_dataset = reduced_dataset.dropna()
    length_overview = [len(x) for x in reduced_dataset['overview']]
    reduced_dataset['length_overview'] = length_overview
    reduced_dataset = reduced_dataset[reduced_dataset['length_overview'] > 5]
    distances = reduced_dataset['overview'].apply(lambda ov: doc2vec_model.wmdistance(overview, ov))
    best_indeces = np.argpartition(distances, -5)[-5:]
    reduced_dataset['distances'] = distances
    most_similar = reduced_dataset.iloc[best_indeces]
    most_similar
    return 0