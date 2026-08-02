<template>
  <div class="luma-rich-editor" :class="{ 'is-focused': focused, 'is-disabled': disabled }">
    <div v-if="editor && !readonly" class="luma-rich-editor__toolbar">
      <button
        type="button"
        :class="{ active: editor.isActive('bold') }"
        :disabled="disabled"
        title="Bold"
        @click="editor.chain().focus().toggleBold().run()"
      >
        <LIcon name="bold" size="xs" />
      </button>
      <button
        type="button"
        :class="{ active: editor.isActive('italic') }"
        :disabled="disabled"
        title="Italic"
        @click="editor.chain().focus().toggleItalic().run()"
      >
        <LIcon name="italic" size="xs" />
      </button>
      <button
        type="button"
        :class="{ active: editor.isActive('heading', { level: 2 }) }"
        :disabled="disabled"
        title="Heading"
        @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
      >
        <LIcon name="heading-2" size="xs" />
      </button>
      <button
        type="button"
        :class="{ active: editor.isActive('bulletList') }"
        :disabled="disabled"
        title="Bullet list"
        @click="editor.chain().focus().toggleBulletList().run()"
      >
        <LIcon name="list" size="xs" />
      </button>
      <button
        type="button"
        :class="{ active: editor.isActive('orderedList') }"
        :disabled="disabled"
        title="Ordered list"
        @click="editor.chain().focus().toggleOrderedList().run()"
      >
        <LIcon name="list-ordered" size="xs" />
      </button>
      <button
        type="button"
        :class="{ active: editor.isActive('taskList') }"
        :disabled="disabled"
        title="Checklist"
        @click="editor.chain().focus().toggleTaskList().run()"
      >
        <LIcon name="list-checks" size="xs" />
      </button>
      <button
        type="button"
        :class="{ active: editor.isActive('code') }"
        :disabled="disabled"
        title="Code"
        @click="editor.chain().focus().toggleCode().run()"
      >
        <LIcon name="code" size="xs" />
      </button>
      <button type="button" :disabled="disabled" title="Link" @click="setLink">
        <LIcon name="link" size="xs" />
      </button>
    </div>
    <EditorContent :editor="editor" class="luma-rich-editor__content" />
  </div>
</template>

<script setup>
import { onBeforeUnmount, ref, watch } from 'vue';
import { EditorContent, useEditor } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { TaskItem, TaskList } from '@tiptap/extension-list';
import LIcon from './l-icon.vue';

/**
 * LRichEditor — TipTap rich text field for Luma forms.
 *
 *     <LRichEditor v-model="html" placeholder="Write notes…" />
 */
const props = defineProps({
    modelValue: { type: String, default: '' },
    placeholder: { type: String, default: 'Write…' },
    disabled: { type: Boolean, default: false },
    readonly: { type: Boolean, default: false },
    minHeight: { type: String, default: '120px' },
    linkPrompt: { type: String, default: 'URL' },
});

const emit = defineEmits(['update:modelValue']);

const focused = ref(false);

const editor = useEditor({
    content: props.modelValue || '',
    editable: !props.disabled && !props.readonly,
    extensions: [
        StarterKit,
        Link.configure({ openOnClick: false }),
        Placeholder.configure({ placeholder: props.placeholder }),
        TaskList,
        TaskItem.configure({ nested: true }),
    ],
    onUpdate: ({ editor: ed }) => {
        const html = ed.getHTML();
        emit('update:modelValue', html === '<p></p>' ? '' : html);
    },
    onFocus: () => { focused.value = true; },
    onBlur: () => { focused.value = false; },
});

watch(
    () => props.modelValue,
    (val) => {
        if (!editor.value) return;
        const current = editor.value.getHTML();
        const next = val || '';
        if (next !== current && next !== (current === '<p></p>' ? '' : current)) {
            editor.value.commands.setContent(next, false);
        }
    },
);

watch(
    () => [props.disabled, props.readonly],
    ([disabled, readonly]) => {
        editor.value?.setEditable(!disabled && !readonly);
    },
);

const setLink = () => {
    if (!editor.value) return;
    const prev = editor.value.getAttributes('link').href || '';
    const url = window.prompt(props.linkPrompt, prev);
    if (url === null) return;
    if (url === '') {
        editor.value.chain().focus().extendMarkRange('link').unsetLink().run();
        return;
    }
    editor.value.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
};

onBeforeUnmount(() => editor.value?.destroy());
</script>

<style lang="scss">
.luma-rich-editor {
    --luma-rich-min-h: v-bind(minHeight);
    border: 1px solid var(--px-border);
    border-radius: var(--px-radius-md, 12px);
    background: var(--px-surface);
    overflow: hidden;
    transition: border-color 0.15s ease;

    &.is-focused {
        border-color: color-mix(in srgb, var(--px-primary) 45%, var(--px-border));
    }

    &.is-disabled {
        opacity: 0.65;
        pointer-events: none;
    }

    &__toolbar {
        display: flex;
        flex-wrap: wrap;
        gap: 0.25rem;
        padding: 0.4rem 0.5rem;
        border-bottom: 1px solid var(--px-border);
        background: var(--px-surface-muted);

        button {
            appearance: none;
            border: 0;
            background: transparent;
            width: 1.85rem;
            height: 1.85rem;
            border-radius: 8px;
            display: grid;
            place-items: center;
            cursor: pointer;
            color: var(--px-text-soft, var(--px-text-muted));

            &:hover,
            &.active {
                background: var(--px-surface-strong);
                color: var(--px-primary);
            }
        }
    }

    &__content {
        min-height: var(--luma-rich-min-h);

        .tiptap {
            outline: none;
            padding: 0.75rem 0.9rem;
            min-height: var(--luma-rich-min-h);
            font-size: 0.9rem;
            line-height: 1.6;
            color: var(--px-text);

            p.is-editor-empty:first-child::before {
                color: var(--px-text-muted);
                content: attr(data-placeholder);
                float: inline-start;
                height: 0;
                pointer-events: none;
            }

            ul,
            ol {
                padding-inline-start: 1.25rem;
            }

            ul[data-type='taskList'] {
                list-style: none;
                padding-inline-start: 0;
                margin: 0.35rem 0;

                li {
                    display: flex;
                    align-items: flex-start;
                    gap: 0.45rem;
                    margin: 0.2rem 0;

                    > label {
                        flex-shrink: 0;
                        margin-top: 0.2rem;
                        display: inline-flex;
                    }

                    > div {
                        flex: 1;
                        min-width: 0;
                    }

                    input[type='checkbox'] {
                        width: 0.95rem;
                        height: 0.95rem;
                        accent-color: var(--px-primary);
                        cursor: pointer;
                    }
                }
            }

            a {
                color: var(--px-primary);
                text-decoration: underline;
            }
        }
    }
}
</style>
