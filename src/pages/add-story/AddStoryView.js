import { AddStoryModel } from "./AddStoryModel";
import { AddStoryPresenter } from "./AddStoryPresenter";
import MapHelper from "../../utils/MapHelper";
import L from "leaflet";

export class AddStoryView {
  constructor() {
    this.cameraStream = null;
    this.mapInstance = null;
    this.currentLocationMarker = null;
    this.selectedLat = null;
    this.selectedLon = null;
  }

  render() {
    return `
      <header>
        <h1>Tambah Cerita Baru</h1>
        <nav>
          <a href="#/stories">Kembali ke Daftar</a>
        </nav>
      </header>
      <main class="container" id="mainContent">
        <form id="addStoryForm" class="story-form">
          <div class="form-group">
            <label for="descriptionInput">Deskripsi Cerita</label>
            <textarea id="descriptionInput" name="description" required rows="5" placeholder="Tulis cerita Anda di sini..."></textarea>
          </div>

          <div class="form-group">
            <label>Ambil Foto</label>
            <div class="camera-container">
              <video id="videoElement" autoplay playsinline class="camera-preview"></video>
              <canvas id="canvasElement" style="display:none;"></canvas>
              <img id="photoPreview" src="" alt="Photo Preview" class="photo-preview" style="display:none;">
            </div>
            <button type="button" id="startCameraButton" class="btn">Mulai Kamera</button>
            <button type="button" id="takePhotoButton" class="btn" style="display:none;">Ambil Foto</button>
            <button type="button" id="stopCameraButton" class="btn btn-danger" style="display:none;">Hentikan Kamera</button>
          </div>

          <div class="form-group">
            <label>Pilih Lokasi Cerita (Opsional)</label>
            <div id="addStoryMap" class="story-map" style="height: 300px;"></div>
            <p>Lat: <span id="selectedLat"></span>, Lon: <span id="selectedLon"></span></p>
            <button type="button" id="clearLocationButton" class="btn btn-secondary" style="display:none;">Hapus Lokasi</button>
          </div>

          <button type="submit" id="submitStoryButton" class="btn btn-primary">Unggah Cerita</button>
          <p id="storyMessage" class="message"></p>
        </form>
      </main>
      <footer style="text-align: center; padding: 20px;">
        <p>&copy; 2025 Story App</p>
      </footer>
    `;
  }

