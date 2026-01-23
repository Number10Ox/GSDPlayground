import { motion, AnimatePresence } from 'framer-motion';

interface TypewriterTextProps {
  text: string;
  isStreaming: boolean;
}

/**
 * renderWithBold - Renders text with **bold** markdown converted to styled spans.
 * Bold text is highlighted in amber to draw attention to key words.
 */
function renderWithBold(text: string): (string | JSX.Element)[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const content = part.slice(2, -2);
      return <span key={i} className="text-amber-200 font-semibold">{content}</span>;
    }
    return part;
  });
}

/**
 * TypewriterText - Prose-style narrative display with blinking cursor during streaming.
 * Distinguishes player speech (gray-300) and NPC speech (gray-100) by [Player]/[Name] prefixes.
 * Uses framer-motion for cursor blink animation only (not per-character).
 */
export function TypewriterText({ text, isStreaming }: TypewriterTextProps) {
  // Parse text into segments: player vs NPC speech
  const segments = parseDialogueSegments(text);

  return (
    <div className="prose prose-invert max-w-none" data-testid="dialogue-text">
      <div className="text-sm leading-relaxed whitespace-pre-wrap">
        {segments.map((segment, index) => (
          <span
            key={index}
            className={
              segment.isPlayer
                ? 'text-gray-300 font-normal'
                : 'text-gray-100 font-medium'
            }
          >
            {renderWithBold(segment.text)}
          </span>
        ))}
        <AnimatePresence>
          {isStreaming && (
            <motion.span
              initial={{ opacity: 1 }}
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              exit={{ opacity: 0 }}
              className="text-amber-400 font-bold ml-0.5"
            >
              _
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

interface DialogueSegment {
  text: string;
  isPlayer: boolean;
}

/**
 * parseDialogueSegments - Splits dialogue text into player and NPC segments.
 * Player lines start with "[Player]:" prefix.
 * Everything else is treated as NPC speech.
 */
function parseDialogueSegments(text: string): DialogueSegment[] {
  if (!text) return [];

  const segments: DialogueSegment[] = [];
  // Split on [Player] or [Name] prefixes
  const parts = text.split(/(\[Player\]:)/);

  let isPlayer = false;
  for (const part of parts) {
    if (part === '[Player]:') {
      isPlayer = true;
      segments.push({ text: part, isPlayer: true });
    } else if (part) {
      // Check if this part starts with an NPC name pattern [Name]:
      const npcMatch = part.match(/^(\[[^\]]+\]:)([\s\S]*)/);
      if (npcMatch && !isPlayer) {
        segments.push({ text: part, isPlayer: false });
      } else {
        segments.push({ text: part, isPlayer });
      }
      // Reset after the content following [Player]:
      if (isPlayer && !part.match(/^\s*$/)) {
        isPlayer = false;
      }
    }
  }

  return segments.length > 0 ? segments : [{ text, isPlayer: false }];
}
