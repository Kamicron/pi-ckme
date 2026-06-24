import { Injectable } from '@nestjs/common';

export interface PortraitAttributes {
  faceShape: string;
  gender: string;
  hairStyle: string;
  hairColor: string;
  eyeShape: string;
  ethnicFeatures: string;
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

  // Hair colors (separate from style)
  private readonly hairColors: Record<string, string[]> = {
    'european': ['platinum blonde', 'golden blonde', 'strawberry blonde', 'light brown', 'chestnut brown', 'auburn red', 'dark blonde', 'ash brown', 'copper', 'honey brown'],
    'african': ['jet black', 'deep black', 'dark brown', 'black', 'dark auburn', 'warm black', 'brown-black'],
    'asian': ['jet black', 'soft black', 'dark brown', 'black', 'black with subtle brown highlights', 'dark chocolate brown'],
    'hispanic': ['dark brown', 'black', 'brown-black', 'caramel brown', 'deep brown', 'warm brown', 'black with brown undertones'],
    'middle_eastern': ['dark brown', 'black', 'chestnut brown', 'brown-black', 'deep auburn', 'warm black', 'dark chocolate'],
    'south_asian': ['black', 'dark brown', 'deep brown', 'brown-black', 'warm black', 'dark chestnut'],
    'default': ['black', 'brown', 'blonde', 'dark blonde', 'light brown', 'auburn', 'dark brown'],
  };

  // Hair styles (pure style, no color)
  private readonly baseHairStyles: Record<string, {
    male: string[];
    female: string[];
  }> = {
    'european': {
      male: ['short cropped', 'medium wavy', 'short textured with volume', 'short neat with side part', 'medium slicked back', 'short fade', 'medium layered'],
      female: ['long straight', 'medium wavy with soft curls', 'long curly voluminous', 'short bob', 'long layered', 'shoulder-length straight', 'medium curly', 'short pixie'],
    },
    'african': {
      male: ['short tight curls', 'short afro texture', 'faded sides with textured top', 'short coiled hair', 'neat short curls', 'short cropped'],
      female: ['voluminous natural curls', 'long coiled hair', 'afro hairstyle', 'braided styles', 'twist-out curls', 'short curly hair'],
    },
    'asian': {
      male: ['short neat', 'medium straight', 'textured', 'layered', 'short side-swept'],
      female: ['long straight', 'medium straight', 'straight with bangs', 'layered', 'long silky', 'medium with bangs'],
    },
    'hispanic': {
      male: ['dark wavy', 'medium curly', 'thick', 'short textured', 'wavy', 'medium layered'],
      female: ['long wavy', 'voluminous curls', 'long brown wavy', 'thick', 'medium curls', 'long layered'],
    },
    'middle_eastern': {
      male: ['thick', 'curly', 'wavy', 'textured', 'medium', 'short wavy'],
      female: ['long thick', 'voluminous wavy', 'long curly', 'thick', 'luxurious', 'long straight'],
    },
    'south_asian': {
      male: ['thick', 'wavy', 'short textured', 'curly', 'thick medium'],
      female: ['long thick', 'voluminous', 'long wavy', 'thick straight', 'long silky', 'medium wavy'],
    },
    'default': {
      male: ['short', 'medium', 'wavy', 'straight', 'textured'],
      female: ['long', 'medium wavy', 'straight', 'curly', 'layered'],
    }
  };

