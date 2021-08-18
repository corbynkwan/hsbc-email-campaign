import React from "react";
import "../../App.css";
import userLogo from '../../assets/userLogo.png';
import sendSingleEmail from '../../api-service.js';
import $ from 'jquery';

const EMAIL_FORMAT_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

class SingleEmailCampaignCreation extends React.Component {
    constructor(props) {
        super(props);
        this.messages = Object.freeze({
            INCORRECT_EMAIL_FORMAT:   "Email Address is incorrectly formatted. Please provide a correctly formatted email and try again.",
            EMAIL_CONTAINS_WHITESPACE: "Email Addresss contains whitespace. Please remove the whitespace and try again.",
            EMPTY_FIELD:  "At least one field is empty. Please fill all inputs above and try again.",
            SUCCESS: "Sucessfully sent email",
            SINGLE_EMAIL_GENERAL_ERROR: "An error occured when trying to send your email, please check the console for more details.",
            EMAIL_NOT_SES_VERIFIED: "This Email Address is not registered with this service. Please ask the team to register your email before continuing."
        });
        this.state = { 
            docHtml: '', 
            emailAddress: '' ,
            message: null,
            loading: false,
            subjectLine: "",
            templateName: this.props.templateName,
            showModal:false,
            dynamicValueObject:{},
            
        }
        
        this.handleEmailChange = this.handleEmailChange.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSubjectLineChange = this.handleSubjectLineChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleShowModal = this.handleShowModal.bind(this);
        this.hasErrors  = this.hasErrors .bind(this)
    }
    
    render() {
        return (
            <>
                <div>
                    <div className="row justify-content-space-evenly my-row mt-5 mb-2">
                        <img src={userLogo} className="img-rounded" width="30" height="30"/>
                        <h5>Single Email Campaign</h5>
                    </div>
                    <div className="row my-row10">
                    {"Sends email to specified email address with template using the given dynamic values"}
                    </div>
                    <div className="form-group">
                        <div className="row justify-content-space-evenly my-row2">
                            <div className="input-group mb-1">
                                <div className="input-group-prepend dynamic-value-key-container" >
                                    <span className="ellipsis input-group-text ">Single Email Address</span>
                                </div>
                                <input
                                    type="text"
                                    id="email-address"
                                    className="form-control"
                                    aria-label="EmailAddress"
                                    onChange={this.handleEmailChange}
                                    required>
                                </input>
                            </div>
                        </div>
                        <div className="row justify-content-space-evenly my-row2">
                            <div className="input-group mb-1">
                                <div className="input-group-prepend dynamic-value-key-container">
                                    <span className="ellipsis input-group-text">Subject Line</span>
                                </div>
                                <input
                                    type="text"
                                    id="subject-line"
                                    className="form-control"
                                    aria-label="subjectLine"
                                    onChange={this.handleSubjectLineChange}
                                    required>
                                </input>
                            </div>
                        </div>
                        {this.props.dynamicValues.length > 0 ?
                            <div className="row justify-content-space-evenly my-row2">
                                Dynamic Values
                                <div className="input-group mb-1 " >
                                    {this.createDynamicValueTextFields()}
                                </div>
                            </div> : null }
                    </div>
                    <div className="row justify-content-right my-row1 mb-1 button-spacing">
                        <button type="button" className="btn btn-success" id='button1' onClick={this.handleSubmit}>Submit</button>
                        <button type="button" class="btn btn-primary ml-1"onClick={this.handleShowModal} data-toggle="modal">Get API Request Parameters</button>
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
                            this.state.message === this.messages.SUCCESS ? "emailSentAlert" : "emailSentFailed" }
                                className={
                                    this.state.message === this.messages.SUCCESS ? "alert alert-success" : "alert alert-danger" }
                                role="alert">
                            {`${this.state.message}`}
                        </div>
                        :
                        <div></div>
                    } 
                </div>
                <div class="modal" id="exampleModal" tabindex="-1" data-backdrop="false" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                        <div class="modal-dialog" role="document">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h5 class="modal-title" id="ModalLabel">API Request Parameters</h5>
                                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                        <span aria-hidden="true">&times;</span>
                                    </button>
                                </div>
                                <div class="modal-body text-break">
                                    {this.showAPIParameters()}
                                </div>
                                <div class="modal-footer">
                                    <button type="button" class="btn btn-danger" data-dismiss="modal">Close</button>
                                </div>
                            </div>
                        </div>
                    </div>
                
