import StoryApiService from "../../api/StoryApiService";

export class StoryModel {
  constructor() {
    this.apiService = new StoryApiService();
  }

  async getStories() {
    try {
      const stories = await this.apiService.getStories();
      return stories;
    } catch (error) {
      console.error("Model: Error in getStories", error);
      throw error;
    }
  }
}
