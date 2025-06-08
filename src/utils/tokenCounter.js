import { countTokens } from 'gpt-tokenizer/encoding/o200k_base';

export const tokensOf = (text = '') => countTokens(text);