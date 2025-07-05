const API_BASE_URL = "https://story-api.dicoding.dev/v1";
const AUTH_TOKEN_KEY = "story_app_auth_token";

class StoryApiService {
  _setAuthToken(token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  }

  _getAuthToken() {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  }

  _removeAuthToken() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }

  async registerUser({ name, email, password }) {
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Registration failed.");
      }
      return responseData;
    } catch (error) {
      console.error("Error registering user:", error);
      throw error;
    }
  }

  async loginUser({ email, password }) {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Login failed.");
      }

      this._setAuthToken(responseData.loginResult.token);
      return responseData.loginResult;
    } catch (error) {
      console.error("Error logging in:", error);
      throw error;
    }
  }
  async getStories() {
    try {
      const token = this._getAuthToken();
      if (!token) {
        throw new Error("No authentication token found. Please login.");
      }

      const response = await fetch(`${API_BASE_URL}/stories`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch stories.");
      }

      const responseData = await response.json();
      return responseData.listStory;
    } catch (error) {
      console.error("Error fetching stories:", error);
      throw error;
    }
  }

  async addStory(formData) {
    try {
      const token = this._getAuthToken();
      if (!token) {
        throw new Error(
          "No authentication token found. Please login to add a story."
        );
      }

      const response = await fetch(`${API_BASE_URL}/stories`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Failed to add story.");
      }

      return responseData;
    } catch (error) {
      console.error("Error adding story:", error);
      throw error;
    }
  }

  isLoggedIn() {
    return !!this._getAuthToken();
  }

  logout() {
    this._removeAuthToken();
  }

  async sendUserSubscription(subscription) {
    try {
      const token = this._getAuthToken();
      if (!token) {
        throw new Error(
          "No authentication token found. Please login to subscribe for notifications."
        );
      }

      const response = await fetch(`${API_BASE_URL}/notifications/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          keys: {
            auth: subscription.keys.auth,
            p256dh: subscription.keys.p256dh,
          },
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(
          responseData.message || "Failed to subscribe for push notifications."
        );
      }

      console.log(
        "Push subscription sent to backend successfully:",
        responseData
      );
      return responseData;
    } catch (error) {
      console.error("Error sending push subscription:", error);
      throw error;
    }
  }
}

export default StoryApiService;
