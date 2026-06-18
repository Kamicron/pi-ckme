import { Injectable } from '@nestjs/common';

export interface PortraitAttributes {
  faceShape: string;
  gender: string;
  hairStyle: string;
  featureVariation: string;
  skinTone: string;
  tshirtColor: string;
}

export interface PortraitPrompt {
  prompt: string;
  attributes: PortraitAttributes;
}

@Injectable()
export class PortraitGeneratorService {
  // Face shapes disponibles
  private readonly faceShapes = [
    'oval face with soft curves',
    'round face with gentle contours',
    'square face with defined jawline',
    'heart-shaped face with pointed chin',
    'diamond face with prominent cheekbones',
    'oblong face with elongated features',
    'triangular face with wider jaw',
  ];

  // T-shirt colors
  private readonly tshirtColors = [
    'navy blue', 'dark gray', 'forest green', 'burgundy', 
    'black', 'white', 'olive green', 'charcoal',
    'dark teal', 'brown', 'beige', 'dark blue'
  ];

  // Hair styles by gender
  private readonly maleHairStyles = [
    'short cropped hair',
    'short textured hair with volume',
    'medium wavy hair',
    'short curly hair',
    'medium layered hair',
    'short neat hair with side part',
    'medium messy hair',
    'short fade cut',
    'medium slicked back hair',
  ];

  private readonly femaleHairStyles = [
    'long straight hair',
    'medium wavy hair with soft curls',
    'long curly voluminous hair',
    'short bob cut',
    'long layered hair',
    'medium straight hair',
    'short pixie cut',
    'long wavy hair with loose curls',
    'shoulder-length straight hair',
    'medium curly hair',
  ];

  // Ethnicity-based configurations
  private readonly ethnicityConfigs: Record<string, {
    skinTones: string[];
    featureVariations: string[];
    hairStyles: {
      male: string[];
      female: string[];
    };
  }> = {
    'european': {
      skinTones: ['fair skin with subtle pink undertones', 'light beige skin', 'porcelain skin', 'light olive skin', 'medium fair skin'],
      featureVariations: ['straight nose bridge', 'slightly narrower eyes', 'defined cheekbones', 'softer jawline', 'lighter eye colors'],
      hairStyles: {
        male: ['straight blonde hair', 'wavy brown hair', 'dark brown hair', 'light brown hair', 'red/auburn hair'],
        female: ['long blonde hair', 'wavy light brown hair', 'straight dark blonde hair', 'chestnut brown hair', 'auburn red hair'],
      }
    },
    'african': {
      skinTones: ['deep brown skin', 'rich dark skin', 'warm brown skin', 'dark chocolate skin', 'ebony skin'],
      featureVariations: ['broader nose', 'full lips', 'wider set eyes', 'prominent cheekbones', 'strong jawline'],
      hairStyles: {
        male: ['short tight curls', 'short afro texture', 'faded sides with textured top', 'short coiled hair', 'neat short curls'],
        female: ['voluminous natural curls', 'long coiled hair', 'afro hairstyle', 'braided styles', 'twist-out curls'],
      }
    },
    'asian': {
      skinTones: ['light yellow undertone skin', 'medium beige skin', 'warm tan skin', 'light olive skin', 'pale ivory skin'],
      featureVariations: ['flatter nose bridge', 'almond-shaped eyes', 'wider cheekbones', 'softer facial features', 'single eyelid or slight double eyelid'],
      hairStyles: {
        male: ['straight black hair', 'short neat black hair', 'medium straight black hair', 'textured black hair', 'layered black hair'],
        female: ['long straight black hair', 'medium straight black hair', 'straight hair with bangs', 'layered black hair', 'long silky black hair'],
      }
    },
    'hispanic': {
      skinTones: ['warm olive skin', 'medium tan skin', 'light brown skin', 'bronze skin', 'warm beige skin'],
      featureVariations: ['defined nose bridge', 'warm brown eyes', 'medium full lips', 'strong cheekbones', 'slightly angular jaw'],
      hairStyles: {
        male: ['dark wavy hair', 'medium curly dark hair', 'thick dark hair', 'short textured dark hair', 'wavy brown hair'],
        female: ['long dark wavy hair', 'voluminous dark curls', 'long brown wavy hair', 'thick dark hair', 'medium dark curls'],
      }
    },
    'middle_eastern': {
      skinTones: ['olive skin', 'warm tan skin', 'light brown skin', 'golden beige skin', 'medium olive skin'],
      featureVariations: ['prominent nose', 'thick eyebrows', 'almond eyes', 'strong features', 'defined facial structure'],
      hairStyles: {
        male: ['thick dark hair', 'curly dark hair', 'wavy dark brown hair', 'textured dark hair', 'medium dark hair'],
        female: ['long thick dark hair', 'voluminous dark wavy hair', 'long dark curly hair', 'thick brown hair', 'luxurious dark hair'],
      }
    },
    'south_asian': {
      skinTones: ['warm brown skin', 'medium brown skin', 'deep tan skin', 'rich brown skin', 'warm golden skin'],
      featureVariations: ['broader nose', 'large expressive eyes', 'full eyebrows', 'soft rounded features', 'warm dark eyes'],
      hairStyles: {
        male: ['thick black hair', 'wavy black hair', 'short textured black hair', 'thick dark brown hair', 'curly black hair'],
        female: ['long thick black hair', 'voluminous black hair', 'long dark wavy hair', 'thick straight black hair', 'long silky black hair'],
      }
    },
    'default': {
      skinTones: ['medium skin tone', 'warm skin tone', 'neutral skin tone', 'light medium skin', 'olive skin'],
      featureVariations: ['balanced features', 'neutral proportions', 'natural facial structure', 'soft defined features', 'classic proportions'],
      hairStyles: {
        male: ['short dark hair', 'medium brown hair', 'wavy hair', 'straight hair', 'textured hair'],
        female: ['long dark hair', 'medium wavy hair', 'straight hair', 'curly hair', 'layered hair'],
      }
    }
  };

