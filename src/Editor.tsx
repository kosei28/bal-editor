import { useCallback, useEffect, useRef, useState } from 'react';
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
    Placeholder.configure({ placeholder: 'Hello...' }),
];

export default function MyEditor() {
    const ref = useRef<HTMLDivElement>(null);
    const [editorHeight, setEditorHeight] = useState<number | undefined>();

    const scrollToCaret = useCallback((editor: Editor) => {
        const pos = editor.state.selection.$anchor.pos;
        const { node, offset } = editor.view.domAtPos(pos);
        const range = document.createRange();

        if (offset === 0) {
            range.setStart(node, offset);
            range.setEnd(node, offset + 1);
        } else {
            range.setStart(node, offset - 1);
            range.setEnd(node, offset);
        }

        const rect = range.getBoundingClientRect();
        const caretCenterY = (rect.top + rect.bottom) / 2;
        const diff =
            caretCenterY - ref.current!.getBoundingClientRect().height / 2;

        if (editor.state.selection.empty) {
            ref.current!.scrollBy({
                top: diff,
                behavior: 'smooth',
            });
        }
    }, []);

    useEffect(() => {
        const resizeHandler = () => {
            setEditorHeight(window.visualViewport?.height);
        };

        resizeHandler();
        window.visualViewport?.addEventListener('resize', resizeHandler);

        return () => {
            window.visualViewport?.removeEventListener('resize', resizeHandler);
        };
    }, []);

    useEffect(() => {
        const element = ref.current!;

        const copyHandler = (event: ClipboardEvent) => {
            if (event.clipboardData === null) {
                return;
            }

            const html = event.clipboardData.getData('text/html');
            const doc = new DOMParser().parseFromString(html, 'text/html');
            const texts: string[] = [];

            for (const node of doc.body.childNodes) {
                texts.push(node.textContent ?? '');
            }

            event.clipboardData.setData('text/plain', texts.join('\n'));
            event.clipboardData.clearData('text/html');
        };

        element.addEventListener('copy', copyHandler);

        return () => {
            element.removeEventListener('copy', copyHandler);
        };
    }, []);

    return (
        <div
            ref={ref}
            className="editor-container"
            style={
                {
                    '--editor-height': `${editorHeight}px`,
                } as React.CSSProperties
            }
        >
            <EditorProvider
                extensions={extensions}
                onSelectionUpdate={({ editor }) => {
                    scrollToCaret(editor);
                }}
            >
                <></>
            </EditorProvider>
        </div>
    );
}
