export type MathPriority = 'alta' | 'media' | 'baixa';

export interface MathTool {
  label: string;
  route: string;
  process?: 'finance' | 'proportion' | 'geometry' | 'statistics' | 'probability' | 'function';
}

export interface MathTopic {
  id: string;
  title: string;
  priority: MathPriority;
  bullets: string[];
  formulas?: string[];
  tool?: MathTool;
}

export interface MathBlock {
  id: string;
  number: number;
  title: string;
  priority: MathPriority;
  intro: string;
  topics: MathTopic[];
}

const LAB = '/matematica/laboratorio';

export const MATHEMATICS_GUIDE: MathBlock[] = [
  {
    id: 'numeros-operacoes',
    number: 1,
    title: 'Números, operações e conjuntos',
    priority: 'alta',
    intro: 'A base para tudo: frações, decimais, potências, radicais e ordem de grandeza.',
    topics: [
      {
        id: 'conjuntos-numericos',
        title: 'Conjuntos numéricos e reta',
        priority: 'alta',
        bullets: [
          'Naturais, inteiros, racionais, irracionais e reais; inclusão entre conjuntos.',
          'Reta numérica, comparação, ordenação, módulo e distância.',
          'Fração, decimal e porcentagem são representações da mesma ideia.',
        ],
      },
      {
        id: 'fracoes-decimais',
        title: 'Frações, decimais e operações',
        priority: 'alta',
        bullets: [
          'Frações equivalentes, simplificação e comparação.',
          'Regras de sinais e prioridade das operações.',
          'Dividir por uma fração equivale a multiplicar pelo inverso.',
        ],
      },
      {
        id: 'divisibilidade',
        title: 'Divisibilidade, MDC e MMC',
        priority: 'media',
        bullets: [
          'Critérios básicos, números primos e fatoração em primos.',
          'MDC e MMC em problemas de repartição e periodicidade.',
          'Múltiplos, divisores, paridade e resto.',
        ],
      },
      {
        id: 'potencias-raizes',
        title: 'Potências, raízes e notação científica',
        priority: 'alta',
        bullets: [
          'Propriedades de potências com expoentes inteiros e racionais.',
          'Radiciação e relação entre potências e raízes.',
          'Notação científica, ordem de grandeza, arredondamento e estimativa.',
        ],
        formulas: ['aᵐ · aⁿ = aᵐ⁺ⁿ', '(aᵐ)ⁿ = aᵐⁿ', 'a⁻ⁿ = 1/aⁿ'],
      },
    ],
  },
  {
    id: 'proporcao',
    number: 2,
    title: 'Razão, proporção e regra de três',
    priority: 'alta',
    intro: 'Classifique a relação antes de montar a conta: direta e inversa não se resolvem do mesmo jeito.',
    topics: [
      {
        id: 'razao-proporcao',
        title: 'Razão e proporção',
        priority: 'alta',
        bullets: [
          'Razão entre grandezas e proporções equivalentes.',
          'Em proporção, o produto dos meios é igual ao produto dos extremos.',
          'Divisão proporcional e repartição de quantidades.',
        ],
        formulas: ['a/b = c/d ⇒ ad = bc'],
        tool: { label: 'Resolver regra de três', route: LAB, process: 'proportion' },
      },
      {
        id: 'direta-inversa',
        title: 'Proporcionalidade direta e inversa',
        priority: 'alta',
        bullets: [
          'Direta: y = kx; inversa: y = k/x.',
          'Regra de três simples e composta.',
          'Verifique quais grandezas aumentam ou diminuem juntas.',
        ],
        formulas: ['y = kx', 'y = k/x'],
        tool: { label: 'Calcular proporção', route: LAB, process: 'proportion' },
      },
      {
        id: 'taxas-escala',
        title: 'Taxas unitárias e escala',
        priority: 'alta',
        bullets: [
          'Preço por unidade, km/L, litros por minuto, habitantes por km².',
          'Densidade demográfica, produtividade e consumo médio.',
          'Escala é razão entre medida representada e real, com unidades compatíveis.',
        ],
      },
    ],
  },
  {
    id: 'porcentagem-financeira',
    number: 3,
    title: 'Porcentagem e matemática financeira',
    priority: 'alta',
    intro: 'Aumentos sucessivos, pontos percentuais e juros aparecem em quase toda prova.',
    topics: [
      {
        id: 'porcentagem',
        title: 'Porcentagem e variação percentual',
        priority: 'alta',
        bullets: [
          'Porcentagem é fração de denominador 100.',
          'Variação relativa = (final − inicial)/inicial × 100%.',
          'Não confunda ponto percentual com variação percentual.',
        ],
        formulas: ['p% de V = (p/100)V', 'variação = (final − inicial)/inicial × 100%'],
        tool: { label: 'Calcular porcentagem', route: LAB, process: 'finance' },
      },
      {
        id: 'sucessivos',
        title: 'Aumentos e descontos sucessivos',
        priority: 'alta',
        bullets: [
          'Cada percentual incide sobre a base atualizada.',
          'Aumento de 20% e desconto de 20% não voltam ao valor original.',
          'Preço final = valor inicial × produto dos fatores.',
        ],
        formulas: ['V(1 + p/100)', 'V(1 − p/100)'],
        tool: { label: 'Calcular variações sucessivas', route: LAB, process: 'finance' },
      },
      {
        id: 'juros-simples',
        title: 'Juros simples',
        priority: 'alta',
        bullets: [
          'Juros incidem sempre sobre o capital inicial.',
          'Taxa e tempo devem estar na mesma unidade.',
          'Montante = capital + juros.',
        ],
        formulas: ['J = C · i · t', 'M = C(1 + i·t)'],
        tool: { label: 'Calcular juros', route: LAB, process: 'finance' },
      },
      {
        id: 'juros-compostos',
        title: 'Juros compostos',
        priority: 'alta',
        bullets: [
          'Juros de cada período compõem a base do período seguinte.',
          'Crescimento exponencial, não linear.',
          'Compare propostas somando entrada, parcelas e taxas.',
        ],
        formulas: ['M = C(1 + i)^t', 'J = M − C'],
        tool: { label: 'Calcular juros compostos', route: LAB, process: 'finance' },
      },
      {
        id: 'comparacao-pagamentos',
        title: 'Comparação de pagamentos',
        priority: 'media',
        bullets: [
          'Some entrada e todas as parcelas antes de comparar.',
          'Observe taxas, impostos e custo efetivo total.',
          'Valor da parcela isolado não é critério suficiente.',
        ],
      },
    ],
  },
  {
    id: 'algebra',
    number: 4,
    title: 'Álgebra, equações e sistemas',
    priority: 'media',
    intro: 'Traduza o enunciado, respeite restrições e confira a solução no contexto.',
    topics: [
      {
        id: 'expressoes',
        title: 'Expressões, produtos notáveis e fatoração',
        priority: 'alta',
        bullets: [
          'Variáveis, coeficientes, termos semelhantes e distributiva.',
          'Produtos notáveis e fatoração.',
          'Frações algébricas e restrições de denominador.',
        ],
        formulas: ['(a+b)² = a²+2ab+b²', '(a−b)² = a²−2ab+b²', '(a+b)(a−b) = a²−b²'],
      },
      {
        id: 'equacoes-1grau',
        title: 'Equações do primeiro grau',
        priority: 'alta',
        bullets: [
          'Isolamento de variável e uso de parênteses.',
          'Tradução de “dobro”, “diferença”, “ao menos” e “no máximo”.',
          'Inequações invertem o sinal ao multiplicar/dividir por negativo.',
        ],
      },
      {
        id: 'sistemas',
        title: 'Sistemas lineares',
        priority: 'media',
        bullets: [
          'Substituição, adição e interpretação gráfica.',
          'A solução deve satisfazer todas as equações.',
          'Sistemas podem não ter solução ou ter infinitas.',
        ],
      },
      {
        id: 'quadratica',
        title: 'Equação do segundo grau',
        priority: 'media',
        bullets: [
          'Discriminante e número de raízes reais.',
          'Fórmula resolutiva e fatoração.',
          'Confira se as raízes fazem sentido no contexto.',
        ],
        formulas: ['Δ = b² − 4ac', 'x = (−b ± √Δ)/(2a)'],
      },
    ],
  },
  {
    id: 'funcoes',
    number: 5,
    title: 'Funções, gráficos e modelagem',
    priority: 'alta',
    intro: 'O ENEM pede interpretar relações, não apenas calcular imagens.',
    topics: [
      {
        id: 'conceito-funcao',
        title: 'Conceito e leitura de gráficos',
        priority: 'alta',
        bullets: [
          'Variável independente, dependente, domínio e imagem.',
          'Eixos, escalas, unidades, crescimento, decrescimento e interceptos.',
          'Raiz é x com f(x)=0; intercepto é o valor inicial.',
        ],
        tool: { label: 'Plotar funções', route: LAB, process: 'function' },
      },
      {
        id: 'funcao-afim',
        title: 'Função afim',
        priority: 'alta',
        bullets: [
          'f(x) = ax + b; a é a taxa de variação e b é o valor inicial.',
          'Gráfico reto; a > 0 cresce, a < 0 decresce.',
          'Tarifas com parcela fixa + custo por unidade.',
        ],
        formulas: ['f(x) = ax + b'],
        tool: { label: 'Plotar função afim', route: LAB, process: 'function' },
      },
      {
        id: 'funcao-quadratica',
        title: 'Função quadrática',
        priority: 'alta',
        bullets: [
          'Parábola; a define concavidade.',
          'Raízes, vértice e máximo/mínimo.',
          'Aplicações em área, lucro e lançamento.',
        ],
        formulas: ['f(x) = ax² + bx + c', 'x_v = −b/(2a)', 'y_v = −Δ/(4a)'],
        tool: { label: 'Plotar parábola', route: LAB, process: 'function' },
      },
      {
        id: 'exponencial-log',
        title: 'Exponencial e logaritmo',
        priority: 'alta',
        bullets: [
          'Crescimento/decaimento multiplicativo.',
          'Logaritmo como inversa da exponencial.',
          'Escalas logarítmicas e juros compostos.',
        ],
        formulas: ['f(x) = a·b^x', 'log_b(x) = y ⇔ b^y = x'],
      },
      {
        id: 'funcoes-trechos',
        title: 'Funções por trechos e interseções',
        priority: 'media',
        bullets: [
          'Tarifas por faixa de consumo.',
          'Interseção entre gráficos e equilíbrio.',
          'Tabela, expressão e gráfico representam a mesma relação.',
        ],
      },
    ],
  },
  {
    id: 'sequencias',
    number: 6,
    title: 'Sequências, PA e PG',
    priority: 'media',
    intro: 'Diferencie crescimento aditivo de multiplicativo.',
    topics: [
      {
        id: 'padroes',
        title: 'Padrões e sequências',
        priority: 'media',
        bullets: [
          'Termo geral, posição e regularidade.',
          'Sequência não é conjunto: ordem importa.',
          'Padrões figurais e tabelas.',
        ],
      },
      {
        id: 'pa',
        title: 'Progressão aritmética',
        priority: 'media',
        bullets: [
          'Diferença constante entre termos consecutivos.',
          'Termo geral e soma dos primeiros termos.',
          'Crescimento aditivo.',
        ],
        formulas: ['aₙ = a₁ + (n−1)r', 'Sₙ = n(a₁+aₙ)/2'],
      },
      {
        id: 'pg',
        title: 'Progressão geométrica',
        priority: 'media',
        bullets: [
          'Quociente constante entre termos consecutivos.',
          'Crescimento multiplicativo.',
          'Razão negativa, maior que 1 ou entre 0 e 1.',
        ],
        formulas: ['aₙ = a₁qⁿ⁻¹', 'Sₙ = a₁(qⁿ−1)/(q−1), q≠1'],
      },
    ],
  },
  {
    id: 'geometria-plana',
    number: 7,
    title: 'Geometria plana',
    priority: 'alta',
    intro: 'Área, perímetro, semelhança e escala são presença constante.',
    topics: [
      {
        id: 'angulos-triangulos',
        title: 'Ângulos e triângulos',
        priority: 'alta',
        bullets: [
          'Ângulos complementares, suplementares e opostos.',
          'Soma dos ângulos internos e desigualdade triangular.',
          'Congruência e semelhança.',
        ],
        formulas: ['Soma dos ângulos internos = 180°'],
      },
      {
        id: 'tales-pitagoras',
        title: 'Tales e Pitágoras',
        priority: 'alta',
        bullets: [
          'Proporcionalidade de segmentos em paralelas.',
          'Pitágoras apenas em triângulo retângulo.',
          'Identifique a hipotenusa antes de substituir.',
        ],
        formulas: ['a² + b² = c²'],
        tool: { label: 'Calcular geometria', route: LAB, process: 'geometry' },
      },
      {
        id: 'areas-perimetros',
        title: 'Áreas e perímetros',
        priority: 'alta',
        bullets: [
          'Retângulo, quadrado, triângulo, paralelogramo, trapézio e losango.',
          'Círculo e setor circular.',
          'Decomposição e subtração de áreas em figuras compostas.',
        ],
        formulas: [
          'A_retângulo = b·h',
          'A_triângulo = b·h/2',
          'A_trapézio = (B+b)h/2',
          'A_círculo = πr²',
          'C = 2πr',
        ],
        tool: { label: 'Calcular áreas e volumes', route: LAB, process: 'geometry' },
      },
      {
        id: 'poligonos-escala',
        title: 'Polígonos, círculo e escala',
        priority: 'alta',
        bullets: [
          'Diagonais e soma dos ângulos internos.',
          'Semelhança: comprimentos na razão k; áreas na razão k².',
          'Ampliação/redução e escala em plantas.',
        ],
        formulas: ['S = (n−2)·180°'],
      },
    ],
  },
  {
    id: 'geometria-espacial',
    number: 8,
    title: 'Geometria espacial e capacidade',
    priority: 'alta',
    intro: 'Volume depende de três dimensões; capacidade usa litros e mililitros.',
    topics: [
      {
        id: 'solidos',
        title: 'Prismas, pirâmides, cilindros, cones e esferas',
        priority: 'alta',
        bullets: [
          'Faces, arestas, vértices, bases, altura, raio e geratriz.',
          'Área total e lateral.',
          'Planificações e desenhos em perspectiva.',
        ],
        tool: { label: 'Calcular volume', route: LAB, process: 'geometry' },
      },
      {
        id: 'volumes',
        title: 'Volume e capacidade',
        priority: 'alta',
        bullets: [
          'Volume do prisma/cilindro = área da base × altura.',
          'Pirâmide/cone = um terço do prisma/cilindro correspondente.',
          'Capacidade: 1 dm³ = 1 L; 1 cm³ = 1 mL.',
        ],
        formulas: [
          'V_prisma = A_b·h',
          'V_cilindro = πr²h',
          'V_pirâmide = A_b·h/3',
          'V_cone = πr²h/3',
          'V_esfera = 4πr³/3',
        ],
        tool: { label: 'Calcular volume', route: LAB, process: 'geometry' },
      },
      {
        id: 'escala-volume',
        title: 'Mudança de dimensões e sólidos compostos',
        priority: 'media',
        bullets: [
          'Dobrar todas as dimensões lineares multiplica o volume por 8.',
          'Some ou subtraia volumes em sólidos compostos.',
          'Densidade relaciona massa e volume quando o dado é fornecido.',
        ],
      },
    ],
  },
  {
    id: 'trigonometria',
    number: 9,
    title: 'Trigonometria essencial',
    priority: 'media',
    intro: 'Seno, cosseno e tangente no triângulo retângulo, com ângulos notáveis.',
    topics: [
      {
        id: 'razoes-trig',
        title: 'Razões trigonométricas',
        priority: 'alta',
        bullets: [
          'Seno, cosseno e tangente dependem do ângulo de referência.',
          'Identifique cateto oposto, adjacente e hipotenusa.',
          'Use esboço antes de substituir.',
        ],
        formulas: ['senθ = oposto/hipotenusa', 'cosθ = adjacente/hipotenusa', 'tanθ = oposto/adjacente'],
      },
      {
        id: 'angulos-notaveis',
        title: 'Ângulos notáveis e aplicações',
        priority: 'media',
        bullets: [
          '30°, 45° e 60°.',
          'Ângulo de elevação/depressão, rampas e telhados.',
          'Combine com Pitágoras.',
        ],
      },
    ],
  },
  {
    id: 'geometria-analitica',
    number: 10,
    title: 'Geometria analítica',
    priority: 'media',
    intro: 'Coordenadas, distância, ponto médio e inclinação.',
    topics: [
      {
        id: 'plano-cartesiano',
        title: 'Plano cartesiano e distância',
        priority: 'media',
        bullets: [
          'Quadrantes, pares ordenados e deslocamentos.',
          'Distância entre dois pontos e ponto médio.',
          'Confira escala e unidades dos eixos.',
        ],
        formulas: ['d = √((x₂−x₁)²+(y₂−y₁)²)', 'M = ((x₁+x₂)/2,(y₁+y₂)/2)'],
      },
      {
        id: 'reta',
        title: 'Inclinação e equação da reta',
        priority: 'media',
        bullets: [
          'Coeficiente angular e equação reduzida.',
          'Interseção de retas e sistemas.',
          'Inclinação não se confunde com altura visual.',
        ],
        formulas: ['m = (y₂−y₁)/(x₂−x₁)', 'y = mx + n'],
      },
    ],
  },
  {
    id: 'estatistica',
    number: 11,
    title: 'Estatística e leitura de dados',
    priority: 'alta',
    intro: 'Média, mediana, moda, dispersão e leitura crítica de gráficos.',
    topics: [
      {
        id: 'tabelas-graficos',
        title: 'Tabelas, frequências e gráficos',
        priority: 'alta',
        bullets: [
          'Frequência absoluta, relativa e acumulada.',
          'Barras, setores, linhas, histogramas e pictogramas.',
          'Escalas truncadas podem distorcer a leitura.',
        ],
        tool: { label: 'Calcular estatísticas', route: LAB, process: 'statistics' },
      },
      {
        id: 'media-mediana',
        title: 'Média, mediana, moda e amplitude',
        priority: 'alta',
        bullets: [
          'Média ponderada e influência de valores extremos.',
          'Mediana é o valor central; moda é o mais frequente.',
          'Amplitude = maior − menor.',
        ],
        tool: { label: 'Calcular média e mediana', route: LAB, process: 'statistics' },
      },
      {
        id: 'dispersao-amostragem',
        title: 'Dispersão, amostragem e causalidade',
        priority: 'media',
        bullets: [
          'Variância e desvio padrão medem dispersão.',
          'Amostra representativa e limites da conclusão.',
          'Correlação não prova causalidade.',
        ],
      },
    ],
  },
  {
    id: 'probabilidade',
    number: 12,
    title: 'Probabilidade',
    priority: 'alta',
    intro: 'Casos equiprováveis, complementar, independência e condicional.',
    topics: [
      {
        id: 'probabilidade-classica',
        title: 'Probabilidade clássica e complementar',
        priority: 'alta',
        bullets: [
          'P(A) = casos favoráveis / casos possíveis, se equiprováveis.',
          'Complementar: P(Aᶜ) = 1 − P(A).',
          'Probabilidade não é certeza.',
        ],
        formulas: ['P(A) = n(A)/n(Ω)', 'P(Aᶜ) = 1 − P(A)'],
        tool: { label: 'Calcular probabilidade', route: LAB, process: 'probability' },
      },
      {
        id: 'condicional-independente',
        title: 'Probabilidade condicional e independência',
        priority: 'alta',
        bullets: [
          'Mude a população de referência na condicional.',
          'Eventos independentes multiplicam probabilidades.',
          'Sem reposição altera o total e pode alterar a probabilidade.',
        ],
        formulas: ['P(A|B) = P(A∩B)/P(B)', 'P(A∩B) = P(A)P(B) se independentes'],
      },
      {
        id: 'contagem-probabilidade',
        title: 'Contagem e probabilidade',
        priority: 'media',
        bullets: [
          'Diagramas de árvore e tabelas de dupla entrada.',
          'Não use casos favoráveis/casos possíveis sem equiprobabilidade.',
          'Risco relativo e interpretação cotidiana.',
        ],
      },
    ],
  },
  {
    id: 'combinatoria',
    number: 13,
    title: 'Análise combinatória',
    priority: 'media',
    intro: 'Pergunte sempre: a ordem importa?',
    topics: [
      {
        id: 'principios-contagem',
        title: 'Princípios aditivo e multiplicativo',
        priority: 'alta',
        bullets: [
          'Aditivo: alternativas excludentes.',
          'Multiplicativo: decisões sucessivas.',
          'Árvores e tabelas organizam possibilidades.',
        ],
        tool: { label: 'Calcular combinações', route: LAB, process: 'probability' },
      },
      {
        id: 'permutacoes-combinacoes',
        title: 'Permutações, arranjos e combinações',
        priority: 'media',
        bullets: [
          'Arranjo: ordem importa; combinação: ordem não importa.',
          'Fatorial e casos de repetição.',
          'Restrições: primeira posição, repetição e elementos indistinguíveis.',
        ],
        formulas: ['Aₙ,ₚ = n!/(n−p)!', 'Cₙ,ₚ = n!/[p!(n−p)!]'],
      },
      {
        id: 'contagem-complemento',
        title: 'Contagem por complemento',
        priority: 'media',
        bullets: [
          'Conte o que não serve e subtraia do total.',
          'Verifique se zero pode ocupar a primeira posição.',
          'Confira repetição permitida.',
        ],
      },
    ],
  },
  {
    id: 'matrizes-sistemas',
    number: 14,
    title: 'Matrizes e sistemas',
    priority: 'media',
    intro: 'Tabelas, operações e sistemas lineares em contexto.',
    topics: [
      {
        id: 'matrizes',
        title: 'Matrizes',
        priority: 'media',
        bullets: [
          'Linhas, colunas, dimensões e elementos.',
          'Adição e multiplicação em casos simples.',
          'Aplicações em preços, estoques e produção.',
        ],
      },
      {
        id: 'sistemas-lineares',
        title: 'Sistemas lineares',
        priority: 'media',
        bullets: [
          'Duas ou três incógnitas em problemas contextualizados.',
          'Solução única, nenhuma ou infinitas.',
          'Sistema traduz condições simultâneas.',
        ],
      },
    ],
  },
  {
    id: 'conjuntos-logica',
    number: 15,
    title: 'Conjuntos, lógica e argumentação',
    priority: 'media',
    intro: 'União, interseção, negação e leitura de restrições.',
    topics: [
      {
        id: 'conjuntos',
        title: 'Conjuntos e diagramas de Venn',
        priority: 'media',
        bullets: [
          'União, interseção, diferença e complementar.',
          'Evite contar a interseção duas vezes.',
          'Traduza “pelo menos um”, “nenhum” e “todos”.',
        ],
      },
      {
        id: 'logica-argumentos',
        title: 'Lógica e argumentos quantitativos',
        priority: 'media',
        bullets: [
          'Negação, “e”, “ou” e condicionais.',
          'Exemplo não é prova geral.',
          'Verifique se os dados sustentam a conclusão.',
        ],
      },
    ],
  },
  {
    id: 'unidades-medidas',
    number: 16,
    title: 'Unidades, medidas e análise dimensional',
    priority: 'alta',
    intro: 'Unidade consistente evita a maior parte dos erros de conta.',
    topics: [
      {
        id: 'conversoes',
        title: 'Conversões e sistema métrico',
        priority: 'alta',
        bullets: [
          'Comprimento, massa, volume, tempo, temperatura e capacidade.',
          'Área e volume mudam o fator de conversão.',
          '1 L = 1 dm³; 1 mL = 1 cm³; 1 m³ = 1000 L.',
        ],
      },
      {
        id: 'taxas-medidas',
        title: 'Velocidade, densidade, vazão e precisão',
        priority: 'alta',
        bullets: [
          'v = Δs/Δt; densidade = m/V; vazão = V/t.',
          'km/h ↔ m/s: dividir/multiplicar por 3,6.',
          'Estimativa e plausibilidade do resultado.',
        ],
        formulas: ['v = Δs/Δt', 'ρ = m/V', 'Q = V/t', '1 km/h = 1/3,6 m/s'],
      },
    ],
  },
];