  // Detailed ethnic facial feature profiles
  private readonly ethnicFeatureProfiles: Record<string, string[]> = {
    'european': [
      'prominent high nose bridge, narrower oval eyes, medium-thin lips, defined cheekbones',
      'straight narrow nose, blue or green light eyes, soft jawline, fair thin lips',
      'delicate pointed nose, deep-set eyes, refined chin, high prominent cheekbones',
      'aquiline nose, hooded eyes, strong brow ridge, angular facial structure',
      'soft rounded nose, wide-set light eyes, gentle cheekbones, smooth jawline',
    ],
    'african': [
      'broad flat nose with wide nostrils, full lips, deep-set dark brown eyes, strong jawline, prominent cheekbones',
      'wide nose bridge, very full lips, almond-shaped dark eyes, rounded strong jaw, high cheekbones',
      'broad nostrils, thick full lips, large expressive dark eyes, broad face shape, powerful cheekbones',
      'flat wide nose, pronounced full lips, warm brown eyes, strong chin, sculpted cheekbones',
      'round broad nose, full lower lip, dark soulful eyes, soft but wide jawline, high full cheeks',
    ],
    'asian': [
      'flat nose bridge with low profile, almond-shaped single-lidded eyes, medium-thin lips, soft rounded cheekbones',
      'small flat nose, slight upward eye tilt, dark brown almond eyes, smooth jawline, subtle cheekbones',
      'low wide nose bridge, monolid eyes with straight brows, thin lips, rounded face with soft cheeks',
      'short nose with rounded tip, narrow upward-slanted eyes, small lips, delicate chin, soft facial contour',
      'flat nose with soft nostrils, hooded almond eyes, medium lips, gentle jawline, smooth complexion',
    ],
    'hispanic': [
      'defined medium nose, warm brown eyes, medium full lips, strong cheekbones, angular jaw',
      'straight nose with soft tip, almond-shaped brown eyes, full lips, warm tan skin, soft jawline',
      'slightly broad nose bridge, dark warm eyes, medium-thick lips, high cheekbones, defined chin',
      'medium nose with rounded tip, deep-set brown eyes, full lower lip, strong brows, soft angular jaw',
      'arched nose, expressive brown eyes, medium full lips, warm complexion, balanced cheekbones',
    ],
    'middle_eastern': [
      'prominent curved nose with defined bridge, thick dark eyebrows, almond-shaped dark eyes, strong jawline, full lips',
      'hawk nose, thick arched brows, deep-set brown eyes, angular cheekbones, medium full lips',
      'large aquiline nose, thick straight eyebrows, almond dark eyes, strong chin, full lips',
      'curved nose with rounded tip, bushy dark brows, warm brown eyes, high cheekbones, defined jaw',
      'strong nose bridge, thick eyebrows, narrow dark eyes, chiseled jawline, medium full lips',
    ],
    'south_asian': [
      'broad nose with rounded tip, large dark brown eyes, full lips, soft rounded jaw, warm full cheeks',
      'straight medium nose, big expressive dark eyes, thick eyebrows, full lips, smooth tan skin',
      'wide nose with soft bridge, large warm eyes, full lower lip, rounded cheekbones, gentle jawline',
      'rounded nose tip, dark almond-shaped eyes, full lips, soft facial features, warm complexion',
      'medium broad nose, big soulful dark eyes, thick natural brows, full lips, rounded face shape',
    ],
    'default': [
      'balanced facial proportions, medium nose, medium lips, neutral eye shape, soft cheekbones',
      'average features, straight nose, medium-sized eyes, natural jawline, subtle cheekbones',
      'soft defined features, medium nose bridge, gentle eyes, medium lips, balanced face',
    ],
  };

  // Eye shape variations
  private readonly eyeShapeOptions: Record<string, string[]> = {
    'european': ['almond-shaped', 'deep-set', 'hooded', 'round blue', 'slightly narrow'],
    'african': ['large almond-shaped', 'wide-set', 'deep brown', 'rounded dark', 'expressive large'],
    'asian': ['almond-shaped monolid', 'slightly upward-tilted', 'hooded narrow', 'small almond', 'straight-lidded'],
    'hispanic': ['almond-shaped warm', 'deep-set brown', 'slightly rounded', 'warm expressive', 'medium almond'],
    'middle_eastern': ['almond-shaped dark', 'deep-set', 'narrow intense', 'hooded dark', 'slightly downturned'],
    'south_asian': ['large almond-shaped', 'big expressive dark', 'round dark', 'deep-set brown', 'warm large'],
    'default': ['almond-shaped', 'medium round', 'neutral', 'slightly deep-set', 'balanced'],
  };

