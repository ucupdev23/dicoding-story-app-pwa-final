export class FavoritePresenter {
  constructor(model, view) {
    this.model = model;
    this.view = view;
  }

  async getFavoriteStories() {
    this.view.showLoading();
    console.log(
      "FavoritePresenter: Attempting to get favorite stories from model."
    );
    try {
      const favorites = await this.model.getAllFavorites();
      this.view.renderFavoriteStories(favorites);
    } catch (error) {
      console.error("FavoritePresenter: Error getting favorite stories", error);
      this.view.renderFailedMessage(
        error.message || "Gagal memuat cerita favorit."
      );
    }
  }

  async deleteStory(id) {
    try {
      await this.model.deleteFavorite(id);
      this.view.renderSuccessMessage("Cerita berhasil dihapus dari favorit.");
      await this.getFavoriteStories();
    } catch (error) {
      console.error("FavoritePresenter: Error deleting story", error);
      this.view.renderFailedMessage(
        error.message || "Gagal menghapus cerita dari favorit."
      );
    }
  }
}
