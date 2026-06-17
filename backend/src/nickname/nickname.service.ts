import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NicknameFragment } from './entities/nickname-fragment.entity';
import { NicknameStyle } from './entities/nickname-style.entity';
import { NicknamePattern } from './entities/nickname-pattern.entity';
import { NicknameTransformation } from './entities/nickname-transformation.entity';
import { NicknameBlacklist, BlacklistSeverity } from './entities/nickname-blacklist.entity';
import { FragmentType } from './enums/fragment-type.enum';
import { NicknameStyle as NicknameStyleEnum } from './enums/nickname-style.enum';
import { PatternType } from './enums/pattern-type.enum';
import { TransformationType } from './enums/transformation-type.enum';
import { NicknameResult, GenerationOptions } from './interfaces/nickname-result.interface';
import {
  DEFAULT_PREFIXES,
  DEFAULT_CORES,
  DEFAULT_SUFFIXES,
  DEFAULT_STANDALONES,
} from './constants/default-fragments.constant';

@Injectable()
export class NicknameService implements OnModuleInit {
  private readonly logger = new Logger(NicknameService.name);

  constructor(
    @InjectRepository(NicknameFragment)
    private readonly fragmentRepository: Repository<NicknameFragment>,
    @InjectRepository(NicknameStyle)
    private readonly styleRepository: Repository<NicknameStyle>,
    @InjectRepository(NicknamePattern)
    private readonly patternRepository: Repository<NicknamePattern>,
    @InjectRepository(NicknameTransformation)
    private readonly transformationRepository: Repository<NicknameTransformation>,
    @InjectRepository(NicknameBlacklist)
    private readonly blacklistRepository: Repository<NicknameBlacklist>,
  ) {}

  async onModuleInit() {
    try {
      await this.seedDefaultData();
    } catch (error) {
      this.logger.warn(`Could not seed nickname data: ${error.message}. Using in-memory fragments.`);
    }
  }

  async generateNickname(options: GenerationOptions = {}): Promise<NicknameResult> {
    const maxAttempts = 25; // Augmenté pour plus d'unicité
    let attempts = 0;

    // Longueurs par défaut plus permissives
    const effectiveOptions = {
      ...options,
      minLength: options.minLength || 3,
      maxLength: options.maxLength || 15, // Passé de 7 à 15
    };

    while (attempts < maxAttempts) {
      attempts++;
      try {
        const result = await this.tryGenerateNickname(effectiveOptions);
        if (result && await this.isValidNickname(result.nickname, effectiveOptions)) {
          return result;
        }
      } catch (error) {
        this.logger.debug(`Generation attempt ${attempts} failed: ${error.message}`);
      }
    }

    throw new Error(`Failed to generate valid nickname after ${maxAttempts} attempts`);
  }

  async generateMultipleNicknames(count: number, options: GenerationOptions = {}): Promise<NicknameResult[]> {
    const results: NicknameResult[] = [];
    const generated = new Set<string>();

    let attempts = 0;
    const maxAttempts = count * 20;

    while (results.length < count && attempts < maxAttempts) {
      attempts++;
      try {
        const result = await this.generateNickname(options);
        if (!generated.has(result.nickname.toLowerCase())) {
          generated.add(result.nickname.toLowerCase());
          results.push(result);
        }
      } catch (error) {
        this.logger.warn(`Failed to generate unique nickname: ${error.message}`);
      }
    }

    return results;
  }

