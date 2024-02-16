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
    return (
        <EditorProvider
            extensions={extensions}
            onSelectionUpdate={({ editor }) => {
                const pos = editor.state.selection.$anchor.pos;
                const coords = editor.view.coordsAtPos(pos);
                const diff =
                    coords.top + 24 - document.documentElement.clientHeight / 2;
                window.scrollBy({
                    top: diff / 10,
                    behavior: 'smooth',
                });
            }}
        >
            <></>
        </EditorProvider>
    );
}