  generatePortrait(ethnicityName: string, gender: 'male' | 'female'): PortraitPrompt {
    const normalizedEthnicity = this.normalizeEthnicity(ethnicityName);
    const config = this.ethnicityConfigs[normalizedEthnicity] || this.ethnicityConfigs['default'];

    // Generate random attributes
    const faceShape = this.getRandomElement(this.faceShapes);
    const skinTone = this.getRandomElement(config.skinTones);
    const featureVariation = this.getRandomElement(config.featureVariations);
    const tshirtColor = this.getRandomElement(this.tshirtColors);
    
    // Hair style based on gender and ethnicity
    const genderHairStyles = gender === 'male' ? config.hairStyles.male : config.hairStyles.female;
    const baseHairStyle = this.getRandomElement(this.getGenderHairStyles(gender));
    const ethnicHairType = this.getRandomElement(genderHairStyles);
    const hairStyle = `${baseHairStyle}, ${ethnicHairType}`;

    const attributes: PortraitAttributes = {
      faceShape,
      gender: gender === 'male' ? 'male' : 'female',
      hairStyle,
      featureVariation,
      skinTone,
      tshirtColor,
    };

    const prompt = this.buildPrompt(attributes);

    return {
      prompt,
      attributes,
    };
  }

  private normalizeEthnicity(ethnicityName: string): string {
    const normalized = ethnicityName.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    if (normalized.includes('europeen') || normalized.includes('celtique') || normalized.includes('germanique') || normalized.includes('slave')) {
      return 'european';
    }
    if (normalized.includes('africain') || normalized.includes('subsaharien') || normalized.includes('bantou')) {
      return 'african';
    }
    if (normalized.includes('asiatique') || normalized.includes('han') || normalized.includes('sino') || normalized.includes('coreen') || normalized.includes('japonais')) {
      return 'asian';
    }
    if (normalized.includes('hispanique') || normalized.includes('latino')) {
      return 'hispanic';
    }
    if (normalized.includes('arabe') || normalized.includes('moyen-orient') || normalized.includes('berbere') || normalized.includes('persan')) {
      return 'middle_eastern';
    }
    if (normalized.includes('indien') || normalized.includes('sud-asiatique') || normalized.includes('bengali') || normalized.includes('tamoul')) {
      return 'south_asian';
    }

    return 'default';
  }

  private getGenderHairStyles(gender: 'male' | 'female'): string[] {
    return gender === 'male' ? this.maleHairStyles : this.femaleHairStyles;
  }

  private getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  private buildPrompt(attrs: PortraitAttributes): string {
    return `Stylized character portrait, 3D illustration with a hand-painted, slightly drawn look (soft stylized realism, closer to illustration than realistic 3D).

Tight close-up portrait: head and very top of shoulders only, cropped exactly at shoulders, no chest visible.

Character facing perfectly forward, head straight, no tilt, no rotation.

Eyes looking directly at the camera, centered gaze, neutral alignment.

Expression: neutral and natural, very subtle relaxed smile (closed mouth), no smirk, no asymmetry, no exaggerated emotion.

Face must be symmetrical in pose (not perfectly identical, but no expression skew).

Pure solid white background, no gradient, no environment.

Soft, clean shapes with slight stylization, subtle line-like definition in facial features.

Shading is soft and painterly, with gentle gradients and a slightly illustrated feel.

Skin has soft color variation (blush, subtle tones), natural and not plastic.

Facial features are varied and slightly asymmetrical between characters, but expression remains balanced and realistic.

Character variation: ${attrs.faceShape}

Gender: ${attrs.gender}

Hair: ${attrs.hairStyle}, stylized with soft painted volume.

Facial features: ${attrs.featureVariation}

Skin tone: ${attrs.skinTone}

Clothing: simple plain t-shirt, barely visible at the shoulders, solid color (${attrs.tshirtColor}), no logo.

Lighting: soft, even, studio portrait lighting, minimal shadows (like ID photo but softer).

avoid head tilt, avoid smirk, avoid uneven smile, avoid raised eyebrow

avoid exaggerated expression, avoid caricature face

avoid photorealism, avoid plastic 3D look, avoid flat shading

each character must look like a different individual with unique proportions`;
  }
}
