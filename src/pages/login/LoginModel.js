import StoryApiService from "../../api/StoryApiService";

export class LoginModel {
  constructor() {
    this.apiService = new StoryApiService();
  }

  async login(email, password) {
    try {
      const userData = await this.apiService.loginUser({ email, password });
      return userData;
    } catch (error) {
      console.error("LoginModel: Error during login", error);
      throw error;
    }
  }
}
