export type CellKind = 'animal' | 'vegetal';

export interface Organelle {
  id: string;
  name: string;
  short: string;
  description: string;
  function: string;
  color: string;
  kinds: CellKind[];
}

export const CELL_ORGANELLES: Organelle[] = [
  {
    id: 'membrane',
    name: 'Membrana plasmática',
    short: 'Controle de trocas',
    description:
      'Delimita a célula e regula a entrada e a saída de água, íons, nutrientes e outras substâncias.',
    function: 'Permeabilidade seletiva e proteção.',
    color: '#9cc9b7',
    kinds: ['animal', 'vegetal'],
  },
  {
    id: 'cytoplasm',
    name: 'Citoplasma',
    short: 'Meio intracelular',
    description:
      'Meio aquoso que preenche a célula e abriga as organelas, o citoesqueleto e diversas reações metabólicas.',
    function: 'Sustentação e organização do metabolismo.',
    color: '#d8efe4',
    kinds: ['animal', 'vegetal'],
  },
  {
    id: 'nucleus',
    name: 'Núcleo',
    short: 'Centro de controle',
    description:
      'Contém o DNA nuclear e coordena a expressão gênica, a divisão celular e as principais atividades da célula.',
    function: 'Armazenar o material genético e regular a célula.',
    color: '#6b4f8a',
    kinds: ['animal', 'vegetal'],
  },
  {
    id: 'nucleolus',
    name: 'Nucléolo',
    short: 'Fábrica de ribossomos',
    description:
      'Região densa no interior do núcleo onde são produzidos os componentes dos ribossomos.',
    function: 'Síntese de rRNA e montagem de ribossomos.',
    color: '#8f6caf',
    kinds: ['animal', 'vegetal'],
  },
  {
    id: 'mitochondrion',
    name: 'Mitocôndria',
    short: 'Produção de ATP',
    description:
      'Organela responsável pela respiração celular aeróbia e pela maior parte da produção de ATP.',
    function: 'Converter energia química em ATP.',
    color: '#c96f4a',
    kinds: ['animal', 'vegetal'],
  },
  {
    id: 'ribosome',
    name: 'Ribossomo',
    short: 'Síntese de proteínas',
    description:
      'Estrutura responsável pela tradução do RNA mensageiro em proteínas. Pode estar livre ou associada ao retículo endoplasmático.',
    function: 'Sintetizar proteínas.',
    color: '#d9a441',
    kinds: ['animal', 'vegetal'],
  },
  {
    id: 'rer',
    name: 'Retículo endoplasmático rugoso',
    short: 'Proteínas e transporte',
    description:
      'Rede de membranas associada a ribossomos, envolvida na síntese, no dobramento e no transporte de proteínas.',
    function: 'Produzir e transportar proteínas.',
    color: '#b58a4a',
    kinds: ['animal', 'vegetal'],
  },
  {
    id: 'golgi',
    name: 'Complexo de Golgi',
    short: 'Distribuição celular',
    description:
      'Conjunto de membranas que modifica, classifica e empacota proteínas e lipídios em vesículas.',
    function: 'Processar e endereçar moléculas.',
    color: '#d9a441',
    kinds: ['animal', 'vegetal'],
  },
  {
    id: 'lysosome',
    name: 'Lisossomo',
    short: 'Digestão intracelular',
    description:
      'Vesícula com enzimas digestivas que degrada materiais capturados pela célula e componentes celulares antigos.',
    function: 'Digestão intracelular.',
    color: '#b55d3f',
    kinds: ['animal'],
  },
  {
    id: 'centrosome',
    name: 'Centrossomo',
    short: 'Fuso mitótico',
    description:
      'Região que organiza os microtúbulos e o fuso mitótico durante a divisão celular.',
    function: 'Organizar o citoesqueleto e a divisão.',
    color: '#3f6f8f',
    kinds: ['animal'],
  },
  {
    id: 'cellwall',
    name: 'Parede celular',
    short: 'Suporte e proteção',
    description:
      'Estrutura rígida externa à membrana plasmática, formada principalmente por celulose nas células vegetais.',
    function: 'Dar forma, sustentação e proteção.',
    color: '#8a6a2f',
    kinds: ['vegetal'],
  },
  {
    id: 'chloroplast',
    name: 'Cloroplasto',
    short: 'Fotossíntese',
    description:
      'Organela com clorofila que realiza a fotossíntese, convertendo energia luminosa em energia química.',
    function: 'Produzir matéria orgânica a partir da luz.',
    color: '#2f7d4f',
    kinds: ['vegetal'],
  },
  {
    id: 'vacuole',
    name: 'Vacúolo central',
    short: 'Reserva e turgor',
    description:
      'Grande vesícula que armazena água, íons, açúcares e pigmentos, além de manter a pressão de turgor da célula vegetal.',
    function: 'Armazenar substâncias e sustentar a célula.',
    color: '#7fb7c9',
    kinds: ['vegetal'],
  },
];

