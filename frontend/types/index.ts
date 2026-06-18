export interface PortraitAttributes {
  faceShape: string;
  gender: string;
  hairStyle: string;
  featureVariation: string;
  skinTone: string;
  tshirtColor: string;
}

export interface Portrait {
  prompt: string;
  attributes: PortraitAttributes;
}

export interface Person {
  firstName: string;
  lastName: string;
  age: number;
  gender: 'male' | 'female';
  nationality: {
    id: string;
    nameEn: string;
    nameFr: string;
  };
  ethnicity: {
    id: string;
    nameEn: string;
    nameFr: string;
  };
  photoUrl?: string;
  nickname: string;
  nicknameMeta?: {
    style: string;
    pattern: string;
    transformations: string[];
    readability: number;
  };
  portrait?: Portrait;
}
