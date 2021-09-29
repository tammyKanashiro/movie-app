/* Double range slider */
const inputLeft = document.getElementById("input-left");
const inputRight = document.getElementById("input-right");

const thumbLeft = document.querySelector(".slider > .thumb.left");
const thumbRight = document.querySelector(".slider > .thumb.right");
const range = document.querySelector(".slider > .range");

let y1 = document.getElementById('y1');
let y2 = document.getElementById('y2');

/* Search bar */
const form = document.getElementById('form');
const searchBar = document.getElementById('searchBar');

/* Search result lisr */
const movieList = document.getElementsByClassName('movie-list');

/* Movie information body */
const bodyInfo = document.getElementsByClassName('info-wrapper');
const bodyDesc = document.getElementsByClassName('description');
const bodyRating = document.getElementsByClassName('rating-section');

/* Watchlist */
const watchlist = document.getElementsByClassName('watchlist');
let watchlistSaved = [];

// const movieItem = document.getElementsByClassName('movieItem');

/* Double range slider - left thumb */
const setLeftValue = () => {
	let min = parseInt(inputLeft.min);
	let max = parseInt(inputLeft.max);

    inputLeft.value = Math.min(parseInt(inputLeft.value), parseInt(inputRight.value) - 1);

	const percent = ((inputLeft.value - min) / (max - min)) * 100;

	thumbLeft.style.left = percent + "%";
	range.style.left = percent + "%";

    y1.textContent = inputLeft.value;
}

/* Double range slider - right thumb */
const setRightValue = () => {
	let min = parseInt(inputRight.min)
	let max = parseInt(inputRight.max);

    inputRight.value = Math.max(parseInt(inputRight.value), parseInt(inputLeft.value) + 1);

	const percent = ((inputRight.value - min) / (max - min)) * 100;

	thumbRight.style.right = (100 - percent) + "%";
	range.style.right = (100 - percent) + "%";

    y2.textContent = parseInt(inputRight.value);
}

setLeftValue();
setRightValue();

inputLeft.addEventListener("input", setLeftValue);
inputRight.addEventListener("input", setRightValue);

/* Get watchlist - localStorage */
const getWatchlist = () => {
    const data = localStorage.getItem("watchlist");

    return JSON.parse(data);
}

/* Watchlist - add/remove movie from watchlist */
watchlist[0].querySelector('.watchlist-link').addEventListener('click', e => {
    e.preventDefault();

    const movieId = watchlist[0].id;
    const data = getWatchlist();

    if (data !== null) {
        const hasItem = data.indexOf(movieId);

        if (hasItem >= 0) {
            data.splice(data.indexOf(movieId), 1);
            watchlist[0].classList.remove('has-item');
        } else {
            data.push(movieId);
            watchlist[0].classList.add('has-item');
        }

        watchlistSaved = data;

    } else {
        watchlistSaved.push(movieId);
    }

    localStorage.setItem("watchlist", JSON.stringify(watchlistSaved));
    console.log('watchlist localstorage', getWatchlist())
});

/* Search all movies by title */
const searchMovies = async (title) => {
    const typeOp = document.querySelector('input[name="type"]:checked').id;
    let urlBase ='http://www.omdbapi.com/?apikey=61fbd7c1';

    urlBase += `&s=${title}`;

    if (typeOp !== 'any') {
        urlBase +=`&type=${typeOp}`;
    }
    
    const response = await fetch(urlBase);

    if (response.ok) {
        const data = response.json();

        data.then(res => {
            showMovies(res);
        }).catch(err => {
            console.log('err', err);
        });
    }
    
}

/* Add movies found to movies list */
const showMovies = (results) => {
    const movieQty = document.getElementById('movies-qty');
    
    movieList[0].innerHTML = '';

    if (results.Response === 'True') {
        movieQty.children[0].textContent  = results.Search.length;

        (results.Search).forEach((item, id) => {
            let li = document.createElement("li");
            li.classList.add('movieItem');

            if (id === 0) {
                li.classList.add('is-selected');
                getMovieInfo(item.Title);
            } 

            li.innerHTML = `
                <img src=${item.Poster}>
                <div>
                    <p class="movie-title">${item.Title}</p>
                    <p class="movie-year">${item.Year}</p>
                    <a class="movieItem-link"></a>
                </div>
            `

            li.querySelector('.movieItem-link').addEventListener('click', e => {
                const itemList = document.getElementsByClassName('movieItem');
                if (itemList.length > 0) {
                    for (let i = 0; i < itemList.length; i++) {
                        itemList[i].classList.remove('is-selected');
                    };
                }

                e.target.parentElement.parentElement.classList.add('is-selected');
                const title = e.target.parentElement.querySelector('.movie-title').textContent;

                getMovieInfo(title);
                
            });

            movieList[0].appendChild(li);
        });
    } else {
        console.log(results.Error);
        movieQty.children[0].textContent  = 'No';
        bodyInfo[0].classList.remove('is-open');
        bodyDesc[0].classList.remove('is-open');
        bodyRating[0].classList.remove('is-open');
    }
}

/* Search movie by title */
const getMovieInfo = async (title) => {
    let urlBase ='http://www.omdbapi.com/?apikey=61fbd7c1';

    urlBase += `&t=${title}`;

    const response = await fetch(urlBase)

    if (response.ok) {
        const data = response.json();

        data.then(res => {
            // console.log('res', res);
            showMovieDesc(res);
        }).catch(err => {
            console.log('err', err);
        });
    }
}

/* Display selected movie information */
const showMovieDesc = (result) => {
    bodyInfo[0].classList.add('is-open');
    bodyDesc[0].classList.add('is-open');
    bodyRating[0].classList.add('is-open');

    const moviePoster  = document.getElementById('info-img');
    const movieTitle = document.getElementById('info-title');
    const movieRated = document.getElementById('rated');
    const movieYear = document.getElementById('year');
    const movieGenre = document.getElementById('genre');
    const movieDuration = document.getElementById('duration');
    const movieActors = document.getElementById('actors');

    const movieDesc = document.getElementById('movie-desc');

    const movieImd = document.getElementById('rating-imd');
    const movieRt = document.getElementById('rating-rt');
    const movieM = document.getElementById('rating-m');

    if (result) {
        const data = getWatchlist();

        if (data !== null) {
            const hasItem = data.indexOf(result.imdbID);
        
            if (hasItem >= 0) {
                watchlist[0].classList.add('has-item');
            } else {
                watchlist[0].classList.remove('has-item');
            }
        } 

        watchlist[0].id = result.imdbID;
        moviePoster.src = result.Poster;
        movieTitle.textContent = result.Title;
        movieRated.textContent = result.Rated;
        movieYear.textContent = result.Year;
        movieGenre.textContent = result.Genre;
        movieDuration.textContent = result.Runtime;
        movieActors.textContent = result.Actors;

        movieDesc.textContent = result.Plot;

        movieImd.textContent = result.Ratings[0].Value;

        if (result.Ratings[1]) {
            movieRt.textContent = result.Ratings[1].Value;
        }

        if (result.Ratings[2]) {
            movieM.textContent = result.Ratings[2].Value;
        }
    }
}

/* Search bar */
form.addEventListener('submit', e => {
    e.preventDefault();

    let searchText = searchBar.value;

    if (searchText) {
        searchText = searchText.replace(/\s+/g, '+');

        searchMovies(searchText)
    }
});
