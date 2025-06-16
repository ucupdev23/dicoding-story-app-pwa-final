import StoryApiService from "../../api/StoryApiService";

export class RegisterModel {
  constructor() {
    this.apiService = new StoryApiService();
  }

  async register(name, email, password) {
    try {
      const responseData = await this.apiService.registerUser({
        name,
        email,
        password,
      });
      return responseData;
    } catch (error) {
      console.error("RegisterModel: Error during registration", error);
      throw error;
    }
  }
}