  private async tryGenerateNickname(options: GenerationOptions): Promise<NicknameResult | null> {
    const style = await this.selectWeightedStyle(options.style);
    const pattern = await this.selectWeightedPattern(style, options.pattern);

    this.logger.log(`Selected style: ${style.style}, pattern: ${pattern.patternType} (weight: ${pattern.weight})`);

    let nickname: string;
    let source: string | undefined;
    const transformations: string[] = [];

    switch (pattern.patternType) {
      case PatternType.FRAGMENT_CORE:
      case PatternType.FRAGMENT_PREFIX_CORE:
      case PatternType.FRAGMENT_CORE_SUFFIX:
      case PatternType.FRAGMENT_PREFIX_CORE_SUFFIX:
        nickname = await this.buildFromFragments(pattern.patternType);
        source = 'fragments';
        break;

      case PatternType.NAME_SHORTENED:
      case PatternType.NAME_MODIFIED:
      case PatternType.NAME_LEET:
      case PatternType.NAME_BLEND_VOWEL_CONSONANT:
        if (options.firstName || options.lastName) {
          nickname = this.buildFromName(
            options.firstName || '',
            options.lastName || '',
            pattern.patternType,
          );
          source = options.firstName || options.lastName;
        } else {
          nickname = await this.buildFromFragments(PatternType.FRAGMENT_CORE);
          source = 'fragments (fallback)';
        }
        break;

      case PatternType.WORD_MODIFIED:
        nickname = await this.buildModifiedWord();
        source = 'word';
        break;

      case PatternType.STANDALONE:
        nickname = await this.selectStandaloneFragment(options.firstName, options.lastName);
        source = 'standalone';
        break;

      case PatternType.HYBRID_NAME_FRAGMENT:
        nickname = await this.buildHybrid(options.firstName, options.lastName);
        source = 'hybrid';
        break;

      default:
        nickname = await this.buildFromFragments(PatternType.FRAGMENT_CORE);
        source = 'fragments (default)';
    }

    if (!options.avoidTransformations) {
      const transformed = await this.applyTransformations(nickname, style);
      nickname = transformed.nickname;
      transformations.push(...transformed.applied);
    }

    nickname = this.enforceLengthConstraints(nickname, options.minLength || 4, options.maxLength || 7);

    if (!options.avoidTransformations) {
      nickname = this.adjustCase(nickname, style);
    }

    const readability = this.calculateReadability(nickname);

    return {
      nickname,
      style: style.style,
      pattern: pattern.patternType,
      transformations,
      source,
      length: nickname.length,
      readability,
    };
  }

  private async selectWeightedStyle(preferredStyle?: NicknameStyleEnum): Promise<NicknameStyle> {
    if (preferredStyle) {
      const style = await this.styleRepository.findOne({ where: { style: preferredStyle, isActive: true } });
      if (style) return style;
    }

    let styles = await this.styleRepository.find({ where: { isActive: true } });
    
    // Si aucun style en base, forcer la création
    if (styles.length === 0) {
      this.logger.warn('No styles found in database, seeding default styles...');
      await this.seedDefaultStyles();
      styles = await this.styleRepository.find({ where: { isActive: true } });
    }
    
    if (styles.length === 0) {
      return this.createDefaultStyle();
    }

    return this.weightedRandom(styles, (s) => s.weight);
  }

  private async selectWeightedPattern(
    style: NicknameStyle,
    preferredPattern?: PatternType,
  ): Promise<NicknamePattern> {
    if (preferredPattern) {
      const pattern = await this.patternRepository.findOne({
        where: { patternType: preferredPattern, isActive: true },
      });
      if (pattern) return pattern;
    }

    let patterns = await this.patternRepository.find({
      where: { isActive: true },
    });

    // Si aucun pattern en base, forcer la création des patterns par défaut
    if (patterns.length === 0) {
      this.logger.warn('No patterns found in database, seeding default patterns...');
      await this.seedDefaultPatterns();
      patterns = await this.patternRepository.find({
        where: { isActive: true },
      });
    }

    this.logger.log(`Found ${patterns.length} active patterns: ${patterns.map(p => `${p.patternType}(${p.weight})`).join(', ')}`);

    const filtered = patterns.filter((p) => {
      if (!style.allowedPatterns || style.allowedPatterns.length === 0) return true;
      return style.allowedPatterns.includes(p.patternType);
    });

    this.logger.log(`After filtering for style ${style.style} (allowed: ${JSON.stringify(style.allowedPatterns)}): ${filtered.map(p => p.patternType).join(', ')}`);

    const finalPatterns = filtered.length > 0 ? filtered : patterns;
    if (finalPatterns.length === 0) {
      return this.createDefaultPattern();
    }

    return this.weightedRandom(finalPatterns, (p) => p.weight);
  }

