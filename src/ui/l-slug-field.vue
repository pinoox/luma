<template>
    <div class="luma-slug-field">
        <LField :id="titleFieldId" :name="titleName" :label="titleLabel" :required="titleRequired">
            <template #default="{ id }">
                <InputText
                    :id="id"
                    :model-value="title"
                    @update:model-value="onTitleChange"
                />
            </template>
        </LField>
        <LField :id="slugFieldId" :name="slugName" :label="slugLabel">
            <template #default="{ id }">
                <InputText
                    :id="id"
                    class="luma-slug-field__input"
                    dir="ltr"
                    :model-value="slug"
                    @update:model-value="onSlugChange"
                />
            </template>
        </LField>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import InputText from 'primevue/inputtext';
import { slugify, sanitizeSlug } from '../core/slug.js';
import LField from './l-field.vue';

const props = defineProps({
    title: { type: String, default: '' },
    slug: { type: String, default: '' },
    titleLabel: { type: String, required: true },
    slugLabel: { type: String, required: true },
    titleName: { type: String, default: 'title' },
    slugName: { type: String, default: 'slug' },
    titleRequired: { type: Boolean, default: true },
    titleId: { type: String, default: '' },
    slugId: { type: String, default: '' },
});

const emit = defineEmits(['update:title', 'update:slug']);

const titleFieldId = computed(() => props.titleId || 'luma-slug-title');
const slugFieldId = computed(() => props.slugId || 'luma-slug-slug');

const onTitleChange = (val) => {
    emit('update:title', val);
    emit('update:slug', slugify(val));
};

const onSlugChange = (val) => {
    emit('update:slug', sanitizeSlug(val));
};
</script>
