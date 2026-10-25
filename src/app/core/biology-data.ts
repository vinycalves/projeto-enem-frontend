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
    description: 'Região que organiza os microtúbulos e o fuso mitótico durante a divisão celular.',
    function: 'Organizar o citoesqueleto e a divisão.',
    color: '#3f6f8f',
    kinds: ['animal'],
  },
  {
    id: 'peroxisome',
    name: 'Peroxissomo',
    short: 'Detoxificação',
    description:
      'Vesícula que degrada peróxido de hidrogênio e participa do metabolismo de lipídios.',
    function: 'Detoxificação e metabolismo de lipídios.',
    color: '#8b5cf6',
    kinds: ['vegetal'],
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

export function organelleColor(kind: CellKind, organelle: Organelle): string {
  if (kind === 'vegetal') {
    if (organelle.id === 'nucleus') return '#fbbf24';
    if (organelle.id === 'nucleolus') return '#2563eb';
    if (organelle.id === 'ribosome') return '#facc15';
    if (organelle.id === 'rer') return '#4ade80';
  }
  return organelle.color;
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
  source?: string;
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
      {
        rank: 'Reino',
        name: 'Animalia',
        note: 'Seres heterótrofos, pluricelulares e sem parede celular.',
      },
      {
        rank: 'Filo',
        name: 'Chordata',
        note: 'Notocorda e tubo neural dorsal em algum estágio da vida.',
      },
      { rank: 'Classe', name: 'Mammalia', note: 'Glândulas mamárias e presença de pelos.' },
      { rank: 'Ordem', name: 'Primates', note: 'Visão binocular e mãos com grande mobilidade.' },
      {
        rank: 'Família',
        name: 'Hominidae',
        note: 'Grandes primatas, incluindo humanos e parentes extintos.',
      },
      {
        rank: 'Gênero',
        name: 'Homo',
        note: 'Gênero que reúne a espécie humana e espécies próximas.',
      },
      { rank: 'Espécie', name: 'Homo sapiens', note: 'Nome científico da espécie humana.' },
    ],
  },
  {
    id: 'jaguar',
    commonName: 'Onça-pintada',
    scientificName: 'Panthera onca',
    domain: 'Eukarya',
    group: 'Animalia',
    summary:
      'Maior felino das Américas e um dos principais predadores de topo em florestas e áreas alagadas neotropicais.',
    color: '#b5832f',
    ranks: [
      {
        rank: 'Domínio',
        name: 'Eukarya',
        note: 'Células eucariontes com núcleo e organelas membranosas.',
      },
      {
        rank: 'Reino',
        name: 'Animalia',
        note: 'Heterótrofos, pluricelulares e sem parede celular.',
      },
      {
        rank: 'Filo',
        name: 'Chordata',
        note: 'Notocorda e tubo neural dorsal em algum estágio do desenvolvimento.',
      },
      { rank: 'Classe', name: 'Mammalia', note: 'Glândulas mamárias, pelos e homeotermia.' },
      {
        rank: 'Ordem',
        name: 'Carnivora',
        note: 'Dentição adaptada à dieta carnívora, com variações em algumas espécies.',
      },
      {
        rank: 'Família',
        name: 'Felidae',
        note: 'Felinos, como onças, leopardos, gatos e tigres.',
      },
      {
        rank: 'Gênero',
        name: 'Panthera',
        note: 'Grandes felinos, incluindo onça, leão, tigre e leopardo.',
      },
      { rank: 'Espécie', name: 'Panthera onca', note: 'Nome científico da onça-pintada.' },
    ],
  },
  {
    id: 'bee',
    commonName: 'Abelha-europeia',
    scientificName: 'Apis mellifera',
    domain: 'Eukarya',
    group: 'Animalia',
    summary:
      'Inseto social da ordem Hymenoptera, criado para a produção de mel e importante polinizador de culturas agrícolas.',
    color: '#b58a2f',
    ranks: [
      { rank: 'Domínio', name: 'Eukarya', note: 'Células eucariontes.' },
      {
        rank: 'Reino',
        name: 'Animalia',
        note: 'Heterótrofos, pluricelulares e sem parede celular.',
      },
      {
        rank: 'Filo',
        name: 'Arthropoda',
        note: 'Corpo segmentado, exoesqueleto de quitina e apêndices articulados.',
      },
      {
        rank: 'Classe',
        name: 'Insecta',
        note: 'Três pares de patas, um par de antenas e, em geral, asas.',
      },
      {
        rank: 'Ordem',
        name: 'Hymenoptera',
        note: 'Abelhas, vespas e formigas; muitos grupos são sociais.',
      },
      {
        rank: 'Família',
        name: 'Apidae',
        note: 'Família das abelhas, incluindo as abelhas melíferas e as abelhas-sem-ferrão.',
      },
      { rank: 'Gênero', name: 'Apis', note: 'Gênero das abelhas melíferas.' },
      {
        rank: 'Espécie',
        name: 'Apis mellifera',
        note: 'Espécie de abelha-europeia, amplamente criada no mundo.',
      },
    ],
  },
  {
    id: 'toucan',
    commonName: 'Tucano-toco',
    scientificName: 'Ramphastos toco',
    domain: 'Eukarya',
    group: 'Animalia',
    summary:
      'Ave sul-americana de grande bico, encontrada em áreas abertas e bordas de floresta. O bico é leve e ajuda na termorregulação.',
    color: '#a86f3a',
    ranks: [
      { rank: 'Domínio', name: 'Eukarya', note: 'Células eucariontes.' },
      {
        rank: 'Reino',
        name: 'Animalia',
        note: 'Heterótrofos, pluricelulares e sem parede celular.',
      },
      {
        rank: 'Filo',
        name: 'Chordata',
        note: 'Notocorda e tubo neural dorsal em algum estágio da vida.',
      },
      { rank: 'Classe', name: 'Aves', note: 'Penas, bico sem dentes e ovos com casca calcária.' },
      {
        rank: 'Ordem',
        name: 'Piciformes',
        note: 'Aves como tucanos, pica-paus e araçaris.',
      },
      {
        rank: 'Família',
        name: 'Ramphastidae',
        note: 'Família dos tucanos e araçaris.',
      },
      { rank: 'Gênero', name: 'Ramphastos', note: 'Gênero dos tucanos de grande porte.' },
      { rank: 'Espécie', name: 'Ramphastos toco', note: 'Nome científico do tucano-toco.' },
    ],
  },
  {
    id: 'cane-toad',
    commonName: 'Sapo-cururu',
    scientificName: 'Rhinella marina',
    domain: 'Eukarya',
    group: 'Animalia',
    summary:
      'Anfíbio anuro de grande porte, nativo da América do Sul e introduzido em várias regiões. Também é chamado de sapo-boi.',
    color: '#6f7d4f',
    ranks: [
      { rank: 'Domínio', name: 'Eukarya', note: 'Células eucariontes.' },
      {
        rank: 'Reino',
        name: 'Animalia',
        note: 'Heterótrofos, pluricelulares e sem parede celular.',
      },
      {
        rank: 'Filo',
        name: 'Chordata',
        note: 'Notocorda e tubo neural dorsal em algum estágio da vida.',
      },
      {
        rank: 'Classe',
        name: 'Amphibia',
        note: 'Pele permeável, ovos sem casca e metamorfose na maioria das espécies.',
      },
      {
        rank: 'Ordem',
        name: 'Anura',
        note: 'Anfíbios sem cauda na fase adulta: sapos, rãs e pererecas.',
      },
      {
        rank: 'Família',
        name: 'Bufonidae',
        note: 'Sapos verdadeiros, com glândulas parotoides produtoras de toxinas.',
      },
      { rank: 'Gênero', name: 'Rhinella', note: 'Gênero de sapos neotropicais.' },
      {
        rank: 'Espécie',
        name: 'Rhinella marina',
        note: 'Nome atual do sapo-cururu; antes classificado como Bufo marinus.',
      },
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
      {
        rank: 'Reino',
        name: 'Plantae',
        note: 'Autótrofos fotossintetizantes, com parede de celulose.',
      },
      { rank: 'Filo', name: 'Magnoliophyta', note: 'Angiospermas: plantas com flores e frutos.' },
      {
        rank: 'Classe',
        name: 'Liliopsida',
        note: 'Monocotiledôneas: um cotilédone, folhas paralelinérveas.',
      },
      { rank: 'Ordem', name: 'Poales', note: 'Grupo de gramíneas e plantas relacionadas.' },
      { rank: 'Família', name: 'Poaceae', note: 'Gramíneas, como milho, trigo e arroz.' },
      { rank: 'Gênero', name: 'Zea', note: 'Gênero do milho.' },
      { rank: 'Espécie', name: 'Zea mays', note: 'Nome científico do milho.' },
    ],
  },
  {
    id: 'coffee',
    commonName: 'Café-arábica',
    scientificName: 'Coffea arabica',
    domain: 'Eukarya',
    group: 'Plantae',
    summary:
      'Angiosperma dicotiledônea da família Rubiaceae, cultivada principalmente em regiões tropicais de altitude.',
    color: '#7a4a2f',
    ranks: [
      { rank: 'Domínio', name: 'Eukarya', note: 'Células eucariontes.' },
      {
        rank: 'Reino',
        name: 'Plantae',
        note: 'Autótrofos fotossintetizantes, com parede de celulose.',
      },
      { rank: 'Filo', name: 'Magnoliophyta', note: 'Angiospermas: plantas com flores e frutos.' },
      {
        rank: 'Classe',
        name: 'Magnoliopsida',
        note: 'Dicotiledôneas: dois cotilédones e folhas geralmente reticuladas.',
      },
      {
        rank: 'Ordem',
        name: 'Gentianales',
        note: 'Ordem que inclui cafeeiros, gardênias e quinas.',
      },
      {
        rank: 'Família',
        name: 'Rubiaceae',
        note: 'Família do cafeeiro, da quina e do ipecacuanha.',
      },
      { rank: 'Gênero', name: 'Coffea', note: 'Gênero dos cafeeiros.' },
      {
        rank: 'Espécie',
        name: 'Coffea arabica',
        note: 'Espécie de café-arábica, a mais cultivada para bebida.',
      },
    ],
  },
  {
    id: 'bean',
    commonName: 'Feijão-comum',
    scientificName: 'Phaseolus vulgaris',
    domain: 'Eukarya',
    group: 'Plantae',
    summary:
      'Leguminosa anual da família Fabaceae, cultivada como alimento e capaz de formar associações com bactérias fixadoras de nitrogênio.',
    color: '#8a5a3a',
    ranks: [
      { rank: 'Domínio', name: 'Eukarya', note: 'Células eucariontes.' },
      {
        rank: 'Reino',
        name: 'Plantae',
        note: 'Autótrofos fotossintetizantes, com parede de celulose.',
      },
      { rank: 'Filo', name: 'Magnoliophyta', note: 'Angiospermas: plantas com flores e frutos.' },
      { rank: 'Classe', name: 'Magnoliopsida', note: 'Dicotiledôneas.' },
      { rank: 'Ordem', name: 'Fabales', note: 'Ordem das leguminosas e plantas próximas.' },
      {
        rank: 'Família',
        name: 'Fabaceae',
        note: 'Leguminosas, como feijão, soja, ervilha e amendoim.',
      },
      {
        rank: 'Gênero',
        name: 'Phaseolus',
        note: 'Gênero que inclui o feijão-comum e outras espécies cultivadas.',
      },
      { rank: 'Espécie', name: 'Phaseolus vulgaris', note: 'Nome científico do feijão-comum.' },
    ],
  },
  {
    id: 'orange',
    commonName: 'Laranjeira-doce',
    scientificName: 'Citrus × sinensis',
    domain: 'Eukarya',
    group: 'Plantae',
    summary:
      'Árvore cítrica cultivada pelos frutos. O sinal × indica que se trata de um híbrido interespecífico.',
    color: '#c47a2c',
    ranks: [
      { rank: 'Domínio', name: 'Eukarya', note: 'Células eucariontes.' },
      {
        rank: 'Reino',
        name: 'Plantae',
        note: 'Autótrofos fotossintetizantes, com parede de celulose.',
      },
      { rank: 'Filo', name: 'Magnoliophyta', note: 'Angiospermas: plantas com flores e frutos.' },
      { rank: 'Classe', name: 'Magnoliopsida', note: 'Dicotiledôneas.' },
      { rank: 'Ordem', name: 'Sapindales', note: 'Ordem que inclui cítricos, mogno e aroeira.' },
      { rank: 'Família', name: 'Rutaceae', note: 'Família dos cítricos e de plantas aromáticas.' },
      {
        rank: 'Gênero',
        name: 'Citrus',
        note: 'Gênero dos cítricos, como laranja, limão e tangerina.',
      },
      {
        rank: 'Espécie',
        name: 'Citrus × sinensis',
        note: 'Híbrido cultivado; também aparece como Citrus sinensis em parte da literatura.',
      },
    ],
  },
  {
    id: 'fern',
    commonName: 'Samambaia-das-taipas',
    scientificName: 'Pteridium aquilinum',
    domain: 'Eukarya',
    group: 'Plantae',
    summary:
      'Samambaia de ampla distribuição, usada como exemplo de planta vascular que não produz flores nem sementes.',
    color: '#3f6f4f',
    ranks: [
      { rank: 'Domínio', name: 'Eukarya', note: 'Células eucariontes.' },
      {
        rank: 'Reino',
        name: 'Plantae',
        note: 'Autótrofos fotossintetizantes, com parede de celulose.',
      },
      {
        rank: 'Filo',
        name: 'Tracheophyta',
        note: 'Plantas vasculares, com tecidos condutores de água e seiva.',
      },
      {
        rank: 'Classe',
        name: 'Polypodiopsida',
        note: 'Samambaias e cavalinhas; reprodução por esporos.',
      },
      {
        rank: 'Ordem',
        name: 'Polypodiales',
        note: 'Grande grupo de samambaias leptosporangiadas.',
      },
      {
        rank: 'Família',
        name: 'Dennstaedtiaceae',
        note: 'Família que inclui samambaias do gênero Pteridium.',
      },
      {
        rank: 'Gênero',
        name: 'Pteridium',
        note: 'Gênero de samambaias conhecidas como samambaias-das-taipas.',
      },
      {
        rank: 'Espécie',
        name: 'Pteridium aquilinum',
        note: 'Espécie de samambaia vascular sem sementes.',
      },
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
      {
        rank: 'Domínio',
        name: 'Bacteria',
        note: 'Procariontes, sem núcleo delimitado por membrana.',
      },
      {
        rank: 'Reino',
        name: '—',
        note: 'A classificação de bactérias não usa os mesmos reinos dos eucariontes.',
      },
      { rank: 'Filo', name: 'Proteobacteria', note: 'Grande grupo de bactérias Gram-negativas.' },
      { rank: 'Classe', name: 'Gammaproteobacteria', note: 'Classe à qual pertence a E. coli.' },
      {
        rank: 'Ordem',
        name: 'Enterobacterales',
        note: 'Bactérias associadas ao intestino e ao ambiente.',
      },
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
      {
        rank: 'Classe',
        name: 'Agaricomycetes',
        note: 'Classe dos fungos formadores de cogumelos.',
      },
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
