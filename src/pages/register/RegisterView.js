import { RegisterModel } from "./RegisterModel";
import { RegisterPresenter } from "./RegisterPresenter";

export class RegisterView {
  render() {
    return `
      <header>
        <h1><i class="fas fa-user-plus"></i> Register</h1>
        <nav>
          <a href="#/login"><i class="fas fa-sign-in-alt"></i> Login</a>
          <a href="#/favorites"><i class="fas fa-heart"></i> Favorit</a>
        </nav>
      </header>
      <main class="container" id="mainContent">
        <form id="registerForm" class="auth-form">
          <div class="form-group">
            <label for="nameInput">Nama Lengkap</label>
            <input type="text" id="nameInput" name="name" required placeholder="Nama Anda">
          </div>
          <div class="form-group">
            <label for="emailInput">Email</label>
            <input type="email" id="emailInput" name="email" required placeholder="example@dicoding.com">
          </div>
          <div class="form-group">
            <label for="passwordInput">Password</label>
            <input type="password" id="passwordInput" name="password" required placeholder="Minimal 6 karakter">
          </div>
          <button type="submit" id="registerButton">Register</button>
          <p id="registerMessage" class="message"></p>
        </form>
      </main>
      <footer style="text-align: center; padding: 20px;">
        <p>&copy; 2025 Story App</p>
      </footer>
    `;
  }

  async afterRender() {
    console.log("RegisterView afterRender dipanggil.");
    const model = new RegisterModel();
    const presenter = new RegisterPresenter(model, this);

    const registerForm = document.getElementById("registerForm");
    const registerButton = document.getElementById("registerButton");
    const nameInput = document.getElementById("nameInput");
    const emailInput = document.getElementById("emailInput");
    const passwordInput = document.getElementById("passwordInput");

    registerForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const name = nameInput.value;
      const email = emailInput.value;
      const password = passwordInput.value;
      await presenter.registerUser(name, email, password);
    });
  }

  showLoading() {
    const registerMessage = document.getElementById("registerMessage");
    const registerButton = document.getElementById("registerButton");
    if (registerMessage && registerButton) {
      registerMessage.innerText = "Sedang memproses pendaftaran...";
      registerMessage.className = "message info";
      registerButton.disabled = true;
    }
  }

  renderRegisterSuccess() {
    const registerMessage = document.getElementById("registerMessage");
    if (registerMessage) {
      registerMessage.innerText = "Pendaftaran berhasil! Silakan login.";
      registerMessage.className = "message success";
    }
    setTimeout(() => {
      window.location.hash = "#/login";
    }, 1500);
  }

  renderRegisterError(errorMessage) {
    const registerMessage = document.getElementById("registerMessage");
    const registerButton = document.getElementById("registerButton");
    if (registerMessage && registerButton) {
      registerMessage.innerText = errorMessage;
      registerMessage.className = "message error";
      registerButton.disabled = false;
    }
  }
}