  private async buildFromFragments(patternType: PatternType): Promise<string> {
    let prefix = '';
    let core = '';
    let suffix = '';

    // Try database first, fallback to in-memory constants
    let cores = await this.fragmentRepository.find({
      where: { type: FragmentType.CORE, isActive: true },
    });

    // Fallback to in-memory fragments if database is empty
    if (cores.length === 0) {
      cores = DEFAULT_CORES.map(c => ({ ...c, id: '', isActive: true, language: 'en', tags: null, usageCount: 0 } as NicknameFragment));
    }

    core = this.weightedRandom(cores, (c) => c.weight).value;

    if (patternType === PatternType.FRAGMENT_PREFIX_CORE || patternType === PatternType.FRAGMENT_PREFIX_CORE_SUFFIX) {
      let prefixes = await this.fragmentRepository.find({
        where: { type: FragmentType.PREFIX, isActive: true },
      });
      if (prefixes.length === 0) {
        prefixes = DEFAULT_PREFIXES.map(p => ({ ...p, id: '', isActive: true, language: 'en', tags: null, usageCount: 0 } as NicknameFragment));
      }
      if (prefixes.length > 0) {
        prefix = this.weightedRandom(prefixes, (p) => p.weight).value;
      }
    }

    if (patternType === PatternType.FRAGMENT_CORE_SUFFIX || patternType === PatternType.FRAGMENT_PREFIX_CORE_SUFFIX) {
      let suffixes = await this.fragmentRepository.find({
        where: { type: FragmentType.SUFFIX, isActive: true },
      });
      if (suffixes.length === 0) {
        suffixes = DEFAULT_SUFFIXES.map(s => ({ ...s, id: '', isActive: true, language: 'en', tags: null, usageCount: 0 } as NicknameFragment));
      }
      if (suffixes.length > 0) {
        suffix = this.weightedRandom(suffixes, (s) => s.weight).value;
      }
    }

    // Parfois ajouter un underscore entre parties pour unicité (15% chance)
    const useSeparator = Math.random() < 0.15;
    if (useSeparator && prefix && !suffix) {
      return `${prefix}_${core}`;
    } else if (useSeparator && !prefix && suffix && !/^\d+$/.test(suffix)) {
      return `${core}_${suffix}`;
    }

    // Si le core serait seul (pas de préfixe ni suffixe), forcer l'ajout d'un préfixe OU suffixe
    if (!prefix && !suffix) {
      // 50% chance préfixe, 50% chance suffixe
      if (Math.random() < 0.5) {
        let prefixes = await this.fragmentRepository.find({
          where: { type: FragmentType.PREFIX, isActive: true },
        });
        if (prefixes.length === 0) {
          prefixes = DEFAULT_PREFIXES.map(p => ({ ...p, id: '', isActive: true, language: 'en', tags: null, usageCount: 0 } as NicknameFragment));
        }
        if (prefixes.length > 0) {
          prefix = this.weightedRandom(prefixes, (p) => p.weight).value;
        }
      } else {
        let suffixes = await this.fragmentRepository.find({
          where: { type: FragmentType.SUFFIX, isActive: true },
        });
        if (suffixes.length === 0) {
          suffixes = DEFAULT_SUFFIXES.map(s => ({ ...s, id: '', isActive: true, language: 'en', tags: null, usageCount: 0 } as NicknameFragment));
        }
        if (suffixes.length > 0) {
          suffix = this.weightedRandom(suffixes, (s) => s.weight).value;
        }
      }
    }

    return prefix + core + suffix;
  }

  private buildFromName(firstName: string, lastName: string, patternType: PatternType): string {
    const cleanFirst = firstName.toLowerCase().replace(/[^a-z]/g, '');
    const cleanLast = lastName.toLowerCase().replace(/[^a-z]/g, '');

    let result = '';

    switch (patternType) {
      case PatternType.NAME_SHORTENED:
        if (cleanFirst.length >= 3) {
          result = cleanFirst.substring(0, Math.min(4, cleanFirst.length));
        } else if (cleanLast.length >= 3) {
          result = cleanLast.substring(0, Math.min(4, cleanLast.length));
        } else {
          result = (cleanFirst + cleanLast).substring(0, 4);
        }
        // Ajouter la première lettre du nom de famille en majuscule pour unicité
        if (cleanLast.length > 0) {
          result += cleanLast.charAt(0).toUpperCase();
        }
        break;

      case PatternType.NAME_MODIFIED:
        const base = cleanFirst || cleanLast;
        result = this.modifyNameIntelligently(base);
        break;

      case PatternType.NAME_LEET:
        const baseName = cleanFirst || cleanLast;
        result = this.applyLeetSpeak(baseName, 'moderate');
        break;

      case PatternType.NAME_BLEND_VOWEL_CONSONANT:
        result = this.buildVowelConsonantBlend(cleanFirst, cleanLast);
        break;

      default:
        result = cleanFirst.substring(0, 3) + cleanLast.substring(0, 3);
    }

    return result;
  }

  private modifyNameIntelligently(name: string): string {
    if (name.length <= 3) return name;

    const vowels = 'aeiou';
    let modified = name;

    if (name.length > 5 && Math.random() < 0.6) {
      modified = name.replace(new RegExp(`[${vowels}](?=[${vowels}])`, 'gi'), '');
    }

    if (modified.length > 6 && Math.random() < 0.4) {
      modified = modified.substring(0, 5) + modified.charAt(modified.length - 1);
    }

    if (Math.random() < 0.3) {
      const lastChar = modified.charAt(modified.length - 1);
      if (!/[0-9]/.test(lastChar)) {
        modified = modified.slice(0, -1) + lastChar + lastChar;
      }
    }

    return modified;
  }

