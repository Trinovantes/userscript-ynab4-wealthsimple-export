<script lang="ts" setup>
import { projectTitle, projectUrl } from '../Constants.ts'
import { useSettingsStore } from '../store/useSettingsStore.ts'
import { downloadCsv } from '../utils/downloadCsv.ts'
import { getTransactions } from '../utils/getTransactions.ts'

const settingsStore = useSettingsStore()
const emit = defineEmits(['close'])
const close = () => {
    emit('close')
}

const download = () => {
    settingsStore.validate()
    if (settingsStore.errorMessages.length > 0) {
        return
    }

    const transactions = getTransactions().map((transaction) => settingsStore.renamePayee(transaction))
    downloadCsv(transactions)
}

const saveRuleChanges = async () => {
    await settingsStore.save()
}

const cancelRuleChanges = async () => {
    await settingsStore.load()
}
</script>

<template>
    <article>
        <div class="group header flex-vgap">
            <h1>
                {{ projectTitle }}
            </h1>
            <a :href="projectUrl" class="project-url">
                {{ projectUrl }}
            </a>
        </div>

        <div class="group payee-rename-rules flex-vgap">
            <div
                v-for="[idx, message] of Object.entries(settingsStore.errorMessages)"
                :key="idx"
                :class="`message ${message.type}`"
            >
                {{ message.label }}
            </div>

            <div class="rule">
                <strong>Payee (regex)</strong>
                <strong>Rename As</strong>
                <strong>Memo</strong>
                <span />
            </div>

            <div
                v-for="(renameRule, idx) in settingsStore.settingsState.payeeRenameRules"
                :key="idx"
                class="rule"
            >
                <input
                    v-model="renameRule.payeeRegex"
                    type="text"
                    placeholder="Payee"
                >
                <input
                    v-model="renameRule.newName"
                    type="text"
                    placeholder="Rename As"
                >
                <input
                    v-model="renameRule.newMemo"
                    type="text"
                    placeholder="Memo"
                >
                <button
                    class="icon-btn delete"
                    title="Delete"
                    @click="settingsStore.deletePayeeRenameRule(idx)"
                >
                    Delete
                </button>
            </div>

            <div class="flex-hgap actions">
                <button
                    class="positive"
                    @click="saveRuleChanges"
                >
                    Save Rules
                </button>
                <button
                    @click="settingsStore.addPayeeRenameRule()"
                >
                    Add Rule
                </button>
                <div
                    v-if="settingsStore.hasUnsavedChanges"
                    class="unsaved-changes"
                >
                    You have unsaved changes
                </div>
                <div class="flex-1" />
                <button
                    @click="cancelRuleChanges"
                >
                    Cancel Changes
                </button>
            </div>
        </div>

        <div class="group flex-hgap actions">
            <button
                class="positive"
                @click="download"
            >
                Download
            </button>
            <div class="flex-1" />
            <button
                @click="close"
            >
                Close
            </button>
        </div>
    </article>
</template>

<style lang="scss" scoped>
$icon-size: math.div($btn-size, 1.5);

article{
    display: grid;
    max-height: 80vh;
    overflow-y: auto;
    max-width: 600px;
    width: 50vw;
}

.group{
    padding: $padding;

    &:not(:first-child){
        border-top: $border;
    }

    &.header{
        gap: math.div($padding, 2);
    }
}

.actions{
    gap: math.div($padding, 2);
}

.message{
    padding: math.div($padding, 2) $padding;

    &.error{
        background: darkred;
        color: white;
    }

    &.success{
        background: darkgreen;
        color: white;
    }
}

.unsaved-changes{
    display: flex;
    align-items: center;
    color: red;
}

.payee-rename-rules{
    gap: math.div($padding, 2);

    button.icon-btn{
        background-size: 75% 75%;
        background-repeat: no-repeat;
        background-position: center;
        width: $icon-size;
        height: $icon-size;
        text-indent: -9999px;

        &.delete{
            background-image: url('../assets/img/delete.png');
        }
    }

    .rule{
        display: grid;
        gap: math.div($padding, 2);
        grid-template-columns: 1fr 1fr 1fr $icon-size;
        align-items: center;

        strong{
            font-weight: bold;
        }
    }
}
</style>
