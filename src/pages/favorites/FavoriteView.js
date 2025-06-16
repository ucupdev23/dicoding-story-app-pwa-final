import { FavoriteModel } from "./FavoriteModel";
import { FavoritePresenter } from "./FavoritePresenter";
import MapHelper from "../../utils/MapHelper";
import L from "leaflet";

export class FavoriteView {
  constructor() {}

  render() {
    return `
      <header>
        <h1><i class="fas fa-heart"></i> Cerita Favorit</h1>
        <nav>
          <a href="#/stories">Kembali ke Daftar</a>
          <a href="#/add"><i class="fas fa-plus-circle"></i> Tambah Cerita</a>
        </nav>
      </header>
      <main id="mainContent" class="container"> <div id="favorite-stories-container"> </div>
      </main>
      <footer style="text-align: center; padding: 20px;">
        <p>&copy; 2025 Story App</p>
      </footer>
    `;
  }

  async afterRender() {
    console.log("FavoriteView: afterRender called. Fetching favorites...");
    const model = new FavoriteModel();
    const presenter = new FavoritePresenter(model, this);

    await presenter.getFavoriteStories();

    const favoriteStoriesContainer = document.getElementById(
      "favorite-stories-container"
    );
    if (favoriteStoriesContainer) {
      favoriteStoriesContainer.addEventListener("click", async (event) => {
        const removeFavButton = event.target.closest(".remove-fav-button");
        if (removeFavButton) {
          event.preventDefault();

          const storyId = removeFavButton.dataset.id;
          const storyName = removeFavButton.dataset.name;

          if (
            confirm(
              `Apakah Anda yakin ingin menghapus cerita "${storyName}" dari favorit?`
            )
          ) {
            await presenter.deleteStory(storyId);
          }
        }
      });
    }
  }

  showLoading() {
    document.getElementById("favorite-stories-container").innerHTML = `
      <div class="loading-indicator" style="text-align: center; padding: 50px;">
        <p>Memuat cerita favorit...</p>
      </div>
    `;
  }

  async renderFavoriteStories(stories) {
    console.log(
      "FavoriteView: Rendering favorite stories. Stories received:",
      stories
    );
    const container = document.getElementById("favorite-stories-container");
    if (!container) return;

    if (stories.length === 0) {
      container.innerHTML =
        '<p style="text-align: center; padding: 50px;">Belum ada cerita favorit yang disimpan.</p>';
      return;
    }

    const storyItemsHtml = await Promise.all(
      stories.map(async (story) => {
        const storyName = story.name || "Nama Tidak Diketahui";
        const storyDescription = story.description
          ? story.description.substring(0, 100) + "..."
          : "Deskripsi tidak tersedia.";
        const storyDate = new Date(story.createdAt).toLocaleDateString(
          "id-ID",
          { year: "numeric", month: "long", day: "numeric" }
        );

        return `
          <article class="story-item" data-id="${story.id}">
            <img src="${
              story.photoUrl
            }" alt="Gambar cerita oleh ${storyName}" class="story-image" loading="lazy">
            <div class="story-content">
              <h2 class="story-title">${storyName}</h2>
              <p class="story-description">${storyDescription}</p>
              <p class="story-date"><i class="fas fa-calendar-alt"></i> Diposting pada: ${storyDate}</p>
              ${
                story.lat && story.lon
                  ? `
                <div class="story-map-wrapper">
                  <div id="map-fav-${story.id}" class="story-map"></div>
                </div>
                <p class="story-location-coords"><i class="fas fa-map-marker-alt"></i> Lokasi: ${story.lat.toFixed(
                  3
                )}, ${story.lon.toFixed(3)}</p>
              `
                  : `<p class="no-location-info"><i class="fas fa-map-marker-alt"></i> Lokasi tidak tersedia</p>`
              }
              <button class="remove-fav-button btn-danger" data-id="${
                story.id
              }" data-name="${storyName}">
                <i class="fas fa-trash"></i> Hapus Favorit
              </button>
            </div>
          </article>
        `;
      })
    );

    container.innerHTML = `<section id="favorite-stories-grid" class="stories-grid">${storyItemsHtml.join(
      ""
    )}</section>`;

    stories.forEach((story) => {
      if (story.lat && story.lon) {
        const mapElementId = `map-fav-${story.id}`;
        const mapHelper = new MapHelper(mapElementId, story.lat, story.lon, 15);
        const map = mapHelper.initMap();
        if (map) {
          const storyName = story.name || "Nama Tidak Diketahui";
          const storyDescription = story.description
            ? story.description.substring(0, 50) + "..."
            : "Deskripsi tidak tersedia.";
          mapHelper.addMarker(
            story.lat,
            story.lon,
            `<b>${storyName}</b><br>${storyDescription}`
          );
        }
      }
    });
  }

  renderFailedMessage(message = "Gagal memuat cerita favorit.") {
    const container = document.getElementById("favorite-stories-container");
    if (container) {
      container.innerHTML = `
        <div class="error-message" style="text-align: center; padding: 50px; color: red;">
          <p>${message}</p>
        </div>
      `;
    }
  }

  renderSuccessMessage(message) {
    alert(message);
  }
}
