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
    } catch (error) {
      console.error("LoginPresenter: Error during login", error);
      this.view.renderLoginError(error.message || "Login gagal.");
    }
  }
}