  private buildVowelConsonantBlend(firstName: string, lastName: string): string {
    const vowels = 'aeiou';
    const consonants = 'bcdfghjklmnpqrstvwxz';
    
    // Partie 1: 2-3 premières lettres du prénom, terminant par une voyelle
    let firstPart = '';
    for (let i = 2; i <= 3 && i <= firstName.length; i++) {
      const substring = firstName.substring(0, i);
      const lastChar = substring.charAt(substring.length - 1);
      if (vowels.includes(lastChar)) {
        firstPart = substring;
      }
    }
    // Si pas de voyelle trouvée dans les 2-3 premières, prendre 1ère lettre + voyelle suivante
    if (!firstPart && firstName.length >= 2) {
      for (let i = 1; i < firstName.length; i++) {
        if (vowels.includes(firstName.charAt(i))) {
          firstPart = firstName.substring(0, i + 1);
          break;
        }
      }
    }
    // Fallback
    if (!firstPart) {
      firstPart = firstName.substring(0, Math.min(2, firstName.length));
    }
    
    // Partie 2: 3 dernières lettres du nom OU 3 premières (doit commencer par consonne)
    let secondPart = '';
    
    // Essayer les 3 dernières lettres
    if (lastName.length >= 3) {
      const lastThree = lastName.substring(lastName.length - 3);
      if (consonants.includes(lastThree.charAt(0))) {
        secondPart = lastThree;
      }
    }
    
    // Si les 3 dernières ne commencent pas par consonne, essayer les 3 premières
    if (!secondPart && lastName.length >= 3) {
      const firstThree = lastName.substring(0, 3);
      if (consonants.includes(firstThree.charAt(0))) {
        secondPart = firstThree;
      }
    }
    
    // Si toujours rien, chercher 3 lettres consécutives commençant par consonne
    if (!secondPart && lastName.length >= 3) {
      for (let i = 0; i <= lastName.length - 3; i++) {
        const threeChars = lastName.substring(i, i + 3);
        if (consonants.includes(threeChars.charAt(0))) {
          secondPart = threeChars;
          break;
        }
      }
    }
    
    // Fallback
    if (!secondPart) {
      secondPart = lastName.substring(0, Math.min(3, lastName.length));
    }
    
    return firstPart + secondPart;
  }

  private applyLeetSpeak(text: string, level: 'simple' | 'moderate' = 'moderate'): string {
    const simpleMap: Record<string, string> = {
      a: '4',
      e: '3',
      i: '1',
      o: '0',
      s: '5',
    };

    const moderateMap: Record<string, string> = {
      ...simpleMap,
      t: '7',
      g: '9',
      b: '8',
      z: '2',
    };

    const map = level === 'simple' ? simpleMap : moderateMap;
    let result = text.toLowerCase();

    const substitutions = Object.keys(map);
    const numToReplace = level === 'simple'
      ? Math.floor(result.length * 0.3)
      : Math.floor(result.length * 0.5);

    const indices = this.getRandomIndices(result.length, numToReplace);

    for (const idx of indices) {
      const char = result[idx];
      if (map[char]) {
        result = result.substring(0, idx) + map[char] + result.substring(idx + 1);
      }
    }

    return result;
  }

  private getRandomIndices(max: number, count: number): number[] {
    const indices = new Set<number>();
    while (indices.size < Math.min(count, max)) {
      indices.add(Math.floor(Math.random() * max));
    }
    return Array.from(indices).sort((a, b) => b - a);
  }

  private async buildModifiedWord(): Promise<string> {
    let cores = await this.fragmentRepository.find({
      where: { type: FragmentType.CORE, isActive: true },
    });

    if (cores.length === 0) {
      cores = DEFAULT_CORES.map(c => ({ ...c, id: '', isActive: true, language: 'en', tags: null, usageCount: 0 } as NicknameFragment));
    }

    if (cores.length === 0) throw new Error('No core fragments available');

    const word = this.weightedRandom(cores, (c) => c.weight).value;
    return this.modifyNameIntelligently(word);
  }

