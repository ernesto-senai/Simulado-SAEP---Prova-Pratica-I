// Confere se os campos obrigatórios vieram preenchidos e dentro do tamanho da coluna.
// Recebe um objeto { campo: tamanhoMaximo } (null quando não há limite, ex.: TEXT).
// Retorna a mensagem de erro, ou null se estiver tudo certo.
function validarCampos(body, regras) {
  const dados = body ?? {};

  for (const [campo, tamanhoMaximo] of Object.entries(regras)) {
    const valor = dados[campo];

    if (typeof valor !== 'string' || valor.trim() === '') {
      return `O campo "${campo}" é obrigatório.`;
    }
    if (tamanhoMaximo && valor.trim().length > tamanhoMaximo) {
      return `O campo "${campo}" aceita no máximo ${tamanhoMaximo} caracteres.`;
    }
  }

  return null;
}

// Mesma ideia do CHECK do banco: algo@algo.algo
function emailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Converte o :id da URL em número inteiro positivo (ou null se for inválido)
function lerId(valor) {
  const id = Number(valor);
  return Number.isInteger(id) && id > 0 ? id : null;
}

module.exports = { validarCampos, emailValido, lerId };
