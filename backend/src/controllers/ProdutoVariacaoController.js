// src/controllers/ProdutoVariacaoController.js
const ProdutoVariacao = require("../models/ProdutoVariacao");
const Produto = require("../models/Produto");
const Cor = require("../models/Cor");
const Tamanho = require("../models/Tamanho");

const listarProdutoVariacoes = async (req, res) => {
  try {
    const produtoVariacoes = await ProdutoVariacao.findAll({
      include: [
        { model: Produto, attributes: ["id", "nome", "imagem_url"] },
        { model: Cor, attributes: ["id", "nome", "codigo_hex"] },
        { model: Tamanho, attributes: ["id", "nome"] }
      ],
    });
    return res.json(produtoVariacoes);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao listar Produto-Variacao", detalhes: error.message });
  }
};

/**
 * Upsert de variação (cria se não existir, incrementa quantidade se existir).
 * Regras de imagem:
 * - Se enviar imagem (campo 'imagem' no form-data), salva na variação.
 * - Senão, se a variação ainda não tem imagem, herda imagem do produto (se existir).
 */
const criarProdutoVariacao = async (req, res) => {
  try {
    const usuario = req.user;
    if (usuario.tipo !== "administrador") {
      return res.status(403).json({ error: "Apenas administradores podem criar Produto-Variacao." });
    }

    const { produto_id, cor_id, tamanho_id, quantidade } = req.body;

    if (!produto_id || !cor_id || !tamanho_id || quantidade === undefined || isNaN(quantidade)) {
      return res.status(400).json({ error: "Campos 'produto_id', 'cor_id', 'tamanho_id' e 'quantidade' são obrigatórios e válidos." });
    }

    const produto = await Produto.findByPk(produto_id);
    const cor = await Cor.findByPk(cor_id);
    const tamanho = await Tamanho.findByPk(tamanho_id);

    if (!produto) return res.status(404).json({ error: "Produto não encontrado." });
    if (!cor) return res.status(404).json({ error: "Cor não encontrada." });
    if (!tamanho) return res.status(404).json({ error: "Tamanho não encontrado." });

    // imagem enviada especificamente para a variação
    const imagemFile = req.files?.imagem?.[0];
    const imagemEnviada = imagemFile ? `/uploads/images/${imagemFile.filename}` : null;

    // upsert
    const [pv, created] = await ProdutoVariacao.findOrCreate({
      where: { produto_id, cor_id, tamanho_id },
      defaults: {
        quantidade: Number(quantidade || 0),
        imagem_url: imagemEnviada || produto.imagem_url || null,
      },
    });

    if (!created) {
      // incrementa quantidade
      const delta = Number(quantidade || 0);
      if (delta !== 0) {
        await pv.increment("quantidade", { by: delta });
      }
      // imagem: se enviou, atualiza; senão, se ainda está vazia, herda do produto
      if (imagemEnviada) {
        await pv.update({ imagem_url: imagemEnviada });
      } else if (!pv.imagem_url && produto.imagem_url) {
        await pv.update({ imagem_url: produto.imagem_url });
      }
    }

    const full = await ProdutoVariacao.findByPk(pv.id, {
      include: [
        { model: Produto, attributes: ["id", "nome", "imagem_url"] },
        { model: Cor, attributes: ["id", "nome", "codigo_hex"] },
        { model: Tamanho, attributes: ["id", "nome"] },
      ],
    });

    return res.status(created ? 201 : 200).json(full);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao criar/atualizar Produto-Variacao", detalhes: error.message });
  }
};

const deletarProdutoVariacao = async (req, res) => {
  try {
    const usuario = req.user;
    if (usuario.tipo !== "administrador") {
      return res.status(403).json({ error: "Apenas administradores podem remover Produto-Variacao." });
    }

    const { id } = req.params;
    const produtoVariacao = await ProdutoVariacao.findByPk(id);

    if (!produtoVariacao) {
      return res.status(404).json({ error: "Produto-Variacao não encontrado." });
    }

    await produtoVariacao.destroy();
    return res.json({ message: "Produto-Variacao removido com sucesso" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao remover Produto-Variacao", detalhes: error.message });
  }
};

module.exports = {
  listarProdutoVariacoes,
  criarProdutoVariacao,
  deletarProdutoVariacao,
};
