export class AddStoryPresenter {
  constructor(model, view) {
    this.model = model;
    this.view = view;
  }

  async addNewStory(file, description, lat, lon) {
    try {
      this.view.showLoading();
      await this.model.addStory(file, description, lat, lon);
      this.view.renderSuccessMessage("Cerita berhasil diunggah!");
    } catch (error) {
      console.error("AddStoryPresenter: Error adding new story", error);
      this.view.renderErrorMessage(error.message || "Gagal mengunggah cerita.");
    }
  }
}
