import { StoryModel } from "./StoryModel";
import { StoryPresenter } from "./StoryPresenter";
import MapHelper from "../../utils/MapHelper";
import L from "leaflet";
import IndexedDBHelper from "../../utils/IndexedDBHelper";

export class StoryView {
  constructor() {
    this.indexedDBHelper = new IndexedDBHelper();
    this.presenter = null;
  }

  render() {
    return `
      <header>
        <h1><i class="fas fa-book-open"></i> Daftar Cerita</h1>
        <nav>
          <a href="#/add"><i class="fas fa-plus-circle"></i> Tambah Cerita</a>
          <a href="#/favorites"><i class="fas fa-heart"></i> Favorit</a>
        </nav>
      </header>
      <main id="mainContent" class="container"> <div id="stories-list-container"> </div>
      </main>
      <footer style="text-align: center; padding: 20px;">
        <p>&copy; 2025 Story App</p>
      </footer>
    `;
  }

  async afterRender() {
    console.log("StoryView afterRender dipanggil.");
    const model = new StoryModel();
    this.presenter = new StoryPresenter(model, this);

    await this.presenter.getStories();

    const storiesListContainer = document.getElementById(
      "stories-list-container"
    );
    if (storiesListContainer) {
      console.log(
        "StoryView: storiesListContainer ditemukan. Memasang click listener delegasi."
      );
      storiesListContainer.addEventListener("click", async (event) => {
        const favButton = event.target.closest(".fav-button");
        if (favButton) {
          event.preventDefault();

          console.log(
            "StoryView (Delegation): Click detected on a fav button or its child. ID:",
            favButton.dataset.id
          );

          const storyId = favButton.dataset.id;
          const storyName = favButton.dataset.name;
          const favIcon = favButton.querySelector("i");

          const isFavorite = await this.indexedDBHelper.isStoryFavorite(
            storyId
          );

          if (isFavorite) {
            await this.indexedDBHelper.deleteStory(storyId);
            if (favIcon) {
              favIcon.classList.remove("fas", "favorite");
              favIcon.classList.add("far");
            }
            alert(`Cerita "${storyName}" dihapus dari favorit.`);
          } else {
            const currentStories = this.presenter.getCurrentStories();
            const storyToFavorite = currentStories
              ? currentStories.find((s) => s.id === storyId)
              : null;

            if (storyToFavorite) {
              await this.indexedDBHelper.addStory(storyToFavorite);
              if (favIcon) {
                favIcon.classList.remove("far");
                favIcon.classList.add("fas", "favorite");
              }
              alert(`Cerita "${storyName}" ditambahkan ke favorit.`);
            } else {
              alert("Gagal menemukan detail cerita untuk difavoritkan.");
            }
          }
        } else {
          console.log(
            "StoryView (Delegation): Click detected, but not on a fav button."
          );
        }
      });
    } else {
      console.error(
        "StoryView: storiesListContainer TIDAK DITEMUKAN untuk memasang listener delegasi!"
      );
    }
  }

  showLoading() {
    document.getElementById("stories-list-container").innerHTML = `
      <div class="loading-indicator" style="text-align: center; padding: 50px;">
        <p>Sedang memuat data cerita...</p>
      </div>
    `;
  }

  async renderStories(stories) {
    const container = document.getElementById("stories-list-container");
    if (!container) return;

    if (stories.length === 0) {
      container.innerHTML =
        '<p style="text-align: center; padding: 50px;">Belum ada cerita yang tersedia.</p>';
      return;
    }

    const storyItemsHtml = await Promise.all(
      stories.map(async (story) => {
        const isFavorite = await this.indexedDBHelper.isStoryFavorite(story.id);
        const favIconClass = isFavorite
          ? "fas fa-heart favorite"
          : "far fa-heart";

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
                  <div id="map-${story.id}" class="story-map"></div>
                </div>
                <p class="story-location-coords"><i class="fas fa-map-marker-alt"></i> Lokasi: ${story.lat.toFixed(
                  3
                )}, ${story.lon.toFixed(3)}</p>
              `
                  : `<p class="no-location-info"><i class="fas fa-map-marker-alt"></i> Lokasi tidak tersedia</p>`
              }
              <button class="fav-button" data-id="${
                story.id
              }" data-name="${storyName}">
                <i class="${favIconClass}"></i> Favorit
              </button>
            </div>
          </article>
        `;
      })
    );

    container.innerHTML = `<section id="stories-grid" class="stories-grid">${storyItemsHtml.join(
      ""
    )}</section>`;

    stories.forEach((story) => {
      if (story.lat && story.lon) {
        const mapElementId = `map-${story.id}`;
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

  renderFailedMessage() {
    const container = document.getElementById("stories-list-container");
    if (container) {
      container.innerHTML = `
        <div class="error-message" style="text-align: center; padding: 50px; color: red;">
          <p>Gagal memuat daftar cerita. Mohon coba lagi nanti.</p>
          <button onclick="window.location.reload()">Refresh Halaman</button>
        </div>
      `;
    }
  }
}