            </>
        );
    }

    //Create the HTML text inputs for each dynamic value
    createDynamicValueTextFields() {
        let dynamicValueTextInputs = []
        for (var dynamicValue of this.props.dynamicValues ) {
            let textInput = 
                <div key={dynamicValue} className="input-group mb-1">
                    <div className="input-group-prepend dynamic-value-key-container">
                        <span className="ellipsis input-group-text "  id={dynamicValue}>{dynamicValue}</span>
                    </div>
                    <input 
                        type="text" 
                        className="single-email form-control" 
                        aria-label={dynamicValue} 
                        onChange={this.handleInputChange} 
                        required></input>
                </div>
            dynamicValueTextInputs.push(textInput);
        }
        return dynamicValueTextInputs;
    }

    /**
     * Event handler for when the email field is changed
     * @param {event} - event object
     }}
        */
    handleEmailChange(event) {
        this.setState({emailAddress: event.target.value});
    }

    /**
     * Event handler for when the subject line field is changed
     * @param {event} - event object
     }}
        */
    handleSubjectLineChange(event) {
        this.setState({subjectLine: event.target.value});
    }

    /**
     * Event handler for when the text input for each dynamic value is changed
     * @param {event} - event object
     }}
        */
    handleInputChange(event) {
        var dynamicValueName = event.target.getAttribute('aria-label');
        let dynamicValueObject = this.state.dynamicValueObject;
        dynamicValueObject[dynamicValueName] = event.target.value;
        this.setState({dynamicValueObject: dynamicValueObject});
    }

    hasErrors () {
        let dynamicValueInputs = document.getElementsByClassName('single-email');
        let emailAddressInput = document.getElementById('email-address');
        let subjectLineInput = document.getElementById('subject-line');
        let dynamicValueObject = this.state.dynamicValueObject;
        let emptyField = false;
        let incorrectlyFomattedEmail = false;
        let emailContainsWhitespace = false;
        let emailAddress = this.state['emailAddress'];
        let subjectLine = this.state['subjectLine'].trimEnd();

        //Validate Email is of the correct format
        if(this.isEmptyStringOrNull(emailAddress)) {
            emailAddressInput.classList.add("inputError");
            emptyField = true;
        }
        emailAddress = emailAddress.trimEnd();
        if (this.doesEmailContainWhitespace(emailAddress)) {
            emailAddressInput.classList.add("inputError");
            emailContainsWhitespace = true;
        } else if(!this.isEmailCorrectlyFormatted(emailAddress)) {
            emailAddressInput.classList.add("inputError");
            incorrectlyFomattedEmail = true;
        } else {
            emailAddressInput.classList.remove("inputError");
        }

        //Validate Subject Line
        if(this.isEmptyStringOrNull(subjectLine)) {
            subjectLineInput.classList.add("inputError");
            emptyField = true;
        } else {
            subjectLineInput.classList.remove("inputError");
            dynamicValueObject['SUBJECT_LINE'] = this.state.subjectLine;
            this.setState({dynamicValueObject: dynamicValueObject});
        }
        
        //Validate Dynamic Value Inputs are correctly formatted
        for(var input of dynamicValueInputs) {
            var dynamicValue = input.getAttribute("aria-label");
            if(!this.state.dynamicValueObject[dynamicValue] || this.isEmptyStringOrNull(this.state.dynamicValueObject[dynamicValue].trimEnd())) {
                input.classList.add("inputError");
                emptyField = true;
            } else {
                input.classList.remove("inputError");
            }
        }
        
        
        if(emptyField){
            this.setState({ message: this.messages.EMPTY_FIELD });
        } else if(incorrectlyFomattedEmail) {
            this.setState({ message: this.messages.INCORRECT_EMAIL_FORMAT });
        } else if(emailContainsWhitespace) {
            this.setState({ message: this.messages.EMAIL_CONTAINS_WHITESPACE});
        }
        if(!incorrectlyFomattedEmail && !emptyField && !emailContainsWhitespace) {
            console.log(this.state)
            return false
        }
        return true
    }
    handleShowModal() {
        if(!this.hasErrors()) {
            $('#exampleModal').modal('show');
            this.setState({ message: null});
        }
    }

    showAPIParameters() {
        return (
            <span>
                API URL:
                <br/>
                {this.showAPIUrl()}
                <br/><br/>
                Body:
                <br/>
                {this.showBody()}
                <br/><br/>
                Header:
                <br/>
                {this.showHeader()}
            </span>

        )
    }
    showBody() {
        let emailAddress = this.state['emailAddress'];

        var body = {
            emailAddress: emailAddress,
            dynamicValueStrings: JSON.stringify(this.state.dynamicValueObject),
            templateId: this.state.templateName
        };
        return JSON.stringify(body)
    }

    showHeader() {
        return 'x-api-key : 6oyO3enoUI9Uu26ZPtdXNA2YPPCbSWn2cFRrxwRh';
    }

    showAPIUrl() {
        return 'https://962k5qfgt3.execute-api.us-east-1.amazonaws.com/Prod/singleemailcampaign'
    }

    
    handleSubmit() {        
        let emailAddress = this.state['emailAddress'];


        if(!this.hasErrors()) {
            this.setState({message: null});
            let header = { headers: {
                "x-api-key": "6oyO3enoUI9Uu26ZPtdXNA2YPPCbSWn2cFRrxwRh"
            }};
            console.log(this.state.dynamicValueObject)
            let body = {
                emailAddress: emailAddress,
                dynamicValueStrings: JSON.stringify(this.state.dynamicValueObject),
                templateId: this.state.templateName
            };

            this.setState({loading: true});
            sendSingleEmail(header, body).then(response => {
                this.setState({loading: false});
                if(response.status === 200) {
                    this.setState({ message: this.messages.SUCCESS })
                } else {
                    this.setState({ message: this.messages.SINGLE_EMAIL_ERROR + response.data})
                }
            }).catch(error => {
                this.setState({loading: false});
                if(error.response.data.includes("Email address is not verified")) {
                    this.setState({ message: this.messages.EMAIL_NOT_SES_VERIFIED})
                } else {
                    console.log("Single Email Campaign Error: " + error.response);
                    this.setState({ message: this.messages.SINGLE_EMAIL_ERROR})
                }
                    
            })
        }
    }

    isEmailCorrectlyFormatted(email) {
        return email.match(EMAIL_FORMAT_REGEX);
    }

    doesEmailContainWhitespace(email) {
        return email.includes(" ");
    }

    isEmptyStringOrNull(string) {
        return string == null || string === "";
    }
}

export default SingleEmailCampaignCreation;