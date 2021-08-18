import React from "react";
import {removeFile } from "../../../aws_util"



class RemoveTemplate extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedFile: '', templateName: '', message: null, message: null, uploading: false,
            checking: false, setVisible: true
        }
        this.message = Object.freeze({
            REMOVE_FAILED: "Template Removal failed. Please verify Template Name corresponds to an Active Template.",
            EMPTY_FIELD: "The text field is empty. Please enter a Template Name to continue.",
            TEMPLATE_NAME_INCORRECT_FORMAT: "The template name can only contain alpha numeric characters, underscores and/or hyphens. This does not appear to be a valid Template Name. ",
            SUCCESSFUL_REMOVAL: "Sucessfully removed a template"
        });
        this.onTemplateNameChange = this.onTemplateNameChange.bind(this);
        this.onFileRemove = this.onFileRemove.bind(this);
    }

    //Render of remove template form
    render() {
		return (
			<div>
				<p className="mt-5 text-center"><b>Remove a Template</b></p>
				<p className="mt-2 text-center">Please provide the name of an existing template that you would like to remove.</p>
				{this.state.message != null ?
					<div
						className={
							this.state.message === this.message.SUCCESSFUL_REMOVAL ? "alert alert-success" : "alert alert-danger"}
						role="alert">
						{`${this.state.message}`}
					</div>
					:
					<div></div>
				}
				{this.state.checking ?
					<div className="horizontal-center">
						<div className="spinner-border text-primary" style={{ width: "3rem", height: "3rem" }}
							role="status">
							<span className="sr-only">Loading...</span>
						</div>
					</div> :
					<div></div>
				}


				<div className="row justify-content-space-evenly my-row2">
					<div className="input-group mb-2">
						<div className="input-group-prepend">
							<span className="input-group-text">Template Name</span>
						</div>
						<input
							type="text"
							id="template-nameR"
							className="form-control"
							aria-label="TemplateNameR"
							onChange={this.onTemplateNameChange}
							required>
						</input>
					</div>
				</div>

				<button className="btn btn-primary btn-block mt-5" id='RemoveTemplate' onClick={this.onFileRemove}> Remove Template </button>
			</div>
		)
	}


    /**
 	* Event handler for when the template name has changed for removing a template
 	* @param {event} - event object
 	}}
 	*/
    onTemplateNameChange(event) {
        this.setState({ templateName: event.target.value });
    }


    //Event handler for when the submit button is clicked when for removing a template
    onFileRemove() {
        let templateNameInputR = document.getElementById('template-nameR');
        let isEmptyFieldR = false;
        let isTemplateNameCorrectFormatR = true;
        let templateName = this.state['templateName'];

        this.setState({ message: null });
        //Validate template name
        if (this.isEmptyStringOrNull(templateName.trim())) {
            isEmptyFieldR = true;
            templateNameInputR.classList.add("inputError");
        } else {
            templateNameInputR.classList.remove("inputError");
        }

        if (!this.isTemplateNameFormattedCorrectly(templateName)) {
            isTemplateNameCorrectFormatR = false;
            templateNameInputR.classList.add("inputError");
        } else {
            templateNameInputR.classList.remove("inputError");
        }

        if (isEmptyFieldR) {
            this.setState({ message: this.message.EMPTY_FIELD });
        } else if (!isTemplateNameCorrectFormatR) {
            this.setState({ message: this.message.TEMPLATE_NAME_INCORRECT_FORMAT });
        } else {
            this.setState({ checking: true });
            removeFile(templateName).then(() => {
                this.setState({ message: this.message.SUCCESSFUL_REMOVAL, checking: false });
                this.props.onUploadSuccess();
            }).catch(error => {
                console.log("Remove File Error:",error);
                this.setState({ message: this.message.REMOVE_FAILED, checking: false });
            });
        }

    }

    isEmptyStringOrNull(string) {
        return string == null || string === "";
    }

    isTemplateNameFormattedCorrectly(string) {
        let templateNameRegex = /^[\-\w]*$/;
        return templateNameRegex.test(string);
    }
}

export default RemoveTemplate;