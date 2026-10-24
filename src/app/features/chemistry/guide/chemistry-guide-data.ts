export type GuidePriority = 'alta' | 'media' | 'baixa';

export interface GuideTool {
  label: string;
  route: string;
  process?: 'reaction' | 'solution' | 'gas' | 'ph' | 'calorimetry' | 'half-life';
}

export interface GuideTopic {
  id: string;
  title: string;
  priority: GuidePriority;
  bullets: string[];
  formulas?: string[];
  tool?: GuideTool;
}

export interface GuideBlock {
  id: string;
  number: number;
  title: string;
  priority: GuidePriority;
  intro: string;
  topics: GuideTopic[];
}

const LAB = '/quimica/laboratorio';

export const CHEMISTRY_GUIDE: GuideBlock[] = [
  {
    id: 'materia-separacao',
    number: 1,
    title: 'Matéria e separação de misturas',
    priority: 'alta',
    intro: 'O ENEM cobra escolha de método, leitura de curvas e distinção entre transformação física e química.',
    topics: [
      {
        id: 'estados-mudancas',
        title: 'Estados físicos e mudanças de estado',
        priority: 'alta',
        bullets: [
          'Fusão, solidificação, vaporização, condensação e sublimação.',
          'Curvas de aquecimento e resfriamento: patamares indicam mudança de estado.',
          'Substância pura tem pontos de fusão e ebulição constantes; mistura eutética/azeotrópica tem comportamento próprio.',
        ],
      },
      {
        id: 'substancia-mistura',
        title: 'Substância pura, mistura e dispersões',
        priority: 'alta',
        bullets: [
          'Substância simples tem um elemento; composta tem dois ou mais.',
          'Mistura homogênea tem uma fase; heterogênea tem duas ou mais.',
          'Solução, coloide e suspensão diferem pelo tamanho das partículas; efeito Tyndall ajuda a identificar coloides.',
        ],
      },
      {
        id: 'fenomenos-propriedades',
        title: 'Fenômeno físico, químico e propriedades específicas',
        priority: 'media',
        bullets: [
          'Mudança de estado, dissolução e trituração podem ser fenômenos físicos.',
          'Combustão, oxidação e fermentação são fenômenos químicos.',
          'Densidade, PF e PE ajudam a identificar substâncias e pureza.',
        ],
      },
      {
        id: 'separacao-heterogenea',
        title: 'Separação de misturas heterogêneas',
        priority: 'alta',
        bullets: [
          'Catação, peneiração, filtração, decantação, centrifugação e funil de separação.',
          'Flotação, levigação, separação magnética e dissolução fracionada.',
          'Escolha o método pela diferença de propriedade: tamanho, densidade, solubilidade ou magnetismo.',
        ],
      },
      {
        id: 'separacao-homogenea',
        title: 'Separação de misturas homogêneas',
        priority: 'alta',
        bullets: [
          'Destilação simples separa sólido dissolvido de líquido.',
          'Destilação fracionada separa líquidos com pontos de ebulição diferentes.',
          'Evaporação, cristalização, fusão fracionada e liquefação fracionada.',
        ],
      },
      {
        id: 'alotropia',
        title: 'Alotropia',
        priority: 'media',
        bullets: [
          'Mesmo elemento formando substâncias simples diferentes.',
          'Carbono: diamante, grafite, grafeno, fulereno e nanotubos.',
          'Oxigênio e ozônio; fósforo branco e vermelho; enxofre rômbico e monoclínico.',
        ],
      },
    ],
  },
  {
    id: 'estrutura-atomica',
    number: 2,
    title: 'Estrutura atômica',
    priority: 'media',
    intro: 'A base é Z, A, íons e distribuição eletrônica; modelos históricos entram como contexto.',
    topics: [
      {
        id: 'particulas',
        title: 'Partículas, número atômico e massa',
        priority: 'alta',
        bullets: [
          'Próton define Z; nêutron e próton definem A; N = A − Z.',
          'Elétron tem massa desprezível e carga negativa.',
          'Cátion perde elétrons; ânion ganha elétrons.',
        ],
        formulas: ['A = Z + N', 'N = A − Z'],
      },
      {
        id: 'isotopos',
        title: 'Isótopos, isóbaros, isótonos e isoeletrônicos',
        priority: 'alta',
        bullets: [
          'Isótopos: mesmo Z, diferente N.',
          'Isóbaros: mesmo A; isótonos: mesmo N.',
          'Isoeletrônicos: mesmo número de elétrons.',
        ],
      },
      {
        id: 'modelos',
        title: 'Modelos atômicos',
        priority: 'baixa',
        bullets: [
          'Dalton: átomo indivisível; Thomson: pudim de passas.',
          'Rutherford: núcleo e eletrosfera; Bohr: níveis quantizados.',
          'Modelo quântico: orbital como região de probabilidade.',
        ],
      },
      {
        id: 'distribuicao',
        title: 'Distribuição eletrônica',
        priority: 'media',
        bullets: [
          'Diagrama de Pauling e camada de valência.',
          'A configuração ajuda a localizar o elemento na tabela.',
          'Números quânticos aparecem com baixa frequência; foque em n, l e spin apenas se o enunciado pedir.',
        ],
      },
      {
        id: 'espectros',
        title: 'Espectros, chama e fogos',
        priority: 'media',
        bullets: [
          'Elétron absorve energia e salta para nível mais energético; ao retornar, emite luz.',
          'Cada elemento tem espectro característico.',
          'Teste de chama e fogos de artifício são aplicações.',
        ],
      },
    ],
  },
  {
    id: 'tabela-periodica',
    number: 3,
    title: 'Tabela periódica e propriedades',
    priority: 'media',
    intro: 'A tabela é uma ferramenta de previsão; o ENEM cobra direções de propriedades e relação com a configuração.',
    topics: [
      {
        id: 'organizacao-tabela',
        title: 'Organização da tabela',
        priority: 'alta',
        bullets: [
          'Períodos são linhas; grupos/famílias são colunas.',
          'Alcalinos, alcalino-terrosos, halogênios, calcogênios e gases nobres.',
          'Metais, ametais, semimetais e elementos de transição.',
        ],
        tool: { label: 'Abrir tabela periódica interativa', route: '/quimica/tabela-periodica' },
      },
      {
        id: 'configuracao-posicao',
        title: 'Configuração eletrônica e posição',
        priority: 'media',
        bullets: [
          'O período corresponde à camada de valência ocupada.',
          'O grupo se relaciona ao número de elétrons na camada de valência.',
          'Família e bloco (s, p, d, f) ajudam a prever propriedades.',
        ],
      },
      {
        id: 'propriedades-periodicas',
        title: 'Propriedades periódicas',
        priority: 'alta',
        bullets: [
          'Raio atômico cresce para a esquerda e para baixo.',
          'Energia de ionização e eletronegatividade crescem para a direita e para cima.',
          'Afinidade eletrônica e eletropositividade têm tendências próprias; interprete junto com raio e carga nuclear.',
        ],
        tool: { label: 'Explorar propriedades na tabela', route: '/quimica/tabela-periodica' },
      },
      {
        id: 'metais-pesados',
        title: 'Metais pesados e toxicidade',
        priority: 'media',
        bullets: [
          'Hg, Pb, Cd e As são cobrados em contaminação, garimpo e resíduos.',
          'Bioacumulação e biomagnificação aumentam a concentração ao longo da cadeia.',
          'Compare com tratamento de água e descarte de lixo eletrônico.',
        ],
      },
    ],
  },
  {
    id: 'ligacoes',
    number: 4,
    title: 'Ligações e forças intermoleculares',
    priority: 'alta',
    intro: 'Ligação explica propriedades; forças intermoleculares explicam PF, PE, solubilidade e viscosidade.',
    topics: [
      {
        id: 'tipos-ligacao',
        title: 'Iônica, covalente e metálica',
        priority: 'alta',
        bullets: [
          'Iônica: transferência de elétrons, geralmente metal + ametal; altos PF/PE.',
          'Covalente: compartilhamento; pode ser normal ou dativa.',
          'Metálica: mar de elétrons; boa condutividade e maleabilidade.',
        ],
      },
      {
        id: 'octeto-lewis',
        title: 'Octeto e estruturas de Lewis',
        priority: 'media',
        bullets: [
          'A regra do octeto tem exceções (H, Be, B, expansão em elementos do 3º período).',
          'Lewis mostra elétrons de valência e ligações.',
          'Carga formal ajuda a escolher a estrutura mais plausível.',
        ],
      },
      {
        id: 'geometria-polaridade',
        title: 'Geometria molecular e polaridade',
        priority: 'alta',
        bullets: [
          'VSEPR: pares de elétrons se repelem e definem a forma.',
          'Linear, angular, trigonal plana, piramidal e tetraédrica.',
          'Vetores momento dipolar se somam; geometria simétrica pode cancelar dipolos.',
        ],
      },
      {
        id: 'forcas-intermoleculares',
        title: 'Forças intermoleculares',
        priority: 'alta',
        bullets: [
          'Dispersão de London, dipolo-dipolo e ligação de hidrogênio.',
          'Ligação de H é mais forte que dipolo-dipolo e dispersão.',
          'PF, PE, viscosidade e solubilidade crescem com forças mais intensas; “semelhante dissolve semelhante”.',
        ],
      },
      {
        id: 'solidos-alotropia',
        title: 'Sólidos e alotropia do carbono',
        priority: 'alta',
        bullets: [
          'Iônicos, moleculares, covalentes e metálicos.',
          'Diamante: rede covalente tridimensional, muito duro.',
          'Grafite conduz eletricidade por elétrons π; grafeno, fulereno e nanotubos têm estruturas próprias.',
        ],
      },
    ],
  },
  {
    id: 'funcoes-inorganicas',
    number: 5,
    title: 'Funções inorgânicas e reações',
    priority: 'media',
    intro: 'Reconheça função, força e produto provável; o ENEM contextualiza com produtos do cotidiano.',
    topics: [
      {
        id: 'acidos',
        title: 'Ácidos',
        priority: 'alta',
        bullets: [
          'Arrhenius: libera H⁺ em água; Brønsted-Lowry: doa próton.',
          'Hidrácidos e oxiácidos; força depende da estrutura.',
          'HCl, H₂SO₄, HNO₃, H₃PO₄, H₂CO₃ e CH₃COOH no cotidiano.',
        ],
        tool: { label: 'Calcular pH no laboratório', route: LAB, process: 'ph' },
      },
      {
        id: 'bases',
        title: 'Bases',
        priority: 'alta',
        bullets: [
          'Liberam OH⁻ em água ou recebem próton.',
          'Solubilidade e força variam; NaOH e KOH são fortes.',
          'Ca(OH)₂, Mg(OH)₂ e NH₃ são comuns em contexto ambiental e industrial.',
        ],
        tool: { label: 'Calcular pH no laboratório', route: LAB, process: 'ph' },
      },
      {
        id: 'sais',
        title: 'Sais, neutralização e hidrólise',
        priority: 'media',
        bullets: [
          'Ácido + base forma sal + água.',
          'Hidrólise salina pode gerar caráter ácido, básico ou neutro.',
          'NaCl, NaHCO₃, CaCO₃ e CaSO₄ aparecem em alimentos, construção e água.',
        ],
      },
      {
        id: 'oxidos',
        title: 'Óxidos',
        priority: 'media',
        bullets: [
          'Ácidos (CO₂, SO₂, SO₃, NO₂), básicos (CaO, Na₂O), anfóteros (ZnO, Al₂O₃) e neutros (CO, NO).',
          'Peróxidos têm o grupo O₂²⁻.',
          'Óxidos ácidos estão ligados à chuva ácida.',
        ],
      },
      {
        id: 'tipos-reacao',
        title: 'Tipos de reação e dupla troca',
        priority: 'alta',
        bullets: [
          'Síntese, decomposição, simples troca e dupla troca.',
          'Fila de reatividade prevê deslocamento de metais.',
          'Dupla troca ocorre com precipitado, gás ou eletrólito fraco.',
        ],
        tool: { label: 'Montar e balancear uma reação', route: LAB, process: 'reaction' },
      },
      {
        id: 'balanceamento',
        title: 'Balanceamento',
        priority: 'alta',
        bullets: [
          'Conservação de átomos e carga.',
          'Método por tentativa para reações simples.',
          'O laboratório balanceia automaticamente fórmulas livres.',
        ],
        tool: { label: 'Balancear no laboratório', route: LAB, process: 'reaction' },
      },
    ],
  },
  {
    id: 'calculos',
    number: 6,
    title: 'Cálculos químicos',
    priority: 'alta',
    intro: 'A base de quase toda a prova: mol, massa molar, proporções e unidades.',
    topics: [
      {
        id: 'mol-avogadro',
        title: 'Mol, massa molar e Avogadro',
        priority: 'alta',
        bullets: [
          '1 mol contém 6,02 × 10²³ entidades.',
          'Massa molar é a massa de 1 mol, em g/mol.',
          'n = m/M e n = N/6,02 × 10²³.',
        ],
        formulas: ['n = m / M', 'n = N / 6,02 × 10²³'],
        tool: { label: 'Calcular massas no laboratório', route: LAB, process: 'reaction' },
      },
      {
        id: 'leis-ponderais',
        title: 'Leis de Lavoisier e Proust',
        priority: 'alta',
        bullets: [
          'Lavoisier: conservação da massa em sistema fechado.',
          'Proust: proporções fixas em uma substância composta.',
          'Essas leis sustentam a estequiometria.',
        ],
      },
      {
        id: 'estequiometria',
        title: 'Estequiometria',
        priority: 'alta',
        bullets: [
          'Use a proporção dos coeficientes para converter mol, massa ou volume.',
          'Sempre passe para mol antes de comparar substâncias diferentes.',
          'Confira unidades e ordem de grandeza.',
        ],
        tool: { label: 'Estequiometria interativa', route: LAB, process: 'reaction' },
      },
      {
        id: 'limitante-rendimento',
        title: 'Limitante, excesso, rendimento e pureza',
        priority: 'alta',
        bullets: [
          'Divida os mols pelo coeficiente e compare.',
          'Rendimento = massa real / massa teórica × 100%.',
          'Pureza = massa da substância / massa da amostra × 100%.',
        ],
        formulas: ['rendimento = real / teórico × 100%', 'pureza = massa pura / massa total × 100%'],
        tool: { label: 'Calcular limitante e rendimento', route: LAB, process: 'reaction' },
      },
      {
        id: 'formulas-percentual',
        title: 'Fórmula mínima, molecular e composição centesimal',
        priority: 'media',
        bullets: [
          'Composição centesimal vem da massa de cada elemento.',
          'Fórmula mínima usa a menor proporção inteira.',
          'Fórmula molecular é um múltiplo da mínima.',
        ],
      },
    ],
  },
  {
    id: 'gases',
    number: 7,
    title: 'Gases',
    priority: 'media',
    intro: 'O ENEM combina gráficos, unidades e contexto (mergulho, pneus, atmosfera).',
    topics: [
      {
        id: 'variaveis-estado',
        title: 'Variáveis de estado e transformações',
        priority: 'alta',
        bullets: [
          'P, V, T e n descrevem o gás.',
          'Isotérmica: T constante; isobárica: P constante; isocórica: V constante.',
          'Use a lei combinada quando n é constante.',
        ],
        formulas: ['P₁V₁/T₁ = P₂V₂/T₂'],
        tool: { label: 'Calcular gases ideais', route: LAB, process: 'gas' },
      },
      {
        id: 'clapeyron',
        title: 'Equação de Clapeyron e volume molar',
        priority: 'alta',
        bullets: [
          'PV = nRT, com R = 0,082 atm·L/(mol·K).',
          'Nas CNTP, 1 mol de gás ideal ocupa 22,4 L.',
          'Converta T para kelvin e confira as unidades.',
        ],
        formulas: ['PV = nRT', 'R = 0,082 atm·L·mol⁻¹·K⁻¹'],
        tool: { label: 'Calcular P, V, n ou T', route: LAB, process: 'gas' },
      },
      {
        id: 'misturas-gases',
        title: 'Misturas gasosas e lei de Dalton',
        priority: 'media',
        bullets: [
          'Pressão total é a soma das pressões parciais.',
          'Pressão parcial = fração em mol × pressão total.',
          'O volume parcial também pode ser usado em misturas ideais.',
        ],
        formulas: ['P_total = ΣP_i', 'P_i = x_i · P_total'],
        tool: { label: 'Calcular gases ideais', route: LAB, process: 'gas' },
      },
      {
        id: 'graham-densidade',
        title: 'Graham, densidade e gráficos',
        priority: 'media',
        bullets: [
          'Efusão/difusão: gás mais leve se espalha mais rápido.',
          'Densidade do gás aumenta com massa molar e pressão.',
          'Leia gráficos P×V, V×T e P×T identificando a transformação.',
        ],
        formulas: ['v₁/v₂ = √(M₂/M₁)', 'd = PM/RT'],
      },
    ],
  },
  {
    id: 'solucoes',
    number: 8,
    title: 'Soluções',
    priority: 'alta',
    intro: 'Concentração, diluição, curva de solubilidade e titulação são cobrados quase todo ano.',
    topics: [
      {
        id: 'dispersoes',
        title: 'Soluções, coloides e suspensões',
        priority: 'media',
        bullets: [
          'Solução: partículas dispersas muito pequenas e mistura homogênea.',
          'Coloide: efeito Tyndall; suspensão: partículas maiores.',
          'Soluto e solvente; a água é o solvente mais comum.',
        ],
      },
      {
        id: 'concentracao',
        title: 'Concentração e unidades',
        priority: 'alta',
        bullets: [
          'g/L, mol/L, título, porcentagem, ppm e ppb.',
          'Em solução aquosa diluída, 1 ppm ≈ 1 mg/L.',
          'Cuidado com volume da solução e volume de solvente.',
        ],
        formulas: ['C = m/V', 'M = n/V', 'C = M · MM', '1 ppm ≈ 1 mg/L'],
        tool: { label: 'Calcular concentração', route: LAB, process: 'solution' },
      },
      {
        id: 'diluicao-mistura',
        title: 'Diluição e mistura',
        priority: 'alta',
        bullets: [
          'Na diluição, a quantidade de soluto não muda.',
          'Misturas sem reação somam massas/mol e volumes.',
          'Se houver reação, calcule o limitante antes da concentração final.',
        ],
        formulas: ['C₁V₁ = C₂V₂', 'M₁V₁ = M₂V₂'],
        tool: { label: 'Calcular diluição', route: LAB, process: 'solution' },
      },
      {
        id: 'solubilidade',
        title: 'Curvas de solubilidade',
        priority: 'media',
        bullets: [
          'Solubilidade depende de temperatura e solvente.',
          'Resfriamento pode cristalizar parte do soluto.',
          'Saturação: limite de soluto dissolvido em determinada temperatura.',
        ],
      },
      {
        id: 'coligativas',
        title: 'Propriedades coligativas',
        priority: 'media',
        bullets: [
          'Tonoscopia, ebulioscopia, crioscopia e osmose.',
          'Dependem do número de partículas, não da identidade.',
          'Eletrólitos se dissociam e aumentam o efeito; osmose reversa dessaliniza água.',
        ],
      },
      {
        id: 'titulacao',
        title: 'Volumetria e titulação',
        priority: 'alta',
        bullets: [
          'No ponto de equivalência, o ácido e a base reagiram na proporção estequiométrica.',
          'Ácido forte + base forte: pH ≈ 7; ácido fraco + base forte: pH > 7.',
          'Escolha o indicador pela faixa de viragem.',
        ],
        formulas: ['n_ácido = n_base quando a proporção é 1:1'],
        tool: { label: 'Abrir titulação interativa', route: '/visualizacoes/titulacao-acido-base' },
      },
    ],
  },
  {
    id: 'termoquimica',
    number: 9,
    title: 'Termoquímica',
    priority: 'alta',
    intro: 'Sinal de ΔH, Hess, energia de ligação e calorimetria aparecem em contextos de combustíveis e alimentos.',
    topics: [
      {
        id: 'exo-endo',
        title: 'Reações exotérmicas e endotérmicas',
        priority: 'alta',
        bullets: [
          'Exotérmica: ΔH < 0, libera calor; endotérmica: ΔH > 0, absorve.',
          'Diagramas de entalpia mostram reagentes e produtos.',
          'Catalisador não altera ΔH.',
        ],
        formulas: ['ΔH = H_produtos − H_reagentes'],
        tool: { label: 'Ver combustão do metano', route: '/visualizacoes/combustao-metano' },
      },
      {
        id: 'formacao-combustao',
        title: 'Entalpia de formação e combustão',
        priority: 'alta',
        bullets: [
          'Entalpia de formação é a variação ao formar 1 mol da substância a partir dos elementos.',
          'Entalpia de combustão depende do estado da água.',
          'Use valores tabelados e multiplique pelos coeficientes.',
        ],
        formulas: ['ΔH = ΣΔH_f(produtos) − ΣΔH_f(reagentes)'],
      },
      {
        id: 'hess',
        title: 'Lei de Hess',
        priority: 'alta',
        bullets: [
          'ΔH total depende apenas dos estados inicial e final.',
          'Inverta a equação e troque o sinal de ΔH.',
          'Multiplique a equação e multiplique o ΔH pelo mesmo fator.',
        ],
      },
      {
        id: 'energia-ligacao',
        title: 'Energia de ligação',
        priority: 'alta',
        bullets: [
          'ΔH = energia gasta para romper − energia liberada ao formar.',
          'Use apenas ligações realmente rompidas e formadas.',
          'Não confunda energia de ligação com entalpia de formação.',
        ],
        formulas: ['ΔH = ΣE_rompidas − ΣE_formadas'],
      },
      {
        id: 'calorimetria',
        title: 'Calorimetria e combustíveis',
        priority: 'alta',
        bullets: [
          'Q = m·c·ΔT; em água, c ≈ 4,18 J/(g·°C).',
          'Compare combustíveis por massa, mol e CO₂ emitido.',
          'Poder calorífico é energia liberada por unidade de massa ou volume.',
        ],
        formulas: ['Q = m · c · ΔT'],
        tool: { label: 'Calcular calorimetria', route: LAB, process: 'calorimetry' },
      },
      {
        id: 'entropia-gibbs',
        title: 'Entropia e energia livre',
        priority: 'baixa',
        bullets: [
          'Entropia mede dispersão; processos espontâneos aumentam a entropia do universo.',
          'ΔG = ΔH − TΔS; ΔG < 0 indica espontaneidade.',
          'No ENEM geralmente aparece de forma conceitual.',
        ],
        formulas: ['ΔG = ΔH − TΔS'],
      },
    ],
  },
  {
    id: 'cinetica',
    number: 10,
    title: 'Cinética química',
    priority: 'media',
    intro: 'Gráficos, teoria das colisões e fatores que alteram a velocidade.',
    topics: [
      {
        id: 'velocidade',
        title: 'Velocidade média e gráficos',
        priority: 'alta',
        bullets: [
          'Velocidade pode ser medida pelo consumo de reagente ou formação de produto.',
          'A inclinação da curva concentração × tempo indica a velocidade.',
          'Unidades e intervalo de tempo precisam ser coerentes.',
        ],
      },
      {
        id: 'colisoes-ea',
        title: 'Teoria das colisões e energia de ativação',
        priority: 'alta',
        bullets: [
          'Colisão efetiva precisa de energia e orientação adequadas.',
          'Complexo ativado é o estado de maior energia no caminho.',
          'Ea é a barreira energética; quanto menor, mais rápida a reação.',
        ],
      },
      {
        id: 'fatores-velocidade',
        title: 'Fatores que alteram a velocidade',
        priority: 'alta',
        bullets: [
          'Temperatura, concentração, pressão, superfície de contato.',
          'Catalisador e inibidor.',
          'Aumentar temperatura aumenta a fração de colisões com energia suficiente.',
        ],
      },
      {
        id: 'catalisador',
        title: 'Catalisador',
        priority: 'alta',
        bullets: [
          'Reduz Ea e acelera os dois sentidos.',
          'Não altera ΔH, K, composição final ou rendimento de equilíbrio.',
          'Catálise enzimática é seletiva e depende de pH e temperatura.',
        ],
      },
      {
        id: 'lei-velocidade',
        title: 'Lei da velocidade e ordem',
        priority: 'media',
        bullets: [
          'v = k[A]ᵃ[B]ᵇ; os expoentes vêm do experimento, não dos coeficientes.',
          'A etapa lenta do mecanismo costuma determinar a lei.',
          'Ordem zero, primeira e segunda mudam a forma do gráfico.',
        ],
        formulas: ['v = k[A]ᵃ[B]ᵇ'],
      },
      {
        id: 'alimentos',
        title: 'Cinética no cotidiano',
        priority: 'media',
        bullets: [
          'Geladeira reduz temperatura e conserva alimentos.',
          'Superfície de contato explica por que alimentos cortados estragam mais rápido.',
          'Conservantes e embalagens reduzem oxidação e ação microbiana.',
        ],
      },
    ],
  },
  {
    id: 'equilibrio',
    number: 11,
    title: 'Equilíbrio químico',
    priority: 'alta',
    intro: 'K, Q, Le Chatelier, pH, tampões e Kps são recorrentes.',
    topics: [
      {
        id: 'equilibrio-dinamico',
        title: 'Equilíbrio dinâmico',
        priority: 'alta',
        bullets: [
          'Reação reversível atinge equilíbrio quando as velocidades se igualam.',
          'Concentrações ficam constantes, mas as transformações continuam.',
          'K grande favorece produtos; K pequeno favorece reagentes.',
        ],
        tool: { label: 'Simular N₂O₄ ⇌ 2NO₂', route: '/visualizacoes/equilibrio-n2o4' },
      },
      {
        id: 'kc-kp-q',
        title: 'Kc, Kp e quociente Q',
        priority: 'alta',
        bullets: [
          'Sólidos e líquidos puros não entram na expressão de K.',
          'Q tem a mesma forma de K, mas com concentrações fora do equilíbrio.',
          'Q < K desloca para produtos; Q > K desloca para reagentes.',
        ],
        formulas: ['Kc = [produtos]ᵇ/[reagentes]ᵃ', 'Kp = Kc(RT)^Δn'],
        tool: { label: 'Simular equilíbrio e Q × K', route: '/visualizacoes/equilibrio-n2o4' },
      },
      {
        id: 'le-chatelier',
        title: 'Princípio de Le Chatelier',
        priority: 'alta',
        bullets: [
          'Concentração, pressão e temperatura deslocam o equilíbrio.',
          'Catalisador não desloca; apenas acelera a chegada ao equilíbrio.',
          'Aumento de temperatura favorece o sentido endotérmico.',
        ],
        tool: { label: 'Perturbar o equilíbrio', route: '/visualizacoes/equilibrio-n2o4' },
      },
      {
        id: 'ka-kb-ostwald',
        title: 'Ka, Kb e diluição de Ostwald',
        priority: 'alta',
        bullets: [
          'Ka e Kb medem a força de ácidos e bases fracos.',
          'Quanto maior K, maior a ionização.',
          'Diluir aumenta o grau de ionização, mas diminui [H⁺] na maioria dos casos.',
        ],
        formulas: ['Ka = [H⁺][A⁻]/[HA]', 'Kb = [BH⁺][OH⁻]/[B]'],
        tool: { label: 'Calcular pH e ionização', route: LAB, process: 'ph' },
      },
      {
        id: 'ph-poh',
        title: 'Kw, pH e pOH',
        priority: 'alta',
        bullets: [
          'A 25 °C, Kw = 1,0 × 10⁻¹⁴ e pH + pOH = 14.',
          'pH < 7 ácido, pH = 7 neutro, pH > 7 básico (a 25 °C).',
          'Sangue, chuva ácida, solo e oceanos aparecem como contexto.',
        ],
        formulas: ['pH = −log[H⁺]', 'pH + pOH = 14', 'Kw = 10⁻¹⁴'],
        tool: { label: 'Calcular pH no laboratório', route: LAB, process: 'ph' },
      },
      {
        id: 'tampao-hidrolise',
        title: 'Tampões e hidrólise salina',
        priority: 'alta',
        bullets: [
          'Tampão resiste a variações de pH por conter ácido/base conjugado.',
          'Sangue e oceanos são exemplos de sistemas tamponados.',
          'Hidrólise de sal pode deixar a solução ácida, básica ou neutra.',
        ],
      },
      {
        id: 'kps',
        title: 'Produto de solubilidade e precipitação',
        priority: 'media',
        bullets: [
          'Kps descreve o equilíbrio de um sal pouco solúvel.',
          'Qps > Kps indica precipitação.',
          'Efeito do íon comum diminui a solubilidade.',
        ],
        formulas: ['Kps = [A⁺]ᵃ[B⁻]ᵇ'],
      },
      {
        id: 'equilibrio-cotidiano',
        title: 'Equilíbrio no cotidiano',
        priority: 'media',
        bullets: [
          'CO₂ dissolvido em refrigerantes.',
          'Formação de cavernas e estalactites por carbonatos.',
          'Acidificação dos oceanos e corais.',
        ],
      },
    ],
  },
  {
    id: 'eletroquimica',
    number: 12,
    title: 'Eletroquímica',
    priority: 'alta',
    intro: 'NOX, pilhas, eletrólise, Faraday e corrosão são muito cobrados.',
    topics: [
      {
        id: 'nox-redox',
        title: 'NOX, oxidação e redução',
        priority: 'alta',
        bullets: [
          'Oxidação perde elétrons e aumenta NOX; redução ganha e diminui.',
          'Agente oxidante sofre redução; agente redutor sofre oxidação.',
          'Regras de NOX: elemento simples 0; oxigênio geralmente −2; hidrogênio +1.',
        ],
      },
      {
        id: 'balanceamento-redox',
        title: 'Balanceamento redox',
        priority: 'alta',
        bullets: [
          'Separe em semirreações e iguale elétrons.',
          'Balanceie átomos e carga antes de somar.',
          'Confira NOX e conservação final.',
        ],
      },
      {
        id: 'pilhas',
        title: 'Pilhas e potencial padrão',
        priority: 'alta',
        bullets: [
          'Ânodo oxida, cátodo reduz; elétrons fluem do ânodo para o cátodo.',
          'Ponte salina mantém a neutralidade.',
          'ΔE positivo indica espontaneidade.',
        ],
        formulas: ['ΔE = E°cátodo − E°ânodo'],
      },
      {
        id: 'eletrolise',
        title: 'Eletrólise ígnea e aquosa',
        priority: 'alta',
        bullets: [
          'Eletrólise é não espontânea e consome energia.',
          'Ordem de descarga depende de potencial, concentração e eletrodos.',
          'Aplicações: cloro-soda, alumínio, galvanoplastia e refino de cobre.',
        ],
      },
      {
        id: 'faraday',
        title: 'Leis de Faraday',
        priority: 'alta',
        bullets: [
          'Q = i·t; 1 mol de elétrons corresponde a 96 500 C.',
          'Massa depositada é proporcional à carga e à massa molar.',
          'Cuidado com o número de elétrons da semirreação.',
        ],
        formulas: ['Q = i · t', '1 mol e⁻ = 96 500 C', 'm = (M · Q)/(n · F)'],
      },
      {
        id: 'corrosao',
        title: 'Corrosão e proteção',
        priority: 'alta',
        bullets: [
          'Ferrugem é oxidação do ferro na presença de água e oxigênio.',
          'Metal de sacrifício tem maior potencial de oxidação.',
          'Galvanização, pintura e proteção catódica.',
        ],
      },
      {
        id: 'baterias',
        title: 'Baterias, célula a combustível e descarte',
        priority: 'media',
        bullets: [
          'Pilhas seca, alcalina, íon-lítio e chumbo-ácido.',
          'Célula a combustível usa H₂ e O₂, gerando água.',
          'Metais pesados exigem logística reversa e descarte correto.',
        ],
      },
    ],
  },
  {
    id: 'radioatividade',
    number: 13,
    title: 'Radioatividade',
    priority: 'alta',
    intro: 'Leis de decaimento, meia-vida, fissão/fusão e aplicações.',
    topics: [
      {
        id: 'radiacoes',
        title: 'Radiações alfa, beta e gama',
        priority: 'alta',
        bullets: [
          'Alfa: núcleo de hélio, baixo poder de penetração.',
          'Beta: elétron/posítron, penetração intermediária.',
          'Gama: onda eletromagnética, alta penetração; blindagem com chumbo/concreto.',
        ],
      },
      {
        id: 'soddy-fajans',
        title: 'Leis de Soddy-Fajans',
        priority: 'alta',
        bullets: [
          'Alfa: Z diminui 2 e A diminui 4.',
          'Beta negativa: Z aumenta 1; A não muda.',
          'Balanceie Z e A nas equações nucleares.',
        ],
      },
      {
        id: 'meia-vida',
        title: 'Meia-vida',
        priority: 'alta',
        bullets: [
          'Após uma meia-vida, resta metade da massa.',
          'x = tempo total / meia-vida.',
          'Datação por carbono-14 usa esse princípio.',
        ],
        formulas: ['N = N₀ / 2ˣ', 'x = t / t₁/₂'],
        tool: { label: 'Calcular meia-vida', route: LAB, process: 'half-life' },
      },
      {
        id: 'fissao-fusao',
        title: 'Fissão e fusão nuclear',
        priority: 'alta',
        bullets: [
          'Fissão: núcleo pesado se divide; usada em usinas.',
          'Fusão: núcleos leves se unem; ocorre no Sol.',
          'Compare energia, resíduos e riscos.',
        ],
      },
      {
        id: 'aplicacoes-riscos',
        title: 'Aplicações, riscos e rejeitos',
        priority: 'alta',
        bullets: [
          'Medicina nuclear, radioterapia, esterilização e datação.',
          'Chernobyl, Fukushima e césio-137 em Goiânia.',
          'Angra 1 e 2; lixo radioativo e destino de rejeitos.',
        ],
      },
    ],
  },
  {
    id: 'organica',
    number: 14,
    title: 'Química orgânica',
    priority: 'alta',
    intro: 'Reconhecer funções e isomeria rende mais do que decorar nomenclatura complexa.',
    topics: [
      {
        id: 'carbono-ligacoes',
        title: 'Carbono, tetravalência e hibridização',
        priority: 'alta',
        bullets: [
          'Carbono forma quatro ligações; pode formar cadeias e anéis.',
          'Ligações sigma e pi; sp³, sp² e sp.',
          'Classificação de carbonos e cadeias.',
        ],
      },
      {
        id: 'hidrocarbonetos',
        title: 'Hidrocarbonetos',
        priority: 'alta',
        bullets: [
          'Alcanos, alcenos, alcinos, alcadienos, cicloalcanos e aromáticos.',
          'Saturados têm apenas ligações simples; insaturados têm duplas/triplas.',
          'Benzeno é o aromático mais cobrado.',
        ],
      },
      {
        id: 'funcoes-organicas',
        title: 'Funções orgânicas',
        priority: 'alta',
        bullets: [
          'Álcool, fenol, éter, aldeído, cetona, ácido carboxílico, éster, amina, amida, haleto, nitrila, tiol.',
          'Reconheça o grupo funcional e um exemplo do cotidiano.',
          'Não decore nomes complexos sem entender a função.',
        ],
      },
      {
        id: 'nomenclatura',
        title: 'Nomenclatura IUPAC',
        priority: 'alta',
        bullets: [
          'Cadeia principal, numeração e ramificações.',
          'Priorize o grupo funcional na numeração.',
          'O ENEM costuma cobrar reconhecimento, não nomes enormes.',
        ],
      },
      {
        id: 'isomeria',
        title: 'Isomeria',
        priority: 'alta',
        bullets: [
          'Plana: cadeia, posição, função, compensação/metameria e tautomeria.',
          'Geométrica: cis-trans em duplas ou anéis.',
          'Óptica: carbono quiral, enantiômeros, mistura racêmica e luz polarizada.',
        ],
      },
      {
        id: 'propriedades-organicas',
        title: 'Propriedades físicas e acidez/basicidade',
        priority: 'alta',
        bullets: [
          'Cadeia maior e mais ramificada alteram PF/PE.',
          'Polaridade e ligação de H alteram solubilidade.',
          'Ácidos carboxílicos e fenóis são ácidos; aminas são básicas.',
        ],
      },
      {
        id: 'reacoes-organicas',
        title: 'Reações orgânicas',
        priority: 'alta',
        bullets: [
          'Substituição, adição, eliminação e oxidação.',
          'Markovnikov na adição a alcenos.',
          'Esterificação, hidrólise, saponificação e fermentação.',
        ],
      },
      {
        id: 'polimeros',
        title: 'Polímeros',
        priority: 'alta',
        bullets: [
          'Adição: PE, PVC, PP, teflon e PS.',
          'Condensação: náilon, PET e poliuretanos.',
          'Borracha, vulcanização, reciclagem e microplásticos.',
        ],
      },
      {
        id: 'biomoleculas',
        title: 'Biomoléculas',
        priority: 'alta',
        bullets: [
          'Carboidratos, lipídios, proteínas e ácidos nucleicos.',
          'Ligação glicosídica, peptídica e éster.',
          'Gorduras saturadas/insaturadas e desnaturação proteica.',
        ],
      },
      {
        id: 'petroleo-combustiveis',
        title: 'Petróleo e combustíveis',
        priority: 'alta',
        bullets: [
          'Destilação fracionada, craqueamento e octanagem.',
          'Gasolina, diesel, querosene, GLP e gás natural.',
          'Etanol e biodiesel: comparação energética e emissões.',
        ],
      },
      {
        id: 'saboes',
        title: 'Sabões e detergentes',
        priority: 'alta',
        bullets: [
          'Estrutura anfifílica e formação de micelas.',
          'A parte apolar interage com gordura; a polar, com água.',
          'Detergentes não biodegradáveis causam espuma e poluição.',
        ],
      },
    ],
  },
  {
    id: 'ambiental',
    number: 15,
    title: 'Ambiental, cotidiano e indústria',
    priority: 'alta',
    intro: 'O bloco mais contextualizado: aplique conceitos anteriores a cenários reais.',
    topics: [
      {
        id: 'efeito-estufa',
        title: 'Efeito estufa e ciclo do carbono',
        priority: 'alta',
        bullets: [
          'CO₂, CH₄ e N₂O absorvem infravermelho.',
          'Queima de combustíveis e desmatamento aumentam CO₂.',
          'Créditos de carbono e mitigação.',
        ],
      },
      {
        id: 'chuva-acida',
        title: 'Chuva ácida',
        priority: 'alta',
        bullets: [
          'SO₂ e NOₓ formam ácidos na atmosfera.',
          'Corrói calcário, metais e afeta solos e lagos.',
          'Relacione com combustíveis fósseis e transporte.',
        ],
      },
      {
        id: 'ozonio-cfc',
        title: 'Camada de ozônio e CFCs',
        priority: 'alta',
        bullets: [
          'CFCs liberam cloro que destrói ozônio na estratosfera.',
          'Protocolo de Montreal.',
          'Não confunda ozônio estratosférico com ozônio troposférico.',
        ],
      },
      {
        id: 'agua-poluicao',
        title: 'Poluição e tratamento da água',
        priority: 'alta',
        bullets: [
          'Eutrofização, OD e DBO.',
          'Metais pesados e bioacumulação.',
          'Floculação, decantação, filtração, cloração; esgoto e dessalinização.',
        ],
      },
      {
        id: 'residuos',
        title: 'Resíduos sólidos',
        priority: 'alta',
        bullets: [
          'Aterro sanitário, chorume, compostagem e incineração.',
          'Reciclagem de metais e lixo eletrônico.',
          'Microplásticos e plásticos biodegradáveis.',
        ],
      },
      {
        id: 'energia',
        title: 'Fontes de energia',
        priority: 'alta',
        bullets: [
          'Fósseis, nuclear, hidrelétrica, solar, eólica, biomassa e hidrogênio.',
          'Compare emissões, área, intermitência e resíduos.',
          'Química verde e desenvolvimento sustentável.',
        ],
      },
      {
        id: 'processos-industriais',
        title: 'Processos industriais',
        priority: 'alta',
        bullets: [
          'Haber-Bosch, Ostwald, contato, Solvay, cloro-soda e Hall-Héroult.',
          'Alto-forno, cimento, vidro, papel e etanol.',
          'Identifique reagentes, produtos e impacto ambiental.',
        ],
      },
      {
        id: 'fertilizantes-solo',
        title: 'Fertilizantes, solo e alimentos',
        priority: 'media',
        bullets: [
          'NPK, calagem e pH do solo.',
          'Conservantes, antioxidantes, rancificação e fermentação.',
          'Agrotóxicos e resíduos.',
        ],
      },
      {
        id: 'cosmeticos-farmacos',
        title: 'Cosméticos e fármacos',
        priority: 'baixa',
        bullets: [
          'Princípios ativos e pH de produtos.',
          'Isomeria em medicamentos.',
          'Descarte e exposição ambiental.',
        ],
      },
    ],
  },
];

