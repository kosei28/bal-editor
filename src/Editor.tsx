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
    const [fontSize, setFontSize] = useState<number>(48);
    const [scrollTimeoutId, setScrollTimeoutId] = useState<
        number | undefined
    >();

    const scrollToCaret = useCallback(
        (editor: Editor) => {
            const pos = editor.state.selection.$anchor.pos;
            const coords = editor.view.coordsAtPos(pos);
            const diff =
                coords.top +
                fontSize / 2 -
                ref.current!.getBoundingClientRect().height / 2;

            if (Math.abs(diff) > 1 && editor.state.selection.empty) {
                ref.current!.scrollBy({
                    top: Math.sign(diff) + diff / 30,
                });

                const timeoutId = setTimeout(() => scrollToCaret(editor), 1);
                setScrollTimeoutId(timeoutId);
            } else {
                clearTimeout(scrollTimeoutId);
                setScrollTimeoutId(undefined);
            }
        },
        [fontSize, scrollTimeoutId]
    );

    useEffect(() => {
        const resizeHandler = () => {
            setEditorHeight(window.visualViewport?.height);

            if (window.innerWidth > 768) {
                setFontSize(48);
            } else {
                setFontSize(32);
            }
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
            const div = document.createElement('div');
            div.innerHTML = html;

            const texts: string[] = [];
            for (const node of div.childNodes) {
                texts.push(node.textContent ?? '');
            }

            div.remove();
            event.clipboardData.setData('text/plain', texts.join('\n'));
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
                    if (scrollTimeoutId === undefined) {
                        scrollToCaret(editor);
                    }
                }}
            >
                <></>
            </EditorProvider>
        </div>
    );
}
