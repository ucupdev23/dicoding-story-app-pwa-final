import StoryApiService from "../../api/StoryApiService";

export class AddStoryModel {
  constructor() {
    this.apiService = new StoryApiService();
  }

  async addStory(file, description, lat, lon) {
    try {
      const formData = new FormData();
      formData.append("photo", file);
      formData.append("description", description);
      if (lat !== null && lon !== null) {
        formData.append("lat", lat);
        formData.append("lon", lon);
      }

      const responseData = await this.apiService.addStory(formData);
      return responseData;
    } catch (error) {
      console.error("AddStoryModel: Error adding story", error);
      throw error;
    }
  }
}
