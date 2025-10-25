// Kyrgyz name generation for BlockCats

const KYRGYZ_NAMES = {
  common: ['Boz', 'Kara', 'Ak', 'Sary', 'Kyzyl'],
  uncommon: ['Tengri', 'Issyk', 'Naryn', 'Asman', 'Bermet'],
  rare: ['Cholpon', 'Altynai', 'Dinara', 'Sanjar', 'Kubat'],
  legendary: ['Ala-Too', 'Manas', 'Kurmanjan', 'Toktogul']
};

const SUFFIXES = [
  'Paws', 'Shadow', 'Runner', 'Flame', 'Hunter',
  'Stripes', 'Eyes', 'Jumper', 'Tail', 'Whiskers',
  'Storm', 'Thunder', 'Lightning', 'Frost', 'Blaze'
];

export function generateKyrgyzName(rarityScore: number, tokenId: number): string {
  const tier = rarityScore >= 40 ? 'legendary' :
               rarityScore >= 30 ? 'rare' :
               rarityScore >= 20 ? 'uncommon' : 'common';

  const baseName = KYRGYZ_NAMES[tier][tokenId % KYRGYZ_NAMES[tier].length];
  const suffix = SUFFIXES[tokenId % SUFFIXES.length];

  return `${baseName} ${suffix} #${tokenId}`;
}

// Examples:
// Genesis (score 17): "Boz Paws #1"
// Gen 4 (score 35): "Altynai Runner #23"
// Gen 8 (score 48): "Ala-Too Thunder #42"
