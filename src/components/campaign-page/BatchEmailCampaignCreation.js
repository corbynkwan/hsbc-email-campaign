import React from "react";
import {createBatchEmailCampaign} from "../../aws_util";
import multipleUserLogo from '../../assets/multipleUserLogo.png';
import { Link } from "react-router-dom";


class BatchEmailCampaignCreation extends React.Component {
	constructor(props) {
		super(props);
		this.state = { templateName: props.templateName, dynamicValues: props.dynamicValues, selectedFile: '', subjectLine: '', message: null, loading: false};
		this.messages = Object.freeze({
            WRONG_FILE_TYPE:   "The file does not have the correct type. Please upload a .csv file",
            BATCH_EMAIL_CREATION_FAIL:  "An error occured when creating the batch email campaign: ",
            EMPTY_FIELD: "There is at least one empty field. Please upload a correctly formatted .csv file and provide a subject line to continue.",
			SUCCESS: "Batch Email Success: "
        });

		this.onFileUpload = this.onFileUpload.bind(this);
        this.onSubjectLineChange = this.onSubjectLineChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
	}

	//Render the batch email campaign section of the campaign page 
	render() {
		return (
			<div>
				<div className="row mt-5"></div>
				<div className="row justify-content-space-evenly pl-4">
					<img src={multipleUserLogo} className="img-rounded" width="50" height="70" />
					<h5>Batch Email Campaign</h5>
				</div>
				<div className="row my-row10">
					{"Sends email to multiple email addresses and dynamic values through csv file"}
				</div>
				<div className="row my-row1">
					<div>{"Please submit a .csv file formatted similar to this: "}</div>
					<Link to="/files/Example_File.csv" target="_blank" download>&nbsp;{"example file."}</Link>
				</div>
				<div className="row justify-content-space-evenly my-row10">
					<div className="input-group mb-1">						
                	<form>
                    	<div className="form-group">
                        	<input type="file" className="form-control-file" id="fileUploadButton" onChange={this.onFileUpload}/>
                    	</div>
               		</form>
					</div>
				</div>
				<div className="row justify-content-space-evenly my-row1">
					<div className="input-group mb-2 pr-60">
					<div className="input-group-prepend"style={{"max-width":"500px"}}>							
							<span className="ellipsis input-group-text" id="inputGroup-sizing-default">Subject Line</span>
						</div>
						<input 
							type="text" 
							id="subject-line-batch-email" 
							className="form-control" 
							aria-label="subjectLineBatch" 
							aria-describedby="inputGroup-sizing-default" 
							onChange={this.onSubjectLineChange}
							required/>
					</div>
				</div>
				
				<div className="row justify-content-right my-row1 mb-1 button-spacing">
					<button 
						type="button" 
						className="btn btn-success " 
						id='button2'
						onClick={this.onSubmit}>Submit</button>
				</div>
				{this.state.loading ? 
                    <div className="horizontal-center">
                        <div className="spinner-border text-primary" style={{width: "2rem", height: "2rem"}}
                            role="status">
                        </div>
                    </div>: null
                }
				{this.state.message != null ? 
					<div id={
                        	this.state.message.includes(this.messages.SUCCESS) ? "emailSentAlert" : "emailSentFailed" }
                        className={
                            this.state.message.includes(this.messages.SUCCESS) ? "alert alert-success" : "alert alert-danger" } 
                            role="alert">
                            {`${this.state.message}`} 
                    </div>
                    :
                    <div></div>
                }
			</div>
		);
	}

	
	/**
 	* Event handler for uploading a file 
 	* @param {event} - The event object  
 	}}
 	*/
	onFileUpload(event) {
        this.setState({ selectedFile: event.target.files[0], message: null });
	}

	
	/**
 	* Event handler for uploading a file 
 	* @param {event} - The event object 
 	}}
 	*/
	onSubjectLineChange(event) {
		this.setState({subjectLine: event.target.value});
	}

	/**
 	* Event handler for the submit button being clicked  
 	* @param {event} - The event object 
 	}}
 	*/
	onSubmit(event) {
		this.setState({message: null});
        //Validate Subject Line
		let subjectLineInput = document.getElementById('subject-line-batch-email');
        let emptySubjectLine = false;
        let subjectLine = this.state['subjectLine'].trimEnd();
		
		if(this.isEmptyStringOrNull(subjectLine)) {
            subjectLineInput.classList.add("inputError");
            emptySubjectLine = true;
        } else {
            subjectLineInput.classList.remove("inputError");
        }

		//Validate File
		let allowedExtensions = /(\.csv)$/i;
        let fileInput = this.state.selectedFile;
        let filePath;

        if (fileInput) {
            filePath = fileInput.name;
        }

		let templateName = this.state.templateName;

        if (!fileInput || emptySubjectLine) {
            this.setState({message: this.messages.EMPTY_FIELD});
		} else if(!allowedExtensions.exec(filePath)){    
            this.setState({message: this.messages.WRONG_FILE_TYPE});
        } else {
            this.setState({loading: true});
            createBatchEmailCampaign(fileInput, subjectLine, templateName, this.state.dynamicValues).then((data) => {
                console.log(data);
				this.setState({ message: this.messages.SUCCESS + data.body, loading: false});
            }).catch(error => {
                console.log("Batch Email Campaign Error: " + error.message);
                this.setState({ message: error.message, loading: false});
            });    
        }
	}

	isEmptyStringOrNull(string) {
        return string == null || string === "";
    }
}

export default BatchEmailCampaignCreation