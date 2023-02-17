let list = document.querySelector('.wrapper');
let listManga = document.querySelector('.list-results');

function recupererParametreById(id) {
    var regexpString = "[?&]" + id + "=([^&#]*)";
    var regexp = new RegExp(regexpString);
    var value = regexp.exec(window.location.search);
    if (value == null)
        return null;
    else
        return decodeURIComponent(value[1].replace(/\+/g, ' '));
}

// block list manga display
const displayList = () => {
    let style = list.style.display
    if (style == 'none') {
        list.style.display = 'block';
    } else {
        list.style.display = 'none';
    }
}

let search = document.querySelector('#search');
// filter event
search.addEventListener('keyup', () => {
    const term = search.value.trim().toLowerCase();
    filterManga(term);
});

const displayNone = () => {
    list.style.display = 'none';
}

const filterManga = term => {
    // add filtered class
    Array.from(listManga.children)
        .filter(manga => !manga.textContent.toLowerCase().includes(term))
        .forEach(manga => manga.classList.add('filtered'));

    // remove filtered class
    Array.from(listManga.children)
        .filter(manga => manga.textContent.toLowerCase().includes(term))
        .forEach(manga => manga.classList.remove('filtered'));

    let filtredArray = Array.from(listManga.children)
        .filter(manga => !manga.textContent.toLowerCase().includes(term));

    //remove the drop down if no result was found
    if (Array.from(listManga.children).length === filtredArray.length) {
        list.style.display = 'none';
    }

    //show results on change
    SecondFiltredArray = Array.from(listManga.children)
        .filter(manga => manga.textContent.toLowerCase().includes(term));
    if (SecondFiltredArray.length !== 0) {
        list.style.display = 'block';
    }

};


listManga.firstChild.addEventListener('click', e => {
    console.log(e.target)
});

var resArray = [];
var resArraychara = [];
var resArrayAuthors = [];
var finalArray = [];
var resArrayActors = [];