export function organellesFor(kind: CellKind): Organelle[] {
  return CELL_ORGANELLES.filter((organelle) => organelle.kinds.includes(kind));
}

export function organelleById(id: string): Organelle | undefined {
  return CELL_ORGANELLES.find((organelle) => organelle.id === id);
}

export interface TaxonomyRank {
  rank: string;
  name: string;
  note: string;
}

export interface TaxonomyExample {
  id: string;
  commonName: string;
  scientificName: string;
  domain: 'Bacteria' | 'Archaea' | 'Eukarya';
  group: string;
  summary: string;
  color: string;
  ranks: TaxonomyRank[];
}

export const TAXONOMY_EXAMPLES: TaxonomyExample[] = [
  {
    id: 'humano',
    commonName: 'Ser humano',
    scientificName: 'Homo sapiens',
    domain: 'Eukarya',
    group: 'Animalia',
    summary:
      'Somos primatas da família Hominidae. A espécie é definida pelo nome binomial Homo sapiens — sempre em itálico.',
    color: '#b55d3f',
    ranks: [
      { rank: 'Domínio', name: 'Eukarya', note: 'Células com núcleo e organelas membranosas.' },
      { rank: 'Reino', name: 'Animalia', note: 'Seres heterótrofos, pluricelulares e sem parede celular.' },
      { rank: 'Filo', name: 'Chordata', note: 'Notocorda e tubo neural dorsal em algum estágio da vida.' },
      { rank: 'Classe', name: 'Mammalia', note: 'Glândulas mamárias e presença de pelos.' },
      { rank: 'Ordem', name: 'Primates', note: 'Visão binocular e mãos com grande mobilidade.' },
      { rank: 'Família', name: 'Hominidae', note: 'Grandes primatas, incluindo humanos e parentes extintos.' },
      { rank: 'Gênero', name: 'Homo', note: 'Gênero que reúne a espécie humana e espécies próximas.' },
      { rank: 'Espécie', name: 'Homo sapiens', note: 'Nome científico da espécie humana.' },
    ],
  },
  {
    id: 'milho',
    commonName: 'Milho',
    scientificName: 'Zea mays',
    domain: 'Eukarya',
    group: 'Plantae',
    summary:
      'O milho é uma angiosperma monocotiledônea de grande importância agrícola. O nome científico é Zea mays.',
    color: '#2f7d4f',
    ranks: [
      { rank: 'Domínio', name: 'Eukarya', note: 'Células eucariontes.' },
      { rank: 'Reino', name: 'Plantae', note: 'Autótrofos fotossintetizantes, com parede de celulose.' },
      { rank: 'Filo', name: 'Magnoliophyta', note: 'Angiospermas: plantas com flores e frutos.' },
      { rank: 'Classe', name: 'Liliopsida', note: 'Monocotiledôneas: um cotilédone, folhas paralelinérveas.' },
      { rank: 'Ordem', name: 'Poales', note: 'Grupo de gramíneas e plantas relacionadas.' },
      { rank: 'Família', name: 'Poaceae', note: 'Gramíneas, como milho, trigo e arroz.' },
      { rank: 'Gênero', name: 'Zea', note: 'Gênero do milho.' },
      { rank: 'Espécie', name: 'Zea mays', note: 'Nome científico do milho.' },
    ],
  },
  {
    id: 'ecoli',
    commonName: 'Bactéria E. coli',
    scientificName: 'Escherichia coli',
    domain: 'Bacteria',
    group: 'Bacteria',
    summary:
      'E. coli é uma bactéria Gram-negativa comum no intestino humano. Bactérias não seguem a mesma divisão de reinos dos eucariontes.',
    color: '#3f6f8f',
    ranks: [
      { rank: 'Domínio', name: 'Bacteria', note: 'Procariontes, sem núcleo delimitado por membrana.' },
      { rank: 'Reino', name: '—', note: 'A classificação de bactérias não usa os mesmos reinos dos eucariontes.' },
      { rank: 'Filo', name: 'Proteobacteria', note: 'Grande grupo de bactérias Gram-negativas.' },
      { rank: 'Classe', name: 'Gammaproteobacteria', note: 'Classe à qual pertence a E. coli.' },
      { rank: 'Ordem', name: 'Enterobacterales', note: 'Bactérias associadas ao intestino e ao ambiente.' },
      { rank: 'Família', name: 'Enterobacteriaceae', note: 'Família de bactérias Gram-negativas.' },
      { rank: 'Gênero', name: 'Escherichia', note: 'Gênero descrito por Theodor Escherich.' },
      { rank: 'Espécie', name: 'Escherichia coli', note: 'Nome científico da bactéria.' },
    ],
  },
  {
    id: 'cogumelo',
    commonName: 'Cogumelo champignon',
    scientificName: 'Agaricus bisporus',
    domain: 'Eukarya',
    group: 'Fungi',
    summary:
      'Fungos são heterótrofos por absorção e têm parede de quitina. O champignon é um fungo basidiomiceto.',
    color: '#8a6a2f',
    ranks: [
      { rank: 'Domínio', name: 'Eukarya', note: 'Células eucariontes.' },
      { rank: 'Reino', name: 'Fungi', note: 'Heterótrofos por absorção, parede de quitina.' },
      { rank: 'Filo', name: 'Basidiomycota', note: 'Fungos que produzem esporos em basídios.' },
      { rank: 'Classe', name: 'Agaricomycetes', note: 'Classe dos fungos formadores de cogumelos.' },
      { rank: 'Ordem', name: 'Agaricales', note: 'Ordem dos cogumelos com lamelas.' },
      { rank: 'Família', name: 'Agaricaceae', note: 'Família do champignon.' },
      { rank: 'Gênero', name: 'Agaricus', note: 'Gênero de fungos comestíveis e tóxicos.' },
      { rank: 'Espécie', name: 'Agaricus bisporus', note: 'Nome científico do champignon.' },
    ],
  },
];

export const TAXONOMY_STEPS = [
  {
    number: '01',
    title: 'Agrupar por características',
    text: 'A taxonomia organiza os seres vivos com base em características compartilhadas, como células, nutrição, reprodução e parentesco evolutivo.',
  },
  {
    number: '02',
    title: 'Descer na hierarquia',
    text: 'Quanto mais descemos do domínio para a espécie, mais específico e restrito é o grupo. Cada nível é chamado de táxon.',
  },
  {
    number: '03',
    title: 'Nomear com dois nomes',
    text: 'A nomenclatura binomial usa Gênero + espécie. O nome científico é escrito em itálico; o gênero começa com maiúscula.',
  },
  {
    number: '04',
    title: 'Separar taxonomia de filogenia',
    text: 'Taxonomia é o sistema de nomes e grupos; filogenia é a história evolutiva. Nem todo grupo tradicional é monofilético — Protista, por exemplo, é um agrupamento parafilético.',
  },
];