  private async selectStandaloneFragment(firstName?: string, lastName?: string): Promise<string> {
    let standalones = await this.fragmentRepository.find({
      where: { type: FragmentType.STANDALONE, isActive: true },
    });

    if (standalones.length === 0) {
      standalones = DEFAULT_STANDALONES.map(s => ({ ...s, id: '', isActive: true, language: 'en', tags: null, usageCount: 0 } as NicknameFragment));
    }

    // Fallback: si pas de standalones, prendre un core et le modifier pour en faire un pseudo unique
    let base: string;
    if (standalones.length === 0) {
      let cores = await this.fragmentRepository.find({
        where: { type: FragmentType.CORE, isActive: true },
      });
      if (cores.length === 0) {
        cores = DEFAULT_CORES.map(c => ({ ...c, id: '', isActive: true, language: 'en', tags: null, usageCount: 0 } as NicknameFragment));
      }
      base = this.weightedRandom(cores, (c) => c.weight).value;
      // Appliquer des transformations pour rendre unique
      base = this.applySingleTransformation(base, TransformationType.VOWEL_REMOVAL);
      base = this.applySingleTransformation(base, TransformationType.LETTER_DUPLICATION);
    } else {
      base = this.weightedRandom(standalones, (s) => s.weight).value;
    }
    
    // Si on a un nom de famille, 70% chance de faire un hybrid style "s1mpleR" (standalone + initiale nom)
    if (lastName && Math.random() < 0.7) {
      const lastInitial = lastName.charAt(0).toUpperCase();
      // Variante: standalone + initiale (ex: s1mpleR)
      return base + lastInitial;
    }
    
    // Sinon, casse aléatoire sur le standalone (style ropz, ZywOo, NiKo)
    return this.randomCaseMix(base);
  }

  private async buildHybrid(firstName?: string, lastName?: string): Promise<string> {
    const namePart = firstName || lastName;
    if (!namePart) {
      return this.buildFromFragments(PatternType.FRAGMENT_CORE);
    }

    let prefixes = await this.fragmentRepository.find({
      where: { type: FragmentType.PREFIX, isActive: true },
    });
    let suffixes = await this.fragmentRepository.find({
      where: { type: FragmentType.SUFFIX, isActive: true },
    });

    // Fallback to in-memory fragments if database is empty
    if (prefixes.length === 0) {
      prefixes = DEFAULT_PREFIXES.map(p => ({ ...p, id: '', isActive: true, language: 'en', tags: null, usageCount: 0 } as NicknameFragment));
    }
    if (suffixes.length === 0) {
      suffixes = DEFAULT_SUFFIXES.map(s => ({ ...s, id: '', isActive: true, language: 'en', tags: null, usageCount: 0 } as NicknameFragment));
    }

    const cleanName = namePart.toLowerCase().replace(/[^a-z]/g, '');
    const shortName = cleanName.substring(0, 3);

    let result = shortName;

    if (prefixes.length > 0 && Math.random() < 0.5) {
      const prefix = this.weightedRandom(prefixes, (p) => p.weight).value;
      result = prefix + shortName;
    } else if (suffixes.length > 0) {
      const suffix = this.weightedRandom(suffixes, (s) => s.weight).value;
      result = shortName + suffix;
    }

    return result;
  }

  private async applyTransformations(
    nickname: string,
    style: NicknameStyle,
  ): Promise<{ nickname: string; applied: string[] }> {
    const applied: string[] = [];
    let result = nickname;

    const transformations = await this.transformationRepository.find({ where: { isActive: true } });

    const preferredTransformations = style.preferredTransformations || [];
    const sortedTransformations = [
      ...transformations.filter((t) => preferredTransformations.includes(t.type)),
      ...transformations.filter((t) => !preferredTransformations.includes(t.type)),
    ];

    const numTransformations = Math.floor(Math.random() * 2) + 1;

    for (let i = 0; i < numTransformations && i < sortedTransformations.length; i++) {
      const transformation = sortedTransformations[i];

      if (Math.random() * 100 > transformation.weight) continue;

      const transformed = this.applySingleTransformation(result, transformation.type);
      if (transformed !== result) {
        result = transformed;
        applied.push(transformation.type);
      }
    }

    return { nickname: result, applied };
  }

  private applySingleTransformation(nickname: string, type: TransformationType): string {
    switch (type) {
      case TransformationType.VOWEL_REMOVAL:
        return nickname.replace(/[aeiou]/gi, '');

      case TransformationType.VOWEL_REMOVAL_PARTIAL:
        return nickname.replace(/[aeiou](?=[aeiou])/gi, '').replace(/[aeiou](?=.)/gi, (m, i) =>
          i === 0 ? m : ''
        );

      case TransformationType.LETTER_DUPLICATION:
        if (nickname.length < 6) {
          const lastChar = nickname.charAt(nickname.length - 1);
          return nickname + lastChar;
        }
        return nickname;

      case TransformationType.CASE_VARIATION:
        return nickname
          .split('')
          .map((c, i) => (i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()))
          .join('');

      case TransformationType.LENGTH_TRIM:
        if (nickname.length > 7) {
          return nickname.substring(0, 7);
        }
        return nickname;

      case TransformationType.LEET_SIMPLE:
        return this.applyLeetSpeak(nickname, 'simple');

      case TransformationType.LEET_MODERATE:
        return this.applyLeetSpeak(nickname, 'moderate');

      case TransformationType.TRUNCATE:
        if (nickname.length > 5) {
          return nickname.substring(0, 5);
        }
        return nickname;

      default:
        return nickname;
    }
  }