export interface FormulaGroup {
  title: string;
  items: string[];
}

export const ESSENTIAL_FORMULAS: FormulaGroup[] = [
  {
    title: 'Quantidade de matéria',
    items: ['n = m / M', 'n = N / 6,02 × 10²³', 'n = V / V_molar'],
  },
  {
    title: 'Gases',
    items: ['PV = nRT', 'R = 0,082 atm·L·mol⁻¹·K⁻¹', 'P₁V₁/T₁ = P₂V₂/T₂'],
  },
  {
    title: 'Soluções',
    items: [
      'C = m₁/V',
      'M = n/V',
      'C = M × MM',
      'C₁V₁ = C₂V₂',
      'τ = m₁/m_total',
      '1 ppm ≈ 1 mg/L',
    ],
  },
  {
    title: 'Termoquímica',
    items: [
      'Q = m·c·ΔT',
      'ΔH = H_produtos − H_reagentes',
      'ΔH = ΣE_rompidas − ΣE_formadas',
      'ΔG = ΔH − TΔS',
    ],
  },
  {
    title: 'Equilíbrio',
    items: ['Kc = [produtos]ᵇ/[reagentes]ᵃ', 'pH = −log[H⁺]', 'pH + pOH = 14', 'Kw = 10⁻¹⁴'],
  },
  {
    title: 'Eletroquímica',
    items: ['ΔE = E°cátodo − E°ânodo', 'Q = i·t', '1 mol e⁻ = 96 500 C'],
  },
  {
    title: 'Radioatividade',
    items: ['N = N₀ / 2ˣ', 'x = tempo / meia-vida'],
  },
];

export const STUDY_METHOD = [
  'Domine primeiro mol, estequiometria, soluções e ligações; quase todo o resto depende disso.',
  'Estude por tema e faça questões do ENEM logo em seguida.',
  'Mantenha um caderno de erros: conceito, armadilha e conta.',
  'Treine leitura de gráficos e unidades; muitos erros são de interpretação.',
  'Reconheça funções orgânicas antes de decorar nomenclatura extensa.',
];