export interface MathFormulaGroup {
  title: string;
  items: string[];
}

export const MATH_FORMULAS: MathFormulaGroup[] = [
  {
    title: 'Aritmética e porcentagem',
    items: ['p% = p/100', 'p% de V = (p/100)V', 'variação = (final−inicial)/inicial × 100%', 'a/b = c/d ⇒ ad = bc'],
  },
  {
    title: 'Financeira',
    items: ['J = C·i·t', 'M = C(1 + i·t)', 'M = C(1 + i)^t'],
  },
  {
    title: 'Álgebra e funções',
    items: ['Δ = b² − 4ac', 'x = (−b ± √Δ)/(2a)', 'f(x) = ax + b', 'x_v = −b/(2a)', 'y_v = −Δ/(4a)', 'aₙ = a₁ + (n−1)r', 'aₙ = a₁qⁿ⁻¹'],
  },
  {
    title: 'Geometria',
    items: ['A_retângulo = b·h', 'A_triângulo = b·h/2', 'A_círculo = πr²', 'C = 2πr', 'a² + b² = c²', 'V_prisma = A_b·h', 'V_cilindro = πr²h', 'V_cone = πr²h/3', 'V_esfera = 4πr³/3'],
  },
  {
    title: 'Estatística e probabilidade',
    items: ['x̄ = Σxᵢ/n', 'P(A) = n(A)/n(Ω)', 'P(Aᶜ) = 1 − P(A)', 'P(A∩B) = P(A)P(B) se independentes', 'Cₙ,ₚ = n!/[p!(n−p)!]'],
  },
  {
    title: 'Geometria analítica',
    items: ['d = √((x₂−x₁)²+(y₂−y₁)²)', 'M = ((x₁+x₂)/2,(y₁+y₂)/2)', 'm = (y₂−y₁)/(x₂−x₁)'],
  },
];

