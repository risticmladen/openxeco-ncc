import React, { Component } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperclip } from "@fortawesome/free-solid-svg-icons";

// Custom Toolbar Component including Font Awesome icons
export const CustomToolbar = () => (
    <div id="toolbar">
        <select className="ql-header" defaultValue="" onChange={(e) => e.persist()}>
            <option value="1">Header 1</option>
            <option value="2">Header 2</option>
            <option value="">Normal</option>
        </select>
        <button className="ql-bold" />
        <button className="ql-italic" />
        <button className="ql-underline" />
        <button className="ql-strike" />
        <button className="ql-blockquote" />
        <button className="ql-list" value="ordered" />
        <button className="ql-list" value="bullet" />
        <button className="ql-indent" value="-1" />
        <button className="ql-indent" value="+1" />
        <button className="ql-link" />
        <button className="ql-image" />
        <button className="ql-attachment">
            <FontAwesomeIcon icon={faPaperclip} />
        </button>
        <button className="ql-clean" />
    </div>
);

class PostEditor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            document: null,
        };
        this.imageHandler = this.imageHandler.bind(this);
        this.attachmentHandler = this.attachmentHandler.bind(this);
    }

    imageHandler() {
        const input = document.createElement("input");
        input.setAttribute("type", "file");
        input.setAttribute("accept", "image/*");
        input.click();

        input.onchange = async () => {
            const file = input.files[0];
            const maxSize = 60 * 1024; // 60 KB in bytes

            if (file.size > maxSize) {
                alert("Image size should be less than 60 KB.");
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const quill = this.quillRef.getEditor();
                const range = quill.getSelection();
                quill.insertEmbed(range.index, "image", e.target.result);
            };
            reader.readAsDataURL(file);
        };
    }

    attachmentHandler() {
        const input = document.createElement("input");
        input.setAttribute("type", "file");
        input.setAttribute("accept", ".pdf,.doc,.docx");
        input.click();

        input.onchange = () => {
            const file = input.files[0];
            const maxSize = 5 * 1024 * 1024; // 5 MB in bytes

            if (file.size > maxSize) {
                alert("File size should be less than 5 MB.");
                return;
            }

            this.setState({ document: file });
            this.props.setNewPostDocument(file); // Set document in parent component
        };
    }

    render() {
        const modules = {
            toolbar: {
                container: "#toolbar",
                handlers: {
                    image: this.imageHandler,
                    attachment: this.attachmentHandler,
                },
            },
        };

        return (
            <div>
                <CustomToolbar />
                <ReactQuill
                    ref={(el) => { this.quillRef = el; }}
                    value={this.props.postText}
                    onChange={this.props.handleTextChange}
                    modules={modules}
                />
                {this.state.document && (
                    <p>
                        Document: {this.state.document.name} ({this.state.document.type})
                    </p>
                )}
            </div>
        );
    }
}

export default PostEditor;
