export type Genotype = 'AA' | 'Aa' | 'aa';

export interface PunnettResult {
  parentA: Genotype;
  parentB: Genotype;
  gametesA: string[];
  gametesB: string[];
  cells: Genotype[];
  genotypes: Record<Genotype, number>;
  phenotypes: { dominant: number; recessive: number };
  genotypePercent: Record<Genotype, number>;
  phenotypePercent: { dominant: number; recessive: number };
}

export function cross(parentA: Genotype, parentB: Genotype): PunnettResult {
  const gametesA = gametes(parentA);
  const gametesB = gametes(parentB);
  const cells: Genotype[] = [];
  for (const alleleA of gametesA) {
    for (const alleleB of gametesB) {
      cells.push(normalize(`${alleleA}${alleleB}`));
    }
  }
  const genotypes: Record<Genotype, number> = { AA: 0, Aa: 0, aa: 0 };
  for (const genotype of cells) {
    genotypes[genotype] += 1;
  }
  const total = cells.length;
  return {
    parentA,
    parentB,
    gametesA,
    gametesB,
    cells,
    genotypes,
    phenotypes: {
      dominant: genotypes.AA + genotypes.Aa,
      recessive: genotypes.aa,
    },
    genotypePercent: {
      AA: (genotypes.AA / total) * 100,
      Aa: (genotypes.Aa / total) * 100,
      aa: (genotypes.aa / total) * 100,
    },
    phenotypePercent: {
      dominant: ((genotypes.AA + genotypes.Aa) / total) * 100,
      recessive: (genotypes.aa / total) * 100,
    },
  };
}

function gametes(genotype: Genotype): string[] {
  return genotype.split('');
}

function normalize(pair: string): Genotype {
  if (pair === 'AA' || pair === 'aa') {
    return pair;
  }
  return 'Aa';
}