  private enforceLengthConstraints(nickname: string, min: number, max: number): string {
    // Pour les longs pseudos (>10), on accepte plus de flexibilité
    const effectiveMax = nickname.length > 10 ? Math.min(max, 15) : Math.min(max, 12);
    
    if (nickname.length < min) {
      const chars = 'bcdfghjklmnpqrstvwxz0123456789';
      while (nickname.length < min) {
        nickname += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    }

    if (nickname.length > effectiveMax) {
      nickname = nickname.substring(0, effectiveMax);
    }

    // Très rarement ajouter un suffixe numérique (5% chance max)
    if (Math.random() < 0.05 && nickname.length < effectiveMax - 1 && !/^\d+$/.test(nickname)) {
      const numSuffix = Math.floor(Math.random() * 10).toString(); // Juste 1 chiffre
      if (nickname.length + numSuffix.length <= effectiveMax) {
        nickname += numSuffix;
      }
    }

    return nickname;
  }

  private adjustCase(nickname: string, style: NicknameStyle): string {
    switch (style.style) {
      case NicknameStyleEnum.STYLIZED:
        return this.randomCaseMix(nickname);
      case NicknameStyleEnum.NAME_BASED:
        return nickname.charAt(0).toUpperCase() + nickname.slice(1).toLowerCase();
      default:
        return nickname.toLowerCase();
    }
  }

  private randomCaseMix(nickname: string): string {
    // Plusieurs stratégies de casse pour unicité
    const strategies = [
      // Style s1mple: première lettre minuscule, reste mélangé
      (s: string) => s.charAt(0).toLowerCase() + s.slice(1).split('').map((c, i) => 
        i % 3 === 1 ? c.toUpperCase() : c.toLowerCase()).join(''),
      // Style ZywOo: majuscules sur voyelles
      (s: string) => s.split('').map(c => 
        'aeiou'.includes(c.toLowerCase()) ? c.toUpperCase() : c.toLowerCase()).join(''),
      // Style NiKo: majuscule au milieu
      (s: string) => {
        const mid = Math.floor(s.length / 2);
        return s.slice(0, mid).toLowerCase() + s.charAt(mid).toUpperCase() + s.slice(mid + 1).toLowerCase();
      },
      // Style m0NESY: aléatoire avec préférence pour majuscules
      (s: string) => s.split('').map(c => Math.random() < 0.4 ? c.toUpperCase() : c.toLowerCase()).join(''),
      // Style ropz: tout minuscule avec lettre isolée en majuscule
      (s: string) => {
        const idx = Math.floor(Math.random() * (s.length - 1)) + 1;
        return s.slice(0, idx).toLowerCase() + s.charAt(idx).toUpperCase() + s.slice(idx + 1).toLowerCase();
      },
    ];
    
    const strategy = strategies[Math.floor(Math.random() * strategies.length)];
    return strategy(nickname);
  }

  private calculateReadability(nickname: string): number {
    let score = 100;

    const vowels = (nickname.match(/[aeiou]/gi) || []).length;
    const consonants = nickname.length - vowels;

    if (vowels === 0) score -= 30;
    if (consonants > nickname.length * 0.8) score -= 20;

    const numbers = (nickname.match(/[0-9]/g) || []).length;
    score -= numbers * 5;

    if (/[^a-zA-Z0-9]/.test(nickname)) score -= 10;

    const consecutiveConsonants = nickname.match(/[^aeiou]{4,}/gi);
    if (consecutiveConsonants) score -= consecutiveConsonants.length * 10;

    return Math.max(0, Math.min(100, score));
  }

  private async isValidNickname(nickname: string, options: GenerationOptions): Promise<boolean> {
    const minLen = options.minLength || 3;
    const maxLen = options.maxLength || 15;

    if (nickname.length < minLen || nickname.length > maxLen) return false;

    if (/^[^a-zA-Z]/.test(nickname)) return false;

    const blacklisted = await this.isBlacklisted(nickname);
    if (blacklisted) return false;

    const readability = this.calculateReadability(nickname);
    // Plus permissif pour les longs pseudos
    const minReadability = nickname.length > 10 ? 20 : 30;
    if (readability < minReadability) return false;

    return true;
  }

  private async isBlacklisted(nickname: string): Promise<boolean> {
    try {
      const blacklist = await this.blacklistRepository.find({ where: { isActive: true } });

      for (const entry of blacklist) {
        if (entry.isRegex) {
          try {
            const regex = new RegExp(entry.pattern, 'i');
            if (regex.test(nickname)) return true;
          } catch {
            continue;
          }
        } else {
          if (nickname.toLowerCase().includes(entry.pattern.toLowerCase())) return true;
        }
      }
    } catch {
      // If blacklist table doesn't exist, use default hardcoded blacklist
      const defaultBlacklist = ['admin', 'mod', 'root', 'test', 'user', 'guest', 'player', 'ludo', 'chev'];
      if (defaultBlacklist.some(b => nickname.toLowerCase().includes(b))) return true;
    }

    return false;
  }

  private weightedRandom<T>(items: T[], weightFn: (item: T) => number): T {
    const weights = items.map(weightFn);
    const total = weights.reduce((a, b) => a + b, 0);

    let random = Math.random() * total;

    for (let i = 0; i < items.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return items[i];
      }
    }

    return items[items.length - 1];
  }

