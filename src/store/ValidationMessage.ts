export type ValidationMessage = {
    label: string
    type: string
}

export function validateRegex(regexp: string | null): ValidationMessage | null {
    if (!regexp) {
        return null
    }

    try {
        RegExp(regexp)
        return null
    } catch (err) {
        const error = err as Error
        return {
            label: error.message,
            type: 'error',
        }
    }
}