  // Ethnicity-based configurations
  private readonly ethnicityConfigs: Record<string, {
    skinTones: string[];
    featureVariations: string[];
  }> = {
    'european': {
      skinTones: ['fair skin with subtle pink undertones', 'light beige skin', 'porcelain skin', 'light olive skin', 'medium fair skin', 'pale ivory skin', 'rosy fair skin', 'warm ivory skin'],
      featureVariations: ['straight nose bridge', 'slightly narrower eyes', 'defined cheekbones', 'softer jawline', 'lighter eye colors'],
    },
    'african': {
      skinTones: ['deep brown skin', 'rich dark skin', 'warm brown skin', 'dark chocolate skin', 'ebony skin', 'dark mahogany skin', 'deep chestnut skin', 'warm dark brown skin'],
      featureVariations: ['broader nose', 'full lips', 'wider set eyes', 'prominent cheekbones', 'strong jawline'],
    },
    'asian': {
      skinTones: ['light yellow undertone skin', 'medium beige skin', 'warm tan skin', 'light olive skin', 'pale ivory skin', 'soft porcelain skin', 'golden beige skin', 'light golden skin'],
      featureVariations: ['flatter nose bridge', 'almond-shaped eyes', 'wider cheekbones', 'softer facial features', 'single eyelid or slight double eyelid'],
    },
    'hispanic': {
      skinTones: ['warm olive skin', 'medium tan skin', 'light brown skin', 'bronze skin', 'warm beige skin', 'caramel skin', 'golden brown skin', 'deep olive skin'],
      featureVariations: ['defined nose bridge', 'warm brown eyes', 'medium full lips', 'strong cheekbones', 'slightly angular jaw'],
    },
    'middle_eastern': {
      skinTones: ['olive skin', 'warm tan skin', 'light brown skin', 'golden beige skin', 'medium olive skin', 'honey beige skin', 'warm bronze skin', 'pale olive skin'],
      featureVariations: ['prominent nose', 'thick eyebrows', 'almond eyes', 'strong features', 'defined facial structure'],
    },
    'south_asian': {
      skinTones: ['warm brown skin', 'medium brown skin', 'deep tan skin', 'rich brown skin', 'warm golden skin', 'warm caramel skin', 'golden brown skin', 'deep bronze skin'],
      featureVariations: ['broader nose', 'large expressive eyes', 'full eyebrows', 'soft rounded features', 'warm dark eyes'],
    },
    'default': {
      skinTones: ['medium skin tone', 'warm skin tone', 'neutral skin tone', 'light medium skin', 'olive skin', 'golden skin', 'beige skin', 'tan skin'],
      featureVariations: ['balanced features', 'neutral proportions', 'natural facial structure', 'soft defined features', 'classic proportions'],
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
    
    // Hair color and style based on ethnicity and gender
    const ethnicHairColors = this.hairColors[normalizedEthnicity] || this.hairColors['default'];
    const hairColor = this.getRandomElement(ethnicHairColors);
    
    const ethnicHairStyles = this.baseHairStyles[normalizedEthnicity] || this.baseHairStyles['default'];
    const genderHairStyles = gender === 'male' ? ethnicHairStyles.male : ethnicHairStyles.female;
    const hairStyle = this.getRandomElement(genderHairStyles);

    // Ethnic facial features and eye shape
    const ethnicProfiles = this.ethnicFeatureProfiles[normalizedEthnicity] || this.ethnicFeatureProfiles['default'];
    const ethnicFeatures = this.getRandomElement(ethnicProfiles);
    
    const eyeShapes = this.eyeShapeOptions[normalizedEthnicity] || this.eyeShapeOptions['default'];
    const eyeShape = this.getRandomElement(eyeShapes);

    const attributes: PortraitAttributes = {
      faceShape,
      gender: gender === 'male' ? 'male' : 'female',
      hairStyle,
      hairColor,
      eyeShape,
      ethnicFeatures,
      featureVariation,
      skinTone,
      tshirtColor,
    };

    const prompt = this.buildPrompt(attributes, ethnicityName);

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

  private getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  private buildPrompt(attrs: PortraitAttributes, ethnicityName: string): string {
    return `Stylized character portrait of a ${ethnicityName} person, 3D illustration with a hand-painted, slightly drawn look (soft stylized realism, closer to illustration than realistic 3D). The portrait MUST clearly show authentic ${ethnicityName} facial features.

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

Hair: ${attrs.hairColor} ${attrs.hairStyle}, stylized with soft painted volume.

Eye shape: ${attrs.eyeShape}, looking directly at camera.

Ethnic facial features: ${attrs.ethnicFeatures}. These features MUST be clearly visible and authentically rendered. Do not soften or westernize them.

Facial features: ${attrs.featureVariation}

Skin tone: ${attrs.skinTone}

Clothing: simple plain t-shirt, barely visible at the shoulders, solid color (${attrs.tshirtColor}), no logo.

Lighting: soft, even, studio portrait lighting, minimal shadows (like ID photo but softer).

avoid head tilt, avoid smirk, avoid uneven smile, avoid raised eyebrow

avoid exaggerated expression, avoid caricature face

avoid default Caucasian features, avoid generic European look, avoid westernized facial features, avoid pale skin if inappropriate, avoid light eyes if inappropriate, avoid high nose bridge if inappropriate

avoid photorealism, avoid plastic 3D look, avoid flat shading

each character must look like a different individual with unique proportions`;
  }
}