  private async seedDefaultData(): Promise<void> {
    const fragmentCount = await this.fragmentRepository.count();
    
    if (fragmentCount === 0) {
      this.logger.log('Seeding default fragments...');
      const allFragments = [
        ...DEFAULT_PREFIXES,
        ...DEFAULT_CORES,
        ...DEFAULT_SUFFIXES,
        ...DEFAULT_STANDALONES,
      ];

      for (const fragment of allFragments) {
        await this.fragmentRepository.save({
          value: fragment.value,
          type: fragment.type,
          weight: fragment.weight,
          language: fragment.language || 'en',
          tags: fragment.tags ? JSON.stringify(fragment.tags) : null,
          isActive: true,
          usageCount: 0,
        });
      }
    } else {
      this.logger.log(`Database already has ${fragmentCount} fragments`);
    }

    // Toujours mettre à jour styles et patterns (pour les nouveaux poids)
    this.logger.log('Updating styles and patterns...');
    await this.seedDefaultStyles();
    await this.seedDefaultPatterns();
    await this.seedDefaultTransformations();
    await this.seedDefaultBlacklist();

    this.logger.log('Default nickname data updated successfully');
  }

  private async seedDefaultStyles(): Promise<void> {
    const styles = [
      { style: NicknameStyleEnum.ABSTRACT, weight: 20, description: 'Mots abstraits et concepts' },
      { style: NicknameStyleEnum.NAME_BASED, weight: 25, description: 'Basé sur le vrai nom' },
      { style: NicknameStyleEnum.MODIFIED_WORD, weight: 20, description: 'Mots modifiés' },
      { style: NicknameStyleEnum.SIMPLE_WORD, weight: 15, description: 'Mots simples' },
      { style: NicknameStyleEnum.STYLIZED, weight: 15, description: 'Stylisé avec variations de casse' },
      { style: NicknameStyleEnum.HYBRID, weight: 5, description: 'Combinaison de styles' },
    ];

    for (const style of styles) {
      const existing = await this.styleRepository.findOne({ where: { style: style.style } });
      if (!existing) {
        await this.styleRepository.save({
          ...style,
          isActive: true,
          allowedPatterns: null,
          preferredTransformations: null,
        });
      } else {
        // Réinitialiser allowedPatterns pour permettre tous les patterns
        existing.allowedPatterns = null;
        await this.styleRepository.save(existing);
      }
    }
  }

  private async seedDefaultPatterns(): Promise<void> {
    const patterns = [
      { patternType: PatternType.FRAGMENT_CORE, weight: 5, description: 'Core seul' },
      { patternType: PatternType.FRAGMENT_PREFIX_CORE, weight: 10, description: 'Prefix + Core' },
      { patternType: PatternType.FRAGMENT_CORE_SUFFIX, weight: 10, description: 'Core + Suffix' },
      { patternType: PatternType.FRAGMENT_PREFIX_CORE_SUFFIX, weight: 8, description: 'Prefix + Core + Suffix' },
      { patternType: PatternType.NAME_SHORTENED, weight: 8, description: 'Nom raccourci' },
      { patternType: PatternType.NAME_MODIFIED, weight: 6, description: 'Nom modifié' },
      { patternType: PatternType.NAME_LEET, weight: 10, description: 'Nom en leetspeak' },
      { patternType: PatternType.NAME_BLEND_VOWEL_CONSONANT, weight: 25, description: 'Prénom (voyelle) + Nom (consonne)' },
      { patternType: PatternType.WORD_MODIFIED, weight: 12, description: 'Mot modifié' },
      { patternType: PatternType.STANDALONE, weight: 18, description: 'Fragment standalone' },
      { patternType: PatternType.HYBRID_NAME_FRAGMENT, weight: 10, description: 'Nom + Fragment' },
    ];

    for (const pattern of patterns) {
      const existing = await this.patternRepository.findOne({
        where: { patternType: pattern.patternType },
      });
      if (!existing) {
        await this.patternRepository.save({
          ...pattern,
          isActive: true,
          minLengthByPart: null,
          maxLengthByPart: null,
        });
      } else {
        // Mettre à jour le poids si le pattern existe déjà
        if (existing.weight !== pattern.weight) {
          this.logger.log(`Updating ${pattern.patternType}: ${existing.weight} -> ${pattern.weight}`);
          existing.weight = pattern.weight;
          await this.patternRepository.save(existing);
        }
      }
    }
    
    // Vérifier les poids finaux
    const finalPatterns = await this.patternRepository.find({ where: { isActive: true } });
    this.logger.log(`Final pattern weights: ${finalPatterns.map(p => `${p.patternType}(${p.weight})`).join(', ')}`);
  }