function load() {

    //request list of manga
    var url = "https://query.wikidata.org/sparql";
    var query = [

        "Select Distinct ?mangaLabel where{",
        "values ?type {wd:Q21198342 wd:Q63952888 wd:Q747381 wd:Q8274}",
        "?manga wdt:P31 ?type.",
        "SERVICE wikibase:label { bd:serviceParam wikibase:language \"en\". }",
        "} order by desc(?mangaLabel)",
        "Limit 7815"

    ].join(" ");
    var queryUrl = url + "?query=" + encodeURIComponent(query) + "&format=json";

    $.ajax({
        dataType: "json",
        url: queryUrl,
        success: function(_data) {
            const results = _data.results.bindings;
            for (var j in results) {
                resArray.push(results[j].mangaLabel.value);
                finalArray.push(results[j].mangaLabel.value);
            }
            //console.log('Test Manga : ' + resArray);
            console.log("list Manga");
            console.log(resArray);
            //addEvents(listManga);

        }
    });


    function makeSPARQLQuery(endpointUrl, sparqlQuery, doneCallback) {
        var settings = {
            headers: { Accept: 'application/sparql-results+json' },
            data: { query: sparqlQuery }
        };
        return $.ajax(endpointUrl, settings).then(doneCallback);
    }

    var endpointUrl = 'https://query.wikidata.org/sparql',
        sparqlQuery = "Select distinct ?characterLabel where {\n" +
        "{?manga wdt:P31 wd:Q196600; wdt:P527 ?media.\n" +
        " ?media wdt:P31 wd:Q21198342. } \n" +
        "Union\n" +
        "{?manga wdt:P31 wd:Q21198342.}\n" +
        "Union{\n" +
        "?manga wdt:P31 wd:Q63952888.\n" +
        "}UNION{\n" +
        "?manga wdt:P31 wd:Q104213567.\n" +
        "}UNION{\n" +
        "?manga wdt:P31 wd:Q8274.}\n" +
        "?character wdt:P1441 ?manga. \n" +
        "  SERVICE wikibase:label { bd:serviceParam wikibase:language \"en\". }}";

    makeSPARQLQuery(endpointUrl, sparqlQuery, function(data) {
        var resultschara = data.results.bindings;
        //console.log('Debut Test');
        const regex = new RegExp('^Q[0-9]+');
        for (let i = 0; i < resultschara.length; i++) {
            //console.log('Debut for')
            if (!(regex.test(resultschara[i].characterLabel.value))) {
                resArraychara.push(resultschara[i].characterLabel.value);
                finalArray.push(resultschara[i].characterLabel.value);
            } else {
                //console.log('Test else OK')
                i++;
            }
        }
        console.log('Test Array char');
        console.log(resArraychara);
    });

    // request list of authors
    var url = "http://dbpedia.org/sparql";
    var query2 = ["PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>",
        "PREFIX dbo: <http://dbpedia.org/ontology/>",

        "SELECT DISTINCT str(?auteur) ?author",
        "WHERE {",
        "values ?type {dbo:Manga dbo:Anime dbo:Light_Novel}",
        "?manga a ?type .",
        "?manga rdfs:label ?name",
        "values ?lienAuteur {dbp:author dbp:creator}",
        "?manga ?lienAuteur ?auteur.",

        "FILTER(langMatches(lang(?name),\"en\"))",
        "FILTER( contains(str(?auteur),\"http\"))",
        "FILTER( !contains(lcase(str(?auteur)),\"company\"))",
        "FILTER( !contains(lcase(str(?auteur)),\"animation\"))",
        "FILTER( !contains(lcase(str(?auteur)),\"entertainment\"))",
        "FILTER( !contains(lcase(str(?auteur)),\"studio\"))",
        "BIND(replace(str(?auteur), \"http://dbpedia.org/resource/\", \"\") as ?author)",
        "}",
    ].join(" ");
    var queryUrlAuthors = url + "?query=" + encodeURIComponent(query2) + "&format=json";
    $.ajax({
        dataType: "jsonp",
        url: queryUrlAuthors,
        success: function(_data) {
            //console.log("success");
            var results = _data.results.bindings;
            for (var i in results) {
                resArrayAuthors.push(results[i].author.value);
                finalArray.push(results[i].author.value);
            }
            console.log('Test authors : ')
            console.log(resArrayAuthors);
        }
    });

    //request list of actors
    var url = "https://query.wikidata.org/sparql";
    var queryVoice = [
        "Select distinct ?voiceLabel  where {",
        "{?manga wdt:P31 wd:Q196600; wdt:P527 ?media.",
        "?media wdt:P31 wd:Q21198342. } ",
        "Union",
        "{?manga wdt:P31 wd:Q21198342.}",
        "Union{",
        "?manga wdt:P31 wd:Q63952888.",
        "}UNION{",
        "?manga wdt:P31 wd:Q104213567.",
        "}UNION{",
        "?manga wdt:P31 wd:Q8274.}",
        "?character wdt:P1441 ?manga.",
        "?character wdt:P725 ?voice.",

        "SERVICE wikibase:label { bd:serviceParam wikibase:language \"en\". }}",

    ].join(" ");
    var queryUrlVoice = url + "?query=" + encodeURIComponent(queryVoice) + "&format=json";

    $.ajax({
        dataType: "json",
        url: queryUrlVoice,
        success: function(_data) {
            const results = _data.results.bindings;
            for (var j in results) {
                resArrayActors.push(results[j].voiceLabel.value);
                finalArray.push(results[j].voiceLabel.value);
            }
            //console.log('Test Manga : ' + resArray);
            console.log("Voice Actor List");
            console.log(resArrayActors);
        }
    });


    //final Array


    setTimeout(() => {
        ajouter()
            /* console.log("final array");
            console.log(finalArray);
            for (let i = 0; i < finalArray.length; i++) {
                const html = `<li class="item">` + finalArray[i] + `</li>`;
                listManga.innerHTML += html;
            } */
    }, 10000);

    setTimeout(() => {
        const inputSearch = document.getElementById("search");
        document.getElementById("list-manga ").addEventListener("click", function(e) {
            let input = e.target.innerHTML;
            if (e.target && e.target.matches("li.item")) {
                if (input.includes("(manga)")) {
                    input = input.replace(" (manga)", "")
                }

                if (input.includes("(personnage)")) {
                    input = input.replace(" (personnage)", "");
                }
                if (input.includes("(auteur)")) {
                    input = input.replace(" (auteur)", "");
                }
                if (input.includes("(doubleur)")) {
                    input = input.replace(" (doubleur)", "");
                }
                console.log("debut" + input + "fin");
                inputSearch.value = input;
                searching(input);
            }
        });
    }, 12000)

    const searching = (elem) => {
        for (var i = 0; i < resArray.length; i++) {
            if (resArray[i] === elem) {
                console.log("manga");
                replaceUrl("manga", elem);
            }
        }
        for (var i = 0; i < resArraychara.length; i++) {
            if (resArraychara[i] === elem) {
                console.log("personnage")
                replaceUrl("personnage", elem);
            }
        }
        for (var i = 0; i < resArrayAuthors.length; i++) {
            if (resArrayAuthors[i] === elem) {
                replaceUrl("auteur", elem);
                console.log("auteur")
            }
        }
        for (var i = 0; i < resArrayActors.length; i++) {
            if (resArrayActors[i] === elem) {
                console.log("voice actor")
                replaceUrl("voice_actors", elem);
            }
        }
    }

    const replaceUrl = (page, item) => {
        window.location.replace(page + ".html?" + page + "=" + item.replace(" ", "_"));
    }


}


// function d'optimisation du temps d'affichage

var global_manga = "";
var global_author = "";
var global_voices = "";
var global_chara = "";

function ajouter() {

    for (let i = 0; i < resArray.length; i++) {
        var liItem = "<li class=\"item\">" + resArray[i] + " (manga)</li>";
        global_manga += liItem;
    }
    for (let i = 0; i < resArraychara.length; i++) {
        var liItem = "<li class=\"item\">" + resArraychara[i] + " (personnage)</li>";
        global_author += liItem;
    }
    for (let i = 0; i < resArrayAuthors.length; i++) {
        var liItem = "<li class=\"item\">" + resArrayAuthors[i] + " (auteur)</li>";
        global_voices += liItem;
    }
    for (let i = 0; i < resArrayActors.length; i++) {
        var liItem = "<li class=\"item\">" + resArrayActors[i] + " (doubleur)</li>";
        global_chara += liItem;
    }
    listManga.innerHTML += global_manga;
    listManga.innerHTML += global_author;
    listManga.innerHTML += global_voices;
    listManga.innerHTML += global_chara;
}