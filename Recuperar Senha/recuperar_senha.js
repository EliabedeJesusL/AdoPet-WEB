// /Recuperar Senha/recuperar_senha.js
import { sendReset } from "./script.js"; // importa do arquivo de banco na mesma pasta

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("recoverForm");
  const emailInput = document.getElementById("email");
  const btnSend = document.getElementById("btnSend");
  const btnBack = document.getElementById("btnBack");
  const groupEmail = document.getElementById("group-email");
  const toastEl = document.getElementById("toast");

  // Voltar
  btnBack?.addEventListener("click", (e) => {
    e.preventDefault();
    if (history.length > 1) history.back();
    else window.location.assign("/Entrar/entrar.html");
  });

  // Validação em tempo real
  emailInput?.addEventListener("input", () => {
    clearError();
    const valid = isValidEmail(emailInput.value);
    setStatus(valid);
    toggleButton(valid);
  });

  // Estado inicial do botão
  toggleButton(isValidEmail(emailInput?.value || ""));

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = (emailInput?.value || "").trim();
    const valid = isValidEmail(email);

    if (!email) {
      showError("Campo de e-mail vazio!");
      emailInput?.focus();
      toggleButton(false);
      return;
    }
    if (!valid) {
      showError("Informe um e-mail válido.");
      emailInput?.focus();
      toggleButton(false);
      return;
    }

    setLoading(true);

    try {
      await sendReset(email);
      // Mensagem neutra (não expõe se o e-mail existe)
      showToast("Se o e-mail estiver cadastrado, você receberá um link de redefinição.", "success");
    } catch (error) {
      const code = String(error?.code || "");
      if (code === "auth/invalid-email") {
        showError("E-mail inválido. Verifique e tente novamente.");
      } else if (code === "auth/too-many-requests") {
        showToast("Muitas tentativas. Tente novamente mais tarde.", "warning");
      } else if (code === "auth/network-request-failed") {
        showToast("Falha de rede. Verifique sua conexão e tente novamente.", "danger");
      } else {
        showToast("Erro ao enviar o e-mail de redefinição. Tente novamente.", "danger");
      }
    } finally {
      setLoading(false);
      toggleButton(isValidEmail(emailInput?.value || ""));
    }
  });

  // Helpers
  function isValidEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v).toLowerCase());
  }

  function showError(msg) {
    clearError();
    if (!groupEmail) { alert(msg); return; }
    const el = document.createElement("div");
    el.className = "error-msg";
    el.style.color = "#dc3545";
    el.style.marginTop = "6px";
    el.textContent = msg;
    groupEmail.appendChild(el);
    emailInput?.classList.add("is-invalid");
    setStatus(false);
  }

  function clearError() {
    emailInput?.classList.remove("is-invalid");
    const old = groupEmail?.querySelector(".error-msg");
    if (old) old.remove();
  }

  function setStatus(valid) {
    const status = groupEmail?.querySelector(".status");
    if (status) status.style.opacity = valid ? "1" : "0.2";
    emailInput?.classList.toggle("is-valid", valid);
  }

  function setLoading(isLoading) {
    if (!btnSend) return;
    if (isLoading) {
      btnSend.dataset.text = btnSend.textContent || "Enviar link";
      btnSend.textContent = "Enviando...";
      btnSend.disabled = true;
    } else {
      btnSend.textContent = btnSend.dataset.text || "Enviar link";
    }
  }

  function toggleButton(enable) {
    if (!btnSend) return;
    btnSend.disabled = !enable;
  }

  function showToast(message, type = "info") {
    if (!toastEl) { alert(message); return; }
    toastEl.textContent = message;
    toastEl.className = `toast show toast-${type}`;
    setTimeout(() => {
      toastEl.className = "toast";
      toastEl.textContent = "";
    }, 4000);
  }
});