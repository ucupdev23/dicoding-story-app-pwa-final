import IndexedDBHelper from "../../utils/IndexedDBHelper";

export class FavoriteModel {
  constructor() {
    this.indexedDBHelper = new IndexedDBHelper();
  }

  async getAllFavorites() {
    console.log(
      "FavoriteModel: Attempting to get all favorites from IndexedDBHelper."
    );
    try {
      const favorites = await this.indexedDBHelper.getAllStories();
      return favorites;
    } catch (error) {
      console.error("FavoriteModel: Error getting all favorites", error);
      throw error;
    }
  }

  async deleteFavorite(id) {
    try {
      await this.indexedDBHelper.deleteStory(id);
    } catch (error) {
      console.error("FavoriteModel: Error deleting favorite", error);
      throw error;
    }
  }

  async getFavoriteById(id) {
    try {
      const favorite = await this.indexedDBHelper.getStoryById(id);
      return favorite;
    } catch (error) {
      console.error("FavoriteModel: Error getting favorite by ID", error);
      throw error;
    }
  }
}
