/**
 * Account Data Types
 * 
 * Defines the structure for user account data.
 * All fields are optional to maintain lightweight UX.
 */

export type SupportStyle = 'gentle' | 'direct' | 'balanced';

export interface AccountData {
    name?: string;
    pronouns?: string;
    supportStyle?: SupportStyle;
}

export const SUPPORT_STYLES = {
    gentle: {
        label: 'Gentle & reflective',
        description: 'Thoughtful, empathetic responses that encourage self-reflection'
    },
    direct: {
        label: 'Direct & practical',
        description: 'Clear, actionable guidance focused on solutions'
    },
    balanced: {
        label: 'Balanced',
        description: 'A mix of empathy and practical support'
    }
} as const;

export const PRONOUN_OPTIONS = [
    { value: '', label: 'Prefer not to say' },
    { value: 'they/them', label: 'They/Them' },
    { value: 'she/her', label: 'She/Her' },
    { value: 'he/him', label: 'He/Him' },
    { value: 'other', label: 'Other' },
] as const;
