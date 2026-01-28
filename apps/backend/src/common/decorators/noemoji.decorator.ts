import { Matches } from 'class-validator';

export function NoEmoji(message = 'Emojis are not allowed'): PropertyDecorator {
  return Matches(/^[^\p{Extended_Pictographic}]*$/u, {
    message,
  });
}
