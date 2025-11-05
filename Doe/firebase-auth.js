// === SISTEMA DE AUTENTICAÇÃO FIREBASE ===
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

const auth = getAuth();

// === FUNÇÕES DE AUTENTICAÇÃO ===

// Login
export async function loginUsuario(email, senha) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, senha);
    console.log('Login realizado:', userCredential.user.uid);
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error('Erro no login:', error);
    return { success: false, error: error.message };
  }
}

// Cadastro
export async function cadastrarUsuario(email, senha) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
    console.log('Usuário cadastrado:', userCredential.user.uid);
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error('Erro no cadastro:', error);
    return { success: false, error: error.message };
  }
}

// Logout
export async function logoutUsuario() {
  try {
    await signOut(auth);
    console.log('Logout realizado');
    return { success: true };
  } catch (error) {
    console.error('Erro no logout:', error);
    return { success: false, error: error.message };
  }
}

// Verificar se usuário está logado
export function verificarAutenticacao() {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

// === EXEMPLOS DE USO ===

/*
// Login
const resultado = await loginUsuario('user@email.com', 'senha123');
if (resultado.success) {
  window.location.href = '../Dashboard/dashboard.html';
}

// Cadastro
const resultadoCadastro = await cadastrarUsuario('novo@email.com', 'senha123');

// Verificar se está logado
const user = await verificarAutenticacao();
if (!user) {
  window.location.href = '../Entrar/entrar.html';
}
*/