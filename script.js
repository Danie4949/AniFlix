
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
  import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

  const firebaseConfig = {
    apiKey: "AIzaSyD6-t2ESOVNlRUzMpQqyNzYccAd6-TpD6k",
    authDomain: "the-4th-division.firebaseapp.com",
    projectId: "the-4th-division",
    storageBucket: "the-4th-division.firebasestorage.app",
    messagingSenderId: "273361823698",
    appId: "1:273361823698:web:7f254c77cf6286df764a0b",
    measurementId: "G-QRR1KDHPGC"
  };

  const app = initializeApp(firebaseConfig);
  const auth = getAuth();

  // Sign-up function
  async function signUp() {
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      alert("Account created successfully! You can now log in.");
      showLoginFromSignup(); // Switch to the login form
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  }

  // Login function
  async function login() {
    const email = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      alert("Logged in successfully!");
      currentUser = { email: userCredential.user.email };
      document.getElementById("loginForm").classList.add("hidden");
      document.getElementById("mainContent").classList.remove("hidden");
      fetchMovies(); // Fetch movies after login
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  }

  // Logout function
  async function logout() {
    try {
      await signOut(auth);
      alert("Logged out successfully!");
      currentUser = null;
      document.getElementById("loginForm").classList.remove("hidden");
      document.getElementById("mainContent").classList.add("hidden");
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  }

      let selectedMovie = null;
      let allMovies = [];
      let likeCounts = {};
      let dislikeCounts = {};
      let userReactions = {};
      let currentPage = 1;
      const moviesPerPage = 15; // Set the number of movies per page to 15
      let users = [];
      let currentUser = null;
      let movieComments = {}; // Store comments for each movie

      function sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
      }

      async function fetchMovies() {
  try {
    let page = 1;
    while (allMovies.length < 200) {
      const res = await fetch(`https://api.jikan.moe/v4/top/anime?type=movie&page=${page}`);
      const data = await res.json();
      if (!data.data || data.data.length === 0) break;
      allMovies = allMovies.concat(data.data);
      page++;
      await sleep(1000);
    }
    console.log("Loaded movies from API:", allMovies);
    displayMovies(allMovies, 1);
  } catch (error) {
    console.error("API Fetch failed, loading mock data instead...", error);
    // Fallback mock data
    allMovies = [
      {
        mal_id: 1,
        title: "My Neighbor Totoro",
        synopsis: "Two girls move to the countryside and meet a friendly forest spirit.",
        genres: [{ name: "Fantasy" }, { name: "Family" }],
        images: {
          jpg: {
            image_url: "https://upload.wikimedia.org/wikipedia/en/0/0b/My_Neighbor_Totoro_-_Tonari_no_Totoro_%281988%29_theatrical_poster.jpg"
          }
        }
      },
      {
        mal_id: 2,
        title: "Spirited Away",
        synopsis: "A girl enters a magical world to save her parents.",
        genres: [{ name: "Adventure" }, { name: "Fantasy" }],
        images: {
          jpg: {
            image_url: "https://upload.wikimedia.org/wikipedia/en/3/30/Spirited_Away_poster.JPG"
          }
        }
      },
      {
        mal_id: 3,
        title: "Your Name",
        synopsis: "Two teenagers share a magical connection that intertwines their lives.",
        genres: [{ name: "Romance" }, { name: "Drama" }],
        images: {
          jpg: {
            image_url: "https://upload.wikimedia.org/wikipedia/en/0/0b/Your_Name_poster.png"
          }
        }
      }
    ];
    displayMovies(allMovies, 1);
  }
}


      async function fetchGenres() {
  const dropdown = document.getElementById("genresDropdown");
  dropdown.innerHTML = '<p style="padding: 10px; color: #fff;">Loading genres...</p>'; // Show a loading message

  try {
    const res = await fetch("https://api.jikan.moe/v4/genres/anime");
    const data = await res.json();

    dropdown.innerHTML = ""; // Clear the dropdown content

    // List of genres to display in alphabetical order
    const allowedGenres = ["Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror", "Romance", "Sci-Fi"];
    const filteredGenres = data.data.filter((genre) => allowedGenres.includes(genre.name));

    // Sort genres alphabetically
    filteredGenres.sort((a, b) => a.name.localeCompare(b.name));

    filteredGenres.forEach((genre) => {
      const genreItem = document.createElement("a");
      genreItem.textContent = genre.name;
      genreItem.style.cursor = "pointer";
      genreItem.onclick = () => filterMoviesByGenre(genre.mal_id);
      dropdown.appendChild(genreItem);
    });
  } catch (error) {
    console.error("Error fetching genres:", error);
    dropdown.innerHTML = '<p style="padding: 10px; color: #fff;">Failed to load genres.</p>';
  }
}

      function filterMoviesByGenre(genreId) {
  const filteredMovies = allMovies.filter((movie) =>
    movie.genres.some((genre) => genre.mal_id === genreId)
  );

  // Get the genre name
  const genreName = allMovies
    .flatMap((movie) => movie.genres)
    .find((genre) => genre.mal_id === genreId)?.name || "Unknown Genre";

  // Update the genre heading
  document.getElementById("genreHeading").innerText = genreName;

  // Display the filtered movies in the new section
  displayMovies(filteredMovies, 1, "genreMovies", "genrePagination");

  // Hide other sections and show the genre page
  const sections = ["home", "genresSection", "favoritesSection", "contactSection", "signupSection"];
  sections.forEach((id) => document.getElementById(id).classList.add("hidden"));
  document.getElementById("genrePage").classList.remove("hidden");

  // Hide the hero section
  const heroSection = document.querySelector(".hero");
  if (heroSection) {
    heroSection.style.display = "none";
  }
}

      function displayMovies(movies, page = 1, containerId = "movie-list", paginationId = "pagination") {
  const container = document.getElementById(containerId);
  const pagination = document.getElementById(paginationId);
  container.innerHTML = "";
  pagination.innerHTML = "";

  const start = (page - 1) * moviesPerPage;
  const end = start + moviesPerPage;
  const pageMovies = movies.slice(start, end);

  // Display movies for the current page
  pageMovies.forEach((movie) => {
    const div = document.createElement("div");
    div.className = "movie";
    div.innerHTML = `<img src="${movie.images.jpg.image_url}" alt="${movie.title}"><p style="padding: 10px;">${movie.title}</p>`;
    div.onclick = () => {
      console.log(`Clicked on: ${movie.title}`); // Debugging log
      showModal(movie);
    };
    container.appendChild(div);
  });

  // Calculate total pages
  const totalPages = Math.ceil(movies.length / moviesPerPage);

  // Create pagination buttons
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.innerText = i;
    if (i === page) btn.style.backgroundColor = "#772ce8"; // Highlight the current page
    btn.onclick = () => {
      displayMovies(movies, i, containerId, paginationId);
    };
    pagination.appendChild(btn);
  }
}

      function searchMovies() {
  const query = document.getElementById("search-input").value.trim().toLowerCase();
  const searchResultsContainer = document.getElementById("searchResults");
  const searchResultsPagination = document.getElementById("searchResultsPagination");
  const searchResultsHeading = document.getElementById("searchResultsHeading");

  // Prevent search functionality on the login page
  const loginForm = document.getElementById("loginForm");
  if (!loginForm.classList.contains("hidden")) {
    alert("Please log in to search for movies.");
    return;
  }

  searchResultsContainer.innerHTML = "";
  searchResultsPagination.innerHTML = "";

  // Check if movies are loaded
  if (allMovies.length === 0) {
    searchResultsContainer.innerHTML = "<div class='no-results'>Movies are still loading. Please try again later.</div>";
    return;
  }

  if (query === "") {
    searchResultsContainer.innerHTML = "<div class='no-results'>Please enter a search term.</div>";
    return;
  }

  const filtered = allMovies.filter((movie) => movie.title.toLowerCase().includes(query));

  if (filtered.length === 0) {
    searchResultsContainer.innerHTML = "<div class='no-results'>No results found :(</div>";
  } else {
    // Update the heading with the search query
    searchResultsHeading.innerText = `Search results for: "${query}"`;

    // Display the filtered movies in the search results section
    displayMovies(filtered, 1, "searchResults", "searchResultsPagination");

    // Show the search results page and hide other sections
    const sections = ["home", "genresSection", "favoritesSection", "contactSection", "signupSection", "genrePage"];
    sections.forEach((id) => document.getElementById(id).classList.add("hidden"));
    document.getElementById("searchResultsPage").classList.remove("hidden");

    // Hide the hero section
    const heroSection = document.querySelector(".hero");
    if (heroSection) {
      heroSection.style.display = "none";
    }
  }
}

      function showSuggestions() {
  const query = document.getElementById("search-input").value.trim().toLowerCase();
  const suggestionsContainer = document.getElementById("suggestions");

  // Clear previous suggestions
  suggestionsContainer.innerHTML = "";

  if (query === "") {
    suggestionsContainer.style.display = "none";
    return;
  }

  // Filter movies based on the query
  const filteredMovies = allMovies.filter((movie) =>
    movie.title.toLowerCase().includes(query)
  );

  if (filteredMovies.length === 0) {
    // Show "No movies found" if no matches
    suggestionsContainer.innerHTML = "<p style='padding: 10px; text-align: center; color: #aaa;'>No movies found</p>";
  } else {
    // Display matching movies
    filteredMovies.forEach((movie) => {
      const suggestion = document.createElement("div");
      suggestion.style.display = "flex";
      suggestion.style.alignItems = "center";
      suggestion.style.padding = "10px";
      suggestion.style.cursor = "pointer";
      suggestion.style.borderBottom = "1px solid #555";

      suggestion.innerHTML = `
        <img src="${movie.images.jpg.image_url}" alt="${movie.title}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px; margin-right: 10px;">
        <span>${movie.title}</span>
      `;

      // Add click event to show the movie modal or display a login message
      suggestion.onclick = () => {
        const loginForm = document.getElementById("loginForm");
        if (!loginForm.classList.contains("hidden")) {
          alert("Please login to view movie details.");
        } else {
          showModal(movie);
          suggestionsContainer.style.display = "none"; // Hide suggestions after selection
        }
      };

      suggestionsContainer.appendChild(suggestion);
    });
  }

  // Show the suggestions container
  suggestionsContainer.style.display = "block";
}

      function showSection(sectionId) {
  const sections = ["home", "genresSection", "favoritesSection", "contactSection", "signupSection", "genrePage", "searchResultsPage"];
  sections.forEach((id) => document.getElementById(id).classList.add("hidden"));
  document.getElementById(sectionId).classList.remove("hidden");

  const heroSection = document.querySelector(".hero");

  // Show the hero section only on the home page
  if (sectionId === "home") {
    if (heroSection) {
      heroSection.style.display = "block";
    }
    displayMovies(allMovies, 1); // Reset movies to the full list when returning to home
  } else {
    if (heroSection) {
      heroSection.style.display = "none";
    }
  }

  if (sectionId === "genresSection") {
    fetchGenres();
  }
}

      function toggleDropdown() {
        const dropdown = document.getElementById("genresDropdown");
        dropdown.classList.toggle("hidden");

        // Fetch genres only if the dropdown is being shown
        if (!dropdown.classList.contains("hidden")) {
          fetchGenres();
        }

        // Add a one-time event listener to hide the dropdown when clicking outside
        const handleClickOutside = (event) => {
          if (!dropdown.contains(event.target) && !event.target.closest(".dropdown")) {
            dropdown.classList.add("hidden");
            document.removeEventListener("click", handleClickOutside); // Remove the event listener after it's triggered
          }
        };

        if (!dropdown.classList.contains("hidden")) {
          document.addEventListener("click", handleClickOutside);
        }
      }

      function showModal(movie) {
        selectedMovie = movie;
        const id = movie.mal_id;
        document.getElementById("modalTitle").innerText = movie.title;
        document.getElementById("modalImage").src = movie.images.jpg.image_url;
        document.getElementById("modalSynopsis").innerText =
          movie.synopsis || "No synopsis available.";

        // Display up to 3 genres
        const genres = movie.genres.slice(0, 3).map((genre) => genre.name).join(", ");
        document.getElementById("modalGenres").innerText = genres || "No genres available.";

        likeCounts[id] = likeCounts[id] || 0;
        dislikeCounts[id] = dislikeCounts[id] || 0;

        document.getElementById("likeCount").innerText = likeCounts[id];
        document.getElementById("dislikeCount").innerText = dislikeCounts[id];

        const likeBtn = document.getElementById("likeBtn");
        const dislikeBtn = document.getElementById("dislikeBtn");
        likeBtn.classList.remove("active-reaction");
        dislikeBtn.classList.remove("active-reaction");

        if (currentUser) {
          const reactionKey = `${currentUser.username}_${id}`;
          if (userReactions[reactionKey] === "like") {
            likeBtn.classList.add("active-reaction");
          } else if (userReactions[reactionKey] === "dislike") {
            dislikeBtn.classList.add("active-reaction");
          }
        }

        // Load comments for the movie
        loadComments(id);

        // Ensure the modal is visible
        const modal = document.getElementById("movieModal");
        modal.style.display = "block";
        modal.classList.remove("hidden"); // Remove the 'hidden' class if it exists
      }

      function closeModal() {
        document.getElementById("movieModal").style.display = "none";
      }

      function addToFavorites() {
        if (!currentUser) {
          alert("Please login to add favorites");
          return;
        }

        const favContainer = document.getElementById("favorites");

        // Check if the movie is already in the favorites
        const existingFavorite = Array.from(favContainer.children).find(
          (child) => child.dataset.movieId === String(selectedMovie.mal_id)
        );

        if (existingFavorite) {
          alert("This movie is already in your favorites!");
          return;
        }

        // Add the movie to favorites
        const div = document.createElement("div");
        div.className = "movie";
        div.dataset.movieId = selectedMovie.mal_id; // Store the movie ID for future checks
        div.innerHTML = `<img src="${selectedMovie.images.jpg.image_url}" alt="${selectedMovie.title}"><p style="padding: 10px;">${selectedMovie.title}</p>`;
        favContainer.appendChild(div);

        closeModal();
      }

      function likeMovie() {
        if (!currentUser) {
          alert("Please login to react to movies");
          return;
        }

        const id = selectedMovie.mal_id;
        const reactionKey = `${currentUser.username}_${id}`;
        const likeBtn = document.getElementById("likeBtn");
        const dislikeBtn = document.getElementById("dislikeBtn");

        if (userReactions[reactionKey] === "like") {
          likeCounts[id]--;
          delete userReactions[reactionKey];
          likeBtn.classList.remove("active-reaction");
        } else if (userReactions[reactionKey] === "dislike") {
          dislikeCounts[id]--;
          likeCounts[id]++;
          userReactions[reactionKey] = "like";
          dislikeBtn.classList.remove("active-reaction");
          likeBtn.classList.add("active-reaction");
        } else {
          likeCounts[id]++;
          userReactions[reactionKey] = "like";
          likeBtn.classList.add("active-reaction");
        }

        document.getElementById("likeCount").innerText = likeCounts[id];
        document.getElementById("dislikeCount").innerText = dislikeCounts[id];
      }

      function dislikeMovie() {
        if (!currentUser) {
          alert("Please login to react to movies");
          return;
        }

        const id = selectedMovie.mal_id;
        const reactionKey = `${currentUser.username}_${id}`;
        const likeBtn = document.getElementById("likeBtn");
        const dislikeBtn = document.getElementById("dislikeBtn");

        if (userReactions[reactionKey] === "dislike") {
          dislikeCounts[id]--;
          delete userReactions[reactionKey];
          dislikeBtn.classList.remove("active-reaction");
        } else if (userReactions[reactionKey] === "like") {
          likeCounts[id]--;
          dislikeCounts[id]++;
          userReactions[reactionKey] = "dislike";
          likeBtn.classList.remove("active-reaction");
          dislikeBtn.classList.add("active-reaction");
        } else {
          dislikeCounts[id]++;
          userReactions[reactionKey] = "dislike";
          dislikeBtn.classList.add("active-reaction");
        }

        document.getElementById("likeCount").innerText = likeCounts[id];
        document.getElementById("dislikeCount").innerText = dislikeCounts[id];
      }

      function togglePassword(id) {
        const input = document.getElementById(id);
        if (input.type === "password") {
          input.type = "text";
        } else {
          input.type = "password";
        }
      }

      function showSignupFromLogin() {
        document.getElementById("loginForm").classList.add("hidden");
        document.getElementById("signupSection").classList.remove("hidden");
        document.getElementById("mainContent").classList.remove("hidden");
      }

      function showLoginFromSignup() {
        document.getElementById("signupSection").classList.add("hidden");
        document.getElementById("loginForm").classList.remove("hidden");
        document.getElementById("mainContent").classList.add("hidden");
      }

      function createSlideshow() {
        const slideshow = document.getElementById("slideshow");
        const randomMovies = allMovies.sort(() => 0.5 - Math.random()).slice(0, 4); // Get 4 random movies

        randomMovies.forEach((movie) => {
          const slide = document.createElement("div");
          slide.className = "slideshow-item";
          slide.innerHTML = `
            <img src="${movie.images.jpg.image_url}" alt="${movie.title}">
            <h3>${movie.title}</h3>
            <p>${movie.synopsis ? movie.synopsis.substring(0, 100) + "..." : "No synopsis available."}</p>
          `;
          slideshow.appendChild(slide);
        });

        let currentIndex = 0;

        setInterval(() => {
          currentIndex = (currentIndex + 1) % randomMovies.length;
          slideshow.style.transform = `translateX(-${currentIndex * 100}%)`;
        }, 3000); // Switch slides every 3 seconds
      }

      function loadComments(movieId) {
        const commentsSection = document.getElementById("commentsSection");
        commentsSection.innerHTML = ""; // Clear previous comments

        const comments = movieComments[movieId] || [];
        comments.forEach((comment) => {
          const commentDiv = document.createElement("div");
          commentDiv.style.marginBottom = "10px";
          commentDiv.innerText = comment;
          commentsSection.appendChild(commentDiv);
        });
      }

      function postComment() {
        const commentInput = document.getElementById("commentInput");
        const comment = commentInput.value.trim();

        if (!comment) {
          alert("Please write a comment before posting.");
          return;
        }

        const movieId = selectedMovie.mal_id;
        movieComments[movieId] = movieComments[movieId] || [];
        movieComments[movieId].push(comment);

        commentInput.value = ""; // Clear the input field
        loadComments(movieId); // Reload comments
      }

      document.addEventListener("DOMContentLoaded", () => {
        fetchMovies(); // Fetch and display movies when the page loads
        createSlideshow(); // Initialize the slideshow when the page loads
      });

      document.getElementById("search-input").addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault(); // Prevent the default form submission behavior
          searchMovies(); // Trigger the search function
        }
      });

      document.getElementById("password").addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault(); // Prevent the default form submission behavior
          login(); // Trigger the login function
        }
      });
  