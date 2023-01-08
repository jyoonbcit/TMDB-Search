current_page = 1;
page_size = parseInt($("#view option:selected").val());
// JSON_data becomes API data after setup()
JSON_data = {};
// initializes as empty array
list_all_movies = [];

// helper to change page display
function change_view(new_view) {
    page_size = new_view;
    display(current_page, page_size);
}

// helper to reset pagination buttons
function reset_display() {
    $("main").empty();
    $("aside").empty();
}

// function for updating current_page
// needed because of function calls in html buttons
function change_page(new_page) {
    current_page = new_page;
}

function display(current_page, page_size) {
    reset_display();
    paginate_buttons(JSON_data);
    // when setup() runs, start_index = 0
    let start_index = page_size * (current_page - 1);
    // when setup() runs, end_index = page_size
    let end_index = page_size * (current_page - 1) + page_size;

    for (i = start_index; i < end_index; i++) {
        if (list_all_movies[i] != undefined) {
            $("main").append(
                `
            <div>
            <h3> # ${i + 1} </h3>
            <p>
            ${list_all_movies[i].title}
            </p>
            <p>
            ${list_all_movies[i].overview}
            </p>
            <img src="https://image.tmdb.org/t/p/w500/${list_all_movies[i].poster_path}" style="width: 100%">
            <button movieBackdropImageName="${list_all_movies[i].backdrop_path}" class="backdropBtn"> Backdrop Image </button>
            <hr>
            </div>
            `
            )
        }
    }

    // backdrop button
    $("body").on("click", ".backdropBtn", function () {
        $("aside").html(
            `
            <img src="https://image.tmdb.org/t/p/w500/${$(this).attr('movieBackdropImageName')}">
            `
        )
    })
}

// helper to generate previous button
function display_previous_buttons() {
    if (current_page > 1) {
        $("#previous-button").attr("onclick", `change_page(${current_page - 1}); display(${current_page - 1}, ${page_size})`)
    } else {
        $("#previous-button").attr("onclick", `change_page(${current_page}); display(${current_page}, ${page_size})`)
    }
    $("#first-button").attr("onclick", `change_page(1); display(1, ${page_size})`);
}

// helper to generate next button
function display_next_buttons(data) {
    $("#last-button").attr("onclick", `change_page(${Math.ceil(data.total_results / page_size)}); display(${Math.ceil(data.total_results / page_size)}, ${page_size})`)
    if (current_page < Math.ceil(data.total_results / page_size)) {
        $("#next-button").attr("onclick", `change_page(${current_page + 1}); display(${current_page + 1}, ${page_size})`)
    } else {
        $("#next-button").attr("onclick", `change_page(${current_page}); display(${current_page}, ${page_size})`)
    }
}

// generate page buttons
function paginate_buttons(data) {
    // clear buttons so they don't duplicate
    $("#buttons-to-add").html("");
    display_previous_buttons(data);
    for (i = 1; i < Math.ceil(data.total_results / page_size) + 1; i++) {
        // create buttons
        $("#buttons-to-add").append(
            `
            <button id="${i}" onclick="change_page(${i}); display(${i}, ${parseInt($('#view option:selected').val())})"> ${i} </button>
            `
        )
        $("body").on("click", $(`#${i}`), () => {
            $("#previous-button").attr("style", "display:visible")
            $("#next-button").attr("style", "display:visible")
        })
    }
    display_next_buttons(data);
}

function setup() {
    // if user clicks search
    $("body").on("click", "#submit-search", () => {
        $("main").empty();
        $("#first-button").attr("style", "display:visible")
        $("#last-button").attr("style", "display:visible")

        list_all_movies = [];
        change_page(1);
        page_size = parseInt($("#view option:selected").val());

        // initialize JSON_object
        $.ajax(
            {
                // create page loop in URL
                url: `https://api.themoviedb.org/3/search/movie?api_key=613009c50b949c21d43f81589c33203f&language=en-US&query=${$("#search").val()}&page=${current_page}&include_adult=false`,
                type: "GET",
                success:
                    function (data) {
                        JSON_data = data;

                        // updating global variables...
                        for (i = 1; i < data.total_pages + 1; i++) {
                            (function (i) {
                                // ajax call for API on page (i)
                                $.ajax({
                                    url: `https://api.themoviedb.org/3/search/movie?api_key=613009c50b949c21d43f81589c33203f&language=en-US&query=${$("#search").val()}&page=${i}&include_adult=false`,
                                    type: "GET",
                                    success:
                                        function (result_data) {
                                            // for each result on page (i), load into list_all_movies
                                            result_data.results.forEach(function (element) {
                                                list_all_movies.push(element)
                                            })
                                            display(1, page_size);
                                            change_page(1);
                                        }
                                });
                            })(i)
                        }
                    }
            })
    })
} $(document).ready(setup)