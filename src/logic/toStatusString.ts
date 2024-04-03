export function toStatusString(success: boolean, error: boolean) {
    if(success === error) {
        return undefined
    }

    return success ? 'success' : 'error'
}
