import { defineStore } from 'pinia'
import { nextTick, ref, watch } from 'vue'
import type { YnabEntry } from './YnabEntry.ts'
import { validateRegex, type ValidationMessage } from './ValidationMessage.ts'

const STATE_HYDRATION_KEY = '__INIT_STATE__'

// ----------------------------------------------------------------------------
// Store
// ----------------------------------------------------------------------------

export type PayeeRenameRule = {
    payeeRegex: string | null
    newName: string | null
    newMemo: string | null
}

export type SettingsState = {
    payeeRenameRules: Array<PayeeRenameRule>
}

function createDefaultState(): SettingsState {
    return {
        payeeRenameRules: [],
    }
}

export const useSettingsStore = defineStore('SettingsStore', () => {
    const settingsState = ref<SettingsState>(createDefaultState())

    const errorMessages = ref<Array<ValidationMessage>>([])
    const validate = () => {
        errorMessages.value = []

        for (const renameRule of settingsState.value.payeeRenameRules) {
            const regexError = validateRegex(renameRule.payeeRegex)
            if (regexError) {
                errorMessages.value.push(regexError)
            }
        }
    }

    const hasUnsavedChanges = ref(false)
    watch(settingsState, () => {
        hasUnsavedChanges.value = true
    }, {
        deep: true,
    })

    const load = async () => {
        try {
            console.groupCollapsed(__NAME__, 'load')

            const stateString = await GM.getValue(STATE_HYDRATION_KEY, '{}')
            console.info('getValue')
            console.info(stateString)

            const parsedState = JSON.parse(stateString) as Partial<SettingsState>
            settingsState.value = {
                ...createDefaultState(),
                ...parsedState,
            }

            await nextTick()
            errorMessages.value = []
            hasUnsavedChanges.value = false
        } catch (err) {
            console.warn(err)
        } finally {
            console.groupEnd()
        }
    }

    const save = async () => {
        try {
            console.groupCollapsed(__NAME__, 'save')

            validate()
            if (errorMessages.value.length > 0) {
                console.info(JSON.stringify(errorMessages.value))
                return
            }

            const stateString = JSON.stringify(settingsState.value)
            await GM.setValue(STATE_HYDRATION_KEY, stateString)
            console.info('setValue')
            console.info(stateString)

            await nextTick()
            errorMessages.value = []
            hasUnsavedChanges.value = false
        } catch (err) {
            console.warn(err)
        } finally {
            console.groupEnd()
        }
    }

    const addPayeeRenameRule = () => {
        settingsState.value.payeeRenameRules.push({
            payeeRegex: null,
            newName: null,
            newMemo: null,
        })
    }
    const deletePayeeRenameRule = (idx: number) => {
        settingsState.value.payeeRenameRules.splice(idx, 1)
    }

    const renamePayee = (transaction: YnabEntry): YnabEntry => {
        for (const renameRule of settingsState.value.payeeRenameRules) {
            if (!renameRule.payeeRegex) {
                continue
            }
            if (!renameRule.newName) {
                continue
            }

            const re = new RegExp(renameRule.payeeRegex)
            if (re.test(transaction.payee)) {
                return {
                    ...transaction,
                    payee: renameRule.newName,
                    memo: renameRule.newMemo ?? '',
                }
            }
        }

        return transaction
    }

    return {
        errorMessages,
        validate,

        settingsState,
        hasUnsavedChanges,
        load,
        save,

        addPayeeRenameRule,
        deletePayeeRenameRule,
        renamePayee,
    }
})