  async afterRender() {
    console.log("AddStoryView afterRender dipanggil.");
    const model = new AddStoryModel();
    const presenter = new AddStoryPresenter(model, this);

    const addStoryForm = document.getElementById("addStoryForm");
    const descriptionInput = document.getElementById("descriptionInput");
    const videoElement = document.getElementById("videoElement");
    const canvasElement = document.getElementById("canvasElement");
    const photoPreview = document.getElementById("photoPreview");
    const startCameraButton = document.getElementById("startCameraButton");
    const takePhotoButton = document.getElementById("takePhotoButton");
    const stopCameraButton = document.getElementById("stopCameraButton");
    const addStoryMapElement = document.getElementById("addStoryMap");
    const selectedLatSpan = document.getElementById("selectedLat");
    const selectedLonSpan = document.getElementById("selectedLon");
    const clearLocationButton = document.getElementById("clearLocationButton");
    const submitStoryButton = document.getElementById("submitStoryButton");
    const storyMessage = document.getElementById("storyMessage");

    startCameraButton.addEventListener("click", async () => {
      try {
        this.cameraStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        videoElement.srcObject = this.cameraStream;
        videoElement.style.display = "block";
        photoPreview.style.display = "none";
        startCameraButton.style.display = "none";
        takePhotoButton.style.display = "inline-block";
        stopCameraButton.style.display = "inline-block";
        storyMessage.innerText = "";
      } catch (error) {
        console.error("Error accessing camera:", error);
        this.renderErrorMessage(
          "Tidak dapat mengakses kamera. Pastikan Anda memberikan izin."
        );
      }
    });

    takePhotoButton.addEventListener("click", () => {
      canvasElement.width = videoElement.videoWidth;
      canvasElement.height = videoElement.videoHeight;
      canvasElement
        .getContext("2d")
        .drawImage(
          videoElement,
          0,
          0,
          canvasElement.width,
          canvasElement.height
        );

      const imageDataUrl = canvasElement.toDataURL("image/jpeg");
      photoPreview.src = imageDataUrl;
      photoPreview.style.display = "block";
      videoElement.style.display = "none";
    });

    stopCameraButton.addEventListener("click", () => {
      if (this.cameraStream) {
        this.cameraStream.getTracks().forEach((track) => track.stop());
        this.cameraStream = null;
      }
      videoElement.srcObject = null;
      videoElement.style.display = "none";
      startCameraButton.style.display = "inline-block";
      takePhotoButton.style.display = "none";
      stopCameraButton.style.display = "none";
    });

    const initialLat = -6.2088;
    const initialLon = 106.8456;
    const initialZoom = 10;

    const mapHelper = new MapHelper(
      "addStoryMap",
      initialLat,
      initialLon,
      initialZoom
    );
    this.mapInstance = mapHelper.initMap();

    if (this.mapInstance) {
      this.mapInstance.on("click", (e) => {
        const { lat, lng } = e.latlng;
        this.selectedLat = lat;
        this.selectedLon = lng;

        selectedLatSpan.innerText = lat.toFixed(5);
        selectedLonSpan.innerText = lng.toFixed(5);
        clearLocationButton.style.display = "inline-block";

        if (this.currentLocationMarker) {
          this.mapInstance.removeLayer(this.currentLocationMarker);
        }
        this.currentLocationMarker = L.marker([lat, lng])
          .addTo(this.mapInstance)
          .bindPopup(
            `Lokasi terpilih: Lat ${lat.toFixed(5)}, Lon ${lng.toFixed(5)}`
          )
          .openPopup();
      });
    }

    clearLocationButton.addEventListener("click", () => {
      this.selectedLat = null;
      this.selectedLon = null;
      selectedLatSpan.innerText = "";
      selectedLonSpan.innerText = "";
      clearLocationButton.style.display = "none";
      if (this.currentLocationMarker) {
        this.mapInstance.removeLayer(this.currentLocationMarker);
        this.currentLocationMarker = null;
      }
    });

    addStoryForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const description = descriptionInput.value;
      const photoDataUrl = photoPreview.src;

      if (
        !description ||
        !photoDataUrl ||
        photoDataUrl === window.location.href
      ) {
        this.renderErrorMessage("Deskripsi dan foto harus diisi!");
        return;
      }

      const blob = await fetch(photoDataUrl).then((res) => res.blob());
      const file = new File([blob], "photo.jpeg", { type: "image/jpeg" });

      await presenter.addNewStory(
        file,
        description,
        this.selectedLat,
        this.selectedLon
      );
    });
  }

  showLoading() {
    const storyMessage = document.getElementById("storyMessage");
    const submitStoryButton = document.getElementById("submitStoryButton");
    if (storyMessage && submitStoryButton) {
      storyMessage.innerText = "Mengunggah cerita...";
      storyMessage.className = "message info";
      submitStoryButton.disabled = true;
    }
  }

  renderSuccessMessage(message) {
    const storyMessage = document.getElementById("storyMessage");
    const submitStoryButton = document.getElementById("submitStoryButton");
    if (storyMessage && submitStoryButton) {
      storyMessage.innerText = message;
      storyMessage.className = "message success";
      submitStoryButton.disabled = false;
    }
    document.getElementById("addStoryForm").reset();
    document.getElementById("photoPreview").style.display = "none";
    this.selectedLat = null;
    this.selectedLon = null;
    document.getElementById("selectedLat").innerText = "";
    document.getElementById("selectedLon").innerText = "";
    document.getElementById("clearLocationButton").style.display = "none";

    if (this.currentLocationMarker) {
      this.mapInstance.removeLayer(this.currentLocationMarker);
      this.currentLocationMarker = null;
    }

    if (this.cameraStream) {
      this.cameraStream.getTracks().forEach((track) => track.stop());
      this.cameraStream = null;
      document.getElementById("videoElement").srcObject = null;
      document.getElementById("videoElement").style.display = "none";
      document.getElementById("startCameraButton").style.display =
        "inline-block";
      document.getElementById("takePhotoButton").style.display = "none";
      document.getElementById("stopCameraButton").style.display = "none";
    }
  }

  renderErrorMessage(message) {
    const storyMessage = document.getElementById("storyMessage");
    const submitStoryButton = document.getElementById("submitStoryButton");
    if (storyMessage && submitStoryButton) {
      storyMessage.innerText = message;
      storyMessage.className = "message error";
      submitStoryButton.disabled = false;
    }
  }
}
