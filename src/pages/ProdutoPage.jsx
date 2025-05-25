import { useParams } from 'react-router-dom';
import ExibeProduto from '../components/ExibeProduto';
import camisaAzul from '../assets/camisa_azul.png';
import camisaBranca from '../assets/camisa_branca.png';
import camisaPreta from '../assets/camisa_preta.png';

function criarSlug(texto) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, '-');
}

const produto = {
  id: 'qlq-uid',
  texto: 'Camisa Google',
  precoAntigo: '234,16',
  precoAtual: '128,79',
  desconto: '45%',
  imagens: {
    azul: { src: camisaAzul, alt: 'Camisa Azul' },
    branca: { src: camisaBranca, alt: 'Camisa Branca' },
    preta: { src: camisaPreta, alt: 'Camisa Preta' },
  },
  coresDisponiveis: ['amarelo', 'azul', 'branco', 'marrom', 'preto'].sort(),
  tamanhos: ['M', 'G', 'GG'],
  descricao: 'Este produto representa a verdadeira essência do design inovador e da sofisticação. Com materiais de alta '+
            'qualidade e atenção aos detalhes, é uma escolha ideal para quem busca aliar conforto e estilo de forma prática. '+
            'Seu acabamento refinado e funcionalidade tornam-no uma adição indispensável a qualquer coleção.'
};

const dados = {
  categoria: {
    texto: 'Roupas Masculinas',
    link: 'hiperlink categoria',
    subcategoria: {
      texto: 'Blusas',
      link: 'hiperlink subcategoria',
      listaProdutos: {
        texto: 'Camisas',
        link: 'hiperlink listaProdutos',
        produto,
      },
    },
  },
};

export default function ProdutoPage() {
  const { nome } = useParams();
  const slugProduto = criarSlug(produto.texto);

  if (nome !== slugProduto) {
    return <p>Produto não encontrado</p>;
  }

  return <ExibeProduto dados={dados} />;
}
