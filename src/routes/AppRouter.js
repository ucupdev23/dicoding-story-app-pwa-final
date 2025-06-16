import { StoryView } from "../pages/stories/StoryView";
import { AddStoryView } from "../pages/add-story/AddStoryView";
import { LoginView } from "../pages/login/LoginView";
import { RegisterView } from "../pages/register/RegisterView";
import StoryApiService from "../api/StoryApiService";
import { FavoriteView } from "../pages/favorites/FavoriteView";

class AppRouter {
  constructor() {
    console.log(">>> AppRouter initialized!");
    this.apiService = new StoryApiService();

    this.routes = {
      "/": new StoryView(),
      "/stories": new StoryView(),
      "/add": new AddStoryView(),
      "/login": new LoginView(),
      "/register": new RegisterView(),
      "/favorites": new FavoriteView(),
    };

    window.addEventListener("hashchange", () => this.handleLocation());
    window.addEventListener("load", () => this.handleLocation());
  }

  async handleLocation() {
    console.log(">>> AppRouter handleLocation called!");
    const path = window.location.hash.substring(1) || "/";
    const view = this.routes[path];
    const appContainer = document.getElementById("app");

    const requiresAuth = ["/", "/stories", "/add"].includes(path);
    const isLoggedIn = this.apiService.isLoggedIn();

    if (requiresAuth && !isLoggedIn) {
      window.location.hash = "#/login";
      return;
    }

    if (view) {
      if (document.startViewTransition) {
        document.startViewTransition(async () => {
          appContainer.innerHTML = "";
          appContainer.innerHTML = view.render();
          if (view.afterRender) {
            await view.afterRender();
          }
        });
      } else {
        appContainer.innerHTML = "";
        appContainer.innerHTML = view.render();
        if (view.afterRender) {
          await view.afterRender();
        }
      }
    } else {
      appContainer.innerHTML = `
        <main class="container" style="text-align: center; padding: 50px;">
          <h1>404 Not Found</h1>
          <p>Halaman yang Anda cari tidak ditemukan.</p>
          <p><a href="#/stories" style="color: #28a745; text-decoration: none;">Kembali ke Daftar Cerita</a></p>
        </main>
      `;
    }
  }
}

export default AppRouter;
