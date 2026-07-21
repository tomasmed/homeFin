export interface CategoryStyle {
  bg: string;
  border: string;
  text: string;
  textGradient: string;
}

const DEFAULT_STYLE: CategoryStyle = {
  bg: 'rgba(107, 114, 128, 0.1)',
  border: 'rgba(107, 114, 128, 0.2)',
  text: 'rgb(107, 114, 128)',
  textGradient: 'linear-gradient(135deg, rgba(229, 231, 235, 0.4) 0%, rgba(209, 213, 219, 0.4) 100%)',
};

const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  'Food & Dining': {
    bg: 'rgba(239, 68, 68, 0.1)',
    border: 'rgba(239, 68, 68, 0.2)',
    text: 'rgb(239, 68, 68)',
    textGradient: 'linear-gradient(135deg, rgba(254, 226, 226, 0.6) 0%, rgba(252, 165, 165, 0.6) 100%)',
  },
  'Food': {
    bg: 'rgba(239, 68, 68, 0.1)',
    border: 'rgba(239, 68, 68, 0.2)',
    text: 'rgb(239, 68, 68)',
    textGradient: 'linear-gradient(135deg, rgba(254, 226, 226, 0.6) 0%, rgba(252, 165, 165, 0.6) 100%)',
  },
  'Transport': {
    bg: 'rgba(59, 130, 246, 0.1)',
    border: 'rgba(59, 130, 246, 0.2)',
    text: 'rgb(59, 130, 246)',
    textGradient: 'linear-gradient(135deg, rgba(219, 234, 254, 0.6) 0%, rgba(147, 197, 253, 0.6) 100%)',
  },
  'Transportation': {
    bg: 'rgba(59, 130, 246, 0.1)',
    border: 'rgba(59, 130, 246, 0.2)',
    text: 'rgb(59, 130, 246)',
    textGradient: 'linear-gradient(135deg, rgba(219, 234, 254, 0.6) 0%, rgba(147, 197, 253, 0.6) 100%)',
  },
  'Housing': {
    bg: 'rgba(16, 185, 129, 0.1)',
    border: 'rgba(16, 185, 129, 0.2)',
    text: 'rgb(16, 185, 129)',
    textGradient: 'linear-gradient(135deg, rgba(209, 250, 229, 0.6) 0%, rgba(110, 231, 183, 0.6) 100%)',
  },
  'Utilities': {
    bg: 'rgba(245, 158, 11, 0.1)',
    border: 'rgba(245, 158, 11, 0.2)',
    text: 'rgb(245, 158, 11)',
    textGradient: 'linear-gradient(135deg, rgba(254, 243, 199, 0.6) 0%, rgba(252, 211, 77, 0.6) 100%)',
  },
  'Entertainment': {
    bg: 'rgba(139, 92, 246, 0.1)',
    border: 'rgba(139, 92, 246, 0.2)',
    text: 'rgb(139, 92, 246)',
    textGradient: 'linear-gradient(135deg, rgba(237, 233, 254, 0.6) 0%, rgba(196, 181, 253, 0.6) 100%)',
  },
  'Health': {
    bg: 'rgba(236, 72, 153, 0.1)',
    border: 'rgba(236, 72, 153, 0.2)',
    text: 'rgb(236, 72, 153)',
    textGradient: 'linear-gradient(135deg, rgba(253, 242, 248, 0.6) 0%, rgba(244, 114, 182, 0.6) 100%)',
  },
  'Shopping': {
    bg: 'rgba(20, 184, 166, 0.1)',
    border: 'rgba(20, 184, 166, 0.2)',
    text: 'rgb(20, 184, 166)',
    textGradient: 'linear-gradient(135deg, rgba(204, 251, 241, 0.6) 0%, rgba(94, 234, 212, 0.6) 100%)',
  },
  'Income': {
    bg: 'rgba(34, 197, 94, 0.1)',
    border: 'rgba(34, 197, 94, 0.2)',
    text: 'rgb(34, 197, 94)',
    textGradient: 'linear-gradient(135deg, rgba(220, 252, 231, 0.6) 0%, rgba(134, 239, 172, 0.6) 100%)',
  },
  'Transfer': {
    bg: 'rgba(99, 102, 241, 0.1)',
    border: 'rgba(99, 102, 241, 0.2)',
    text: 'rgb(99, 102, 241)',
    textGradient: 'linear-gradient(135deg, rgba(224, 231, 255, 0.6) 0%, rgba(165, 180, 252, 0.6) 100%)',
  },
};

export function getCategoryPillStyles(categoryName: string): CategoryStyle {
  if (!categoryName) return DEFAULT_STYLE;
  const match = Object.keys(CATEGORY_STYLES).find(
    k => k.toLowerCase() === categoryName.toLowerCase()
  );
  return match ? CATEGORY_STYLES[match] : DEFAULT_STYLE;
}
