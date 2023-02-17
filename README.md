# IntelligentMovieRecommander ( Intelligent Decision Support System Project)
Project realized by Niko Picello, Salma Waqif, Lapo Carrieri, Yasmine Souabi, Hanaa Al Zahabi


### Overview
The project consists in the creation of a movie reccomander system using word2vec and Cosine TFIDF Movie Description Similarity in order to develop a website user-friendly to choose the movie. 
With word2vec_model.ipynb the summaries of the movies is taken into account to find a movie that is similar to the chosen one, with Movie_reccomander_tfIDF.ipynb instead it is possible to choose the movie considering the reviews of the similar users.

### Demonstration


https://user-images.githubusercontent.com/56505429/219658217-1916cc21-dff4-4e71-89bc-0e5aeed34cba.mp4



### Download the datasets
Download the datasets on Kaggle.

https://www.kaggle.com/datasets/rounakbanik/the-movies-dataset/download?datasetVersionNumber=7
https://www.kaggle.com/datasets/netflix-inc/netflix-prize-data/download?datasetVersionNumber=2
### How to run the code
set up you virtual environnement : 'python -m venv venv' './venv/Script/activate'

Upgrade the environnement 'python -m pip install --upgrade pip' 'python -m pip install -r /path/to/requirements.txt'

Before running the app, launch these 2 commands, then run : 'python -m flask run'

### Acknowledgments
https://www.kaggle.com/code/morrisb/how-to-recommend-anything-deep-recommender/notebook
https://www.kaggle.com/code/rounakbanik/movie-recommender-systems/notebook
