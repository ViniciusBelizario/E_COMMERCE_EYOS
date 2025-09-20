const Produto = require("../models/Produto");
const ProdutoVariacao = require("../models/ProdutoVariacao");
const Cor = require("../models/Cor");
const Tamanho = require("../models/Tamanho");

// Função auxiliar para buscar um arquivo pelo fieldname no array req.files
function getFileByFieldName(req, fieldname) {
  if (!req.files || !Array.isArray(req.files)) return null;
  return req.files.find(file => file.fieldname === fieldname) || null;
}

const listarProdutos = async (req, res) => {
  try {
    const produtos = await Produto.findAll({
      include: [
        {
          model: ProdutoVariacao,
          attributes: ["quantidade", "imagem_url"],
          include: [
            { model: Cor, attributes: ["id", "nome", "codigo_hex"] },
            { model: Tamanho, attributes: ["id", "nome"] }
          ],
        },
      ],
    });

    return res.json(produtos);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao listar produtos", detalhes: error.message });
  }
};

const buscarProduto = async (req, res) => {
  try {
    const produto = await Produto.findByPk(req.params.id, {
      include: [
        {
          model: ProdutoVariacao,
          attributes: ["quantidade", "imagem_url"],
          include: [
            { model: Cor, attributes: ["id", "nome", "codigo_hex"] },
            { model: Tamanho, attributes: ["id", "nome"] }
          ],
        },
      ],
    });

    if (!produto) {
      return res.status(404).json({ error: "Produto não encontrado" });
    }

    return res.json(produto);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao buscar produto", detalhes: error.message });
  }
};

const criarProduto = async (req, res) => {
  try {
    const usuario = req.user;
    if (!usuario || usuario.tipo !== "administrador") {
      return res.status(403).json({ error: "Apenas administradores podem criar produtos." });
    }

    let { nome, descricao, preco, estoque, categoria_id, marca_id, variacoes } = req.body;

    if (!estoque || isNaN(estoque)) {
      return res.status(400).json({ error: "O campo 'estoque' é obrigatório e deve ser um número." });
    }

    // Obter arquivos gerais (imagem e vídeo) do array req.files
    let imagem_url = null;
    let video_url = null;
    const fileImagem = getFileByFieldName(req, "imagem");
    if (fileImagem) {
      imagem_url = `/uploads/images/${fileImagem.filename}`;
    }
    const fileVideo = getFileByFieldName(req, "video");
    if (fileVideo) {
      video_url = `/uploads/videos/${fileVideo.filename}`;
    }

    // Converter variacoes para JSON, se necessário
    if (typeof variacoes === "string") {
      try {
        variacoes = JSON.parse(variacoes);
      } catch (error) {
        return res.status(400).json({ error: "Formato de 'variacoes' inválido. Deve ser um array JSON." });
      }
    }

    // Criar o produto no banco de dados
    const produto = await Produto.create({
      nome,
      descricao,
      preco,
      estoque,
      categoria_id,
      marca_id,
      imagem_url,
      video_url,
    });

    // Processar cada variação enviada
    if (variacoes && Array.isArray(variacoes)) {
      for (const variacao of variacoes) {
        if (!variacao.cor_id || !variacao.tamanho_id || !variacao.quantidade) {
          return res.status(400).json({
            error: "Cada variação deve conter 'cor_id', 'tamanho_id' e 'quantidade'.",
          });
        }

        // Buscar a imagem específica para essa variação (campo: imagem_variação_{cor_id}_{tamanho_id})
        const fieldName = `imagem_variacao_${variacao.cor_id}_${variacao.tamanho_id}`;
        let imagem_url_variacao = null;
        const fileVariacao = getFileByFieldName(req, fieldName);
        if (fileVariacao) {
          imagem_url_variacao = `/uploads/images/${fileVariacao.filename}`;
        }

        await ProdutoVariacao.create({
          produto_id: produto.id,
          cor_id: variacao.cor_id,
          tamanho_id: variacao.tamanho_id,
          quantidade: variacao.quantidade,
          imagem_url: imagem_url_variacao,
        });
      }
    }

    return res.status(201).json({ produto, variacoes });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao criar produto", detalhes: error.message });
  }
};

const atualizarProduto = async (req, res) => {
  try {
    const usuario = req.user;
    if (!usuario || usuario.tipo !== "administrador") {
      return res.status(403).json({ error: "Apenas administradores podem atualizar produtos." });
    }

    const { nome, descricao, preco, estoque, categoria_id, marca_id, variacoes } = req.body;

    let imagem_url = null;
    let video_url = null;
    const fileImagem = getFileByFieldName(req, "imagem");
    if (fileImagem) {
      imagem_url = `/uploads/images/${fileImagem.filename}`;
    }
    const fileVideo = getFileByFieldName(req, "video");
    if (fileVideo) {
      video_url = `/uploads/videos/${fileVideo.filename}`;
    }

    const produto = await Produto.findByPk(req.params.id);
    if (!produto) {
      return res.status(404).json({ error: "Produto não encontrado" });
    }

    await produto.update({
      nome,
      descricao,
      preco,
      estoque,
      categoria_id,
      marca_id,
      imagem_url,
      video_url,
    });

    if (variacoes && Array.isArray(variacoes)) {
      // Remove as variações atuais do produto
      await ProdutoVariacao.destroy({ where: { produto_id: produto.id } });
      for (const variacao of variacoes) {
        if (!variacao.cor_id || !variacao.tamanho_id || !variacao.quantidade) {
          return res.status(400).json({
            error: "Cada variação deve conter 'cor_id', 'tamanho_id' e 'quantidade'.",
          });
        }
        const fieldName = `imagem_variacao_${variacao.cor_id}_${variacao.tamanho_id}`;
        let imagem_url_variacao = null;
        const fileVariacao = getFileByFieldName(req, fieldName);
        if (fileVariacao) {
          imagem_url_variacao = `/uploads/images/${fileVariacao.filename}`;
        }

        await ProdutoVariacao.create({
          produto_id: produto.id,
          cor_id: variacao.cor_id,
          tamanho_id: variacao.tamanho_id,
          quantidade: variacao.quantidade,
          imagem_url: imagem_url_variacao,
        });
      }
    }

    return res.json({ message: "Produto atualizado com sucesso", produto });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao atualizar produto", detalhes: error.message });
  }
};

const deletarProduto = async (req, res) => {
  try {
    const usuario = req.user;
    if (!usuario || usuario.tipo !== "administrador") {
      return res.status(403).json({ error: "Apenas administradores podem remover produtos." });
    }

    const produto = await Produto.findByPk(req.params.id);
    if (!produto) {
      return res.status(404).json({ error: "Produto não encontrado" });
    }

    await ProdutoVariacao.destroy({ where: { produto_id: produto.id } });
    await produto.destroy();

    return res.json({ message: "Produto removido com sucesso" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao remover produto", detalhes: error.message });
  }
};

module.exports = { listarProdutos, buscarProduto, criarProduto, atualizarProduto, deletarProduto };
