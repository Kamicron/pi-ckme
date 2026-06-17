import { NicknameStyle } from '../enums/nickname-style.enum';
import { PatternType } from '../enums/pattern-type.enum';

export interface NicknameResult {
  nickname: string;
  style: NicknameStyle;
  pattern: PatternType;
  transformations: string[];
  source?: string;
  length: number;
  readability: number;
}

export interface GenerationOptions {
  style?: NicknameStyle;
  pattern?: PatternType;
  minLength?: number;
  maxLength?: number;
  firstName?: string;
  lastName?: string;
  avoidTransformations?: boolean;
  seed?: string;
}
