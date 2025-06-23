// src/pages/login/LoginPresenter.js

import { subscribeUserForPush } from "../../main"; // <-- Import fungsi

export class LoginPresenter {
  constructor(model, view) {
    this.model = model;
    this.view = view;
  }

  async loginUser(email, password) {
    try {
      this.view.showLoading();
      const user = await this.model.login(email, password);
      this.view.renderLoginSuccess(user);

      // Panggil fungsi subscribeUserForPush setelah login berhasil
      // Pastikan pengguna online saat ini untuk subscribe
      if (navigator.onLine) {
        await subscribeUserForPush();
      } else {
        console.log(
          "Offline: Skipping push notification subscription. Will try next time user is online."
        );
      }
    } catch (error) {
      console.error("LoginPresenter: Error during login", error);
      this.view.renderLoginError(error.message || "Login gagal.");
    }
  }
}
