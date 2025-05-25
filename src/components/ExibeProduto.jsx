import { useState, useEffect } from 'react';

const EXPIRATION_TIME = 15 * 60 * 1000; // 15 minutos

export default function ExibeProduto({ dados }) {
  const { categoria } = dados;
  const { subcategoria } = categoria;
  const { listaProdutos } = subcategoria;
  const { produto } = listaProdutos;

  const imagens = produto.imagens;

  const STORAGE_KEY = `produtoSelecionado-${produto.id}`;
  const CEP_STORAGE_KEY = `cep-${produto.id}`;

  const initialState = {
    imagemSelecionada: Object.keys(imagens)[0] || '',
    corSelecionada: produto.coresDisponiveis?.[0] || '',
    tamanhoSelecionado: produto.tamanhos?.[0] || '',
    quantidade: 1,
  };

  function loadStateFromStorage() {
    if (typeof window === 'undefined') return initialState;

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;

    try {
      const saved = JSON.parse(raw);
      const now = Date.now();

      if (now - saved.timestamp > EXPIRATION_TIME) {
        localStorage.removeItem(STORAGE_KEY);
        return initialState;
      }

      return { ...initialState, ...saved };
    } catch {
      return initialState;
    }
  }

  const [estadoSelecionado, setEstadoSelecionado] = useState(loadStateFromStorage);
  const [cep, setCep] = useState('');
  const [cepInfo, setCepInfo] = useState(null);
  const [cepErro, setCepErro] = useState('');

  useEffect(() => {
    const toSave = {
      ...estadoSelecionado,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  }, [estadoSelecionado, STORAGE_KEY]);

  // Recupera o CEP salvo no localStorage
  useEffect(() => {
    const savedCep = localStorage.getItem(CEP_STORAGE_KEY);
    if (savedCep) {
      setCep(savedCep);
      verificarCep(savedCep); // Faz a busca do CEP automaticamente
    }
  }, []);

  const handleClick = (key, value) => {
    setEstadoSelecionado((prev) => ({ ...prev, [key]: value }));
  };

  const handleLinkClick = (link) => {
    console.log(`Redireciona para o link: ${link}`);
  };

  const handleCepChange = (e) => {
    setCep(e.target.value);
  };

  const verificarCep = async (cepLimpo) => {
    const cepLimpoFormatado = cepLimpo.replace(/\D/g, '');
    if (cepLimpoFormatado.length !== 8) {
      setCepErro('CEP inválido. Deve conter 8 dígitos.');
      setCepInfo(null);
      return;
    }

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpoFormatado}/json/`);
      const data = await response.json();
      if (data.erro) {
        setCepErro('CEP não encontrado.');
        setCepInfo(null);
      } else {
        setCepErro('');
        setCepInfo(data);
        // Salva apenas o CEP no localStorage
        localStorage.setItem(CEP_STORAGE_KEY, cepLimpoFormatado);
      }
    } catch {
      setCepErro('Erro ao consultar o CEP.');
      setCepInfo(null);
    }
  };

  return (
    <div className="h-screen bg-gray-200">
      <div className="h-[50px] bg-white px-10 flex items-center text-lg font-medium shadow-md space-x-2">
        <button onClick={() => handleLinkClick(categoria.link)} className="text-blue-300 hover:text-blue-500">
          {categoria.texto}
        </button>
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <button onClick={() => handleLinkClick(subcategoria.link)} className="text-blue-300 hover:text-blue-500">
          {subcategoria.texto}
        </button>
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <button onClick={() => handleLinkClick(listaProdutos.link)} className="text-blue-300 hover:text-blue-500">
          {listaProdutos.texto}
        </button>
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <button className="text-black">{produto.texto}</button>
      </div>

      <div className="flex justify-start items-start px-10 gap-6 pt-[30px]">
        <img
          src={imagens[estadoSelecionado.imagemSelecionada].src}
          alt={imagens[estadoSelecionado.imagemSelecionada].alt}
          className="w-[500px] rounded-lg shadow-lg transition-transform duration-500 ease-in-out transform"
        />

        <div className="flex flex-row gap-6">
          <div className="flex flex-col gap-4">
            {Object.entries(imagens).map(([id, img]) => (
              <img
                key={id}
                src={img.src}
                alt={img.alt}
                className={`w-[100px] rounded-md shadow-md cursor-pointer transition-all duration-200 transform ${
                  estadoSelecionado.imagemSelecionada === id
                    ? 'border-4 border-blue-500 scale-105'
                    : 'border-2 border-transparent hover:border-blue-500'
                }`}
                onClick={() => handleClick('imagemSelecionada', id)}
              />
            ))}
          </div>

          <div className="w-[400px] bg-white rounded shadow-md p-6 flex flex-col overflow-hidden">
            <h2 className="text-xl font-semibold text-black mb-2">{produto.texto}</h2>
            <div className="mb-0">
              <span className="text-sm text-gray-500 line-through">R${produto.precoAntigo}</span>
            </div>
            <div className="flex items-center gap-4 -mt-1 mb-4">
              <span className="text-2xl font-bold text-black">R${produto.precoAtual}</span>
              <span className="text-base font-semibold text-green-600">-{produto.desconto}</span>
            </div>

            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-1">Cor:</p>
              <div className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto pr-1">
                {produto.coresDisponiveis.map((cor) => (
                  <button
                    key={cor}
                    onClick={() => handleClick('corSelecionada', cor)}
                    className={`px-3 py-1 border rounded cursor-pointer transition ${
                      estadoSelecionado.corSelecionada === cor
                        ? 'bg-blue-500 text-white'
                        : 'bg-white text-black border-gray-300'
                    }`}
                  >
                    {cor}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-1">Tamanho:</p>
              <div className="flex flex-wrap gap-2 max-h-[100px] overflow-y-auto pr-1">
                {produto.tamanhos.map((tamanho) => (
                  <button
                    key={tamanho}
                    onClick={() => handleClick('tamanhoSelecionado', tamanho)}
                    className={`px-3 py-1 border rounded cursor-pointer transition ${
                      estadoSelecionado.tamanhoSelecionado === tamanho
                        ? 'bg-blue-500 text-white'
                        : 'bg-white text-black border-gray-300'
                    }`}
                  >
                    {tamanho}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-1">Quantidade:</p>
              <div className="flex items-center gap-3">
                <button
                  className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition"
                  onClick={() =>
                    setEstadoSelecionado((prev) => ({
                      ...prev,
                      quantidade: Math.max(1, prev.quantidade - 1),
                    }))
                  }
                >
                  −
                </button>
                <span className="text-lg font-medium">{estadoSelecionado.quantidade}</span>
                <button
                  className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition"
                  onClick={() =>
                    setEstadoSelecionado((prev) => ({
                      ...prev,
                      quantidade: prev.quantidade + 1,
                    }))
                  }
                >
                  +
                </button>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3">
              <button className="w-full py-2 border border-blue-500 text-blue-500 rounded hover:bg-blue-50 transition-transform transform hover:scale-105">
                Adicionar ao carrinho
              </button>
              <button className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-transform transform hover:scale-105">
                Comprar agora
              </button>
            </div>
          </div>
        </div>

        <div className="w-[300px] bg-white rounded shadow-md p-6 flex flex-col">
          <p className="text-sm font-medium text-gray-700 mb-1">Verificar disponibilidade de entrega:</p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Digite seu CEP"
              value={cep}
              onChange={handleCepChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  verificarCep(cep);
                }
              }}
              maxLength={9}
              className="border border-gray-300 rounded px-3 py-1 w-full min-w-[100px]"
            />
            <button
              onClick={() => verificarCep(cep)}
              className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-transform transform hover:scale-105"
            >
              Verificar
            </button>
          </div>
          {cepErro && <p className="text-red-500 mt-1 text-sm">{cepErro}</p>}
          {cepInfo && (
            <div className="mt-2 text-sm text-gray-800">
              <p>Logradouro: {cepInfo.logradouro || '-'}</p>
              <p>Bairro: {cepInfo.bairro || '-'}</p>
              <p>Cidade: {cepInfo.localidade || '-'}</p>
              <p>Estado: {cepInfo.uf || '-'}</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 w-full px-10">
        <div className="bg-white rounded shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2 text-black">Descrição:</h3>
          <p className="text-gray-700 leading-relaxed">
            {produto.descricao}
          </p>
        </div>
      </div>
    </div>
  );
}