export const MATH_STUDY_METHOD = [
  'Faça um diagnóstico inicial e classifique cada erro: conteúdo, interpretação, cálculo, unidade ou tempo.',
  'Estude em ciclos curtos por bloco; leia, resolva exemplos e depois tente sem consultar.',
  'Priorize questões oficiais do INEP e registre edição, caderno, questão, tema e motivo do erro.',
  'Mantenha um caderno de erros e refaça as questões alguns dias depois.',
  'Treine leitura visual: eixos, escala, legenda, unidade e o que cada elemento representa.',
  'Aprenda a estimar antes da conta e confira ordem de grandeza e plausibilidade.',
];

export const MATH_STUDY_SEQUENCE = [
  'Números e operações.',
  'Razão, proporção, regra de três e unidades.',
  'Porcentagem e matemática financeira.',
  'Álgebra, equações e sistemas.',
  'Funções e gráficos.',
  'Geometria plana.',
  'Geometria espacial.',
  'Estatística.',
  'Probabilidade e contagem.',
  'Sequências, trigonometria e geometria analítica.',
  'Matrizes, conjuntos e lógica.',
  'Revisão cumulativa com questões oficiais e simulados.',
];

export const MATH_CHECKLIST = [
  'Explicar os conceitos principais sem consultar o material.',
  'Resolver questões básicas e intermediárias sem copiar um modelo.',
  'Identificar dados relevantes em texto, tabela, gráfico ou figura.',
  'Justificar por que a fórmula ou estratégia escolhida se aplica.',
  'Conferir unidades, sinal, arredondamento e plausibilidade.',
  'Resolver novamente questões erradas após um intervalo.',
];

export const MATH_COMMON_MISTAKES = [
  'Responder à pergunta errada: valor final, diferença, área restante ou número de recipientes.',
  'Misturar unidades: metros com centímetros, horas com m/s.',
  'Confundir área com perímetro ou volume com área da base.',
  'Aplicar regra de três sem classificar a proporcionalidade.',
  'Somar percentuais sucessivos como se usassem a mesma base.',
  'Misturar juros simples/compostos ou taxa mensal com tempo anual.',
  'Ler gráfico sem observar escala, zero, legenda e unidade.',
  'Confundir média com mediana ou usar casos não equiprováveis.',
  'Usar combinação quando a ordem importa e vice-versa.',
  'Arredondar cedo demais e acumular erro.',
  'Ignorar restrições de inteiros e plausibilidade do contexto.',
  'Não conferir palavras como “aproximadamente”, “no mínimo” e “exceto”.',
];
