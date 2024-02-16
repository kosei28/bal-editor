import { useCallback, useState } from 'react';
import { Editor } from '@tiptap/core';
import { EditorProvider } from '@tiptap/react';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import History from '@tiptap/extension-history';
import Placeholder from '@tiptap/extension-placeholder';
import './editor.css';

const extensions = [
    Document,
    Paragraph,
    Text,
    History,
    Placeholder.configure({ placeholder: 'Enter some text...' }),
];

export default function MyEditor() {
    const [scrollTimeoutId, setScrollTimeoutId] = useState<
        number | undefined
    >();

    const scrollToCaret = useCallback(
        (editor: Editor) => {
            if (editor.state.selection.empty) {
                const pos = editor.state.selection.$anchor.pos;
                const coords = editor.view.coordsAtPos(pos);
                const diff =
                    coords.top + 24 - document.documentElement.clientHeight / 2;

                window.scrollBy({
                    top: diff,
                    behavior: 'smooth',
                });

                const timeoutId = setTimeout(() => scrollToCaret(editor), 100);
                setScrollTimeoutId(timeoutId);
            } else {
                clearTimeout(scrollTimeoutId);
                setScrollTimeoutId(undefined);
            }
        },
        [scrollTimeoutId]
    );

    return (
        <EditorProvider
            extensions={extensions}
            onSelectionUpdate={({ editor }) => {
                if (scrollTimeoutId === undefined) {
                    scrollToCaret(editor);
                }
            }}
        >
            <></>
        </EditorProvider>
    );
}