  private async seedDefaultTransformations(): Promise<void> {
    const transformations = [
      { type: TransformationType.VOWEL_REMOVAL, weight: 20, description: 'Suppression de toutes les voyelles' },
      { type: TransformationType.VOWEL_REMOVAL_PARTIAL, weight: 30, description: 'Suppression partielle des voyelles' },
      { type: TransformationType.LETTER_DUPLICATION, weight: 25, description: 'Duplication de la dernière lettre' },
      { type: TransformationType.LETTER_SUBSTITUTION, weight: 15, description: 'Substitution de lettres' },
      { type: TransformationType.CASE_VARIATION, weight: 20, description: 'Variation de casse' },
      { type: TransformationType.LENGTH_TRIM, weight: 25, description: 'Ajustement de la longueur' },
      { type: TransformationType.LEET_SIMPLE, weight: 15, description: 'Leetspeak simple' },
      { type: TransformationType.LEET_MODERATE, weight: 10, description: 'Leetspeak modéré' },
      { type: TransformationType.TRUNCATE, weight: 20, description: 'Tronquage' },
    ];

    for (const transformation of transformations) {
      const existing = await this.transformationRepository.findOne({
        where: { type: transformation.type },
      });
      if (!existing) {
        await this.transformationRepository.save({
          ...transformation,
          isActive: true,
          parameters: null,
          applicablePatterns: null,
        });
      }
    }
  }

  private async seedDefaultBlacklist(): Promise<void> {
    const blacklist = [
      { pattern: 'admin', severity: BlacklistSeverity.CRITICAL, isRegex: false, reason: 'Terme réservé' },
      { pattern: 'mod', severity: BlacklistSeverity.HIGH, isRegex: false, reason: 'Terme réservé' },
      { pattern: 'root', severity: BlacklistSeverity.HIGH, isRegex: false, reason: 'Terme technique' },
      { pattern: 'test', severity: BlacklistSeverity.MEDIUM, isRegex: false, reason: 'Trop générique' },
      { pattern: 'user', severity: BlacklistSeverity.MEDIUM, isRegex: false, reason: 'Trop générique' },
      { pattern: 'guest', severity: BlacklistSeverity.MEDIUM, isRegex: false, reason: 'Trop générique' },
      { pattern: 'player', severity: BlacklistSeverity.LOW, isRegex: false, reason: 'Trop générique' },
      { pattern: 'ludo', severity: BlacklistSeverity.LOW, isRegex: false, reason: 'Exemple à éviter' },
      { pattern: 'chev', severity: BlacklistSeverity.LOW, isRegex: false, reason: 'Exemple à éviter' },
      { pattern: '^[0-9]+$', severity: BlacklistSeverity.HIGH, isRegex: true, reason: 'Uniquement des chiffres' },
      { pattern: '(.)\\\\1{3,}', severity: BlacklistSeverity.MEDIUM, isRegex: true, reason: 'Répétition excessive' },
    ];

    for (const entry of blacklist) {
      const existing = await this.blacklistRepository.findOne({
        where: { pattern: entry.pattern },
      });
      if (!existing) {
        await this.blacklistRepository.save({
          ...entry,
          isActive: true,
        });
      }
    }
  }

  private createDefaultStyle(): NicknameStyle {
    return {
      id: 'default',
      style: NicknameStyleEnum.SIMPLE_WORD,
      weight: 50,
      isActive: true,
      description: 'Style par défaut',
      allowedPatterns: null,
      preferredTransformations: null,
    } as NicknameStyle;
  }

  private createDefaultPattern(): NicknamePattern {
    return {
      id: 'default',
      patternType: PatternType.FRAGMENT_CORE,
      weight: 50,
      isActive: true,
      description: 'Pattern par défaut',
      minLengthByPart: null,
      maxLengthByPart: null,
      styleId: null,
      style: null,
    } as NicknamePattern;
  }
}
