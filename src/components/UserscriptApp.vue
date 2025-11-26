<script lang="ts" setup>
import { ref } from 'vue'
import { projectTitle } from '../Constants.ts'
import UserscriptAppSettings from './UserscriptAppSettings.vue'

const dialogRef = ref<HTMLDialogElement | null>(null)
</script>

<template>
    <div class="userscript-ynab4-wealthsimple-export">
        <dialog
            ref="dialogRef"
        >
            <UserscriptAppSettings
                @close="dialogRef?.close()"
            />
        </dialog>

        <button
            class="export-btn"
            :title="projectTitle"
            @click="dialogRef?.showModal()"
        >
            Export
        </button>
    </div>
</template>

<style lang="scss" scoped>
button.export-btn{
    background-image: url('@img/export.png');
    background-position: center;
    background-repeat: no-repeat;
    background-size: 50% 50%;
    border-radius: 50%;
    border: $border;
    cursor: pointer;
    display: block;
    overflow: hidden;
    text-decoration: none;
    text-indent: -9999px;
    transition: 0.25s;
    width: $btn-size; height: $btn-size;

    position: fixed;
    z-index: 9999;
    bottom: $padding;
    left: $padding;

    background-color: white;
    box-shadow: rgba(11, 11, 11, 0.1) 0 2px 8px;

    &:hover{
        background-color: #eee;
        box-shadow: rgba(11, 11, 11, 0.4) 0 0px 8px;
    }
}
</style>
