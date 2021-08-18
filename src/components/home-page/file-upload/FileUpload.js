import React from "react";
import SubmitTemplate from "./SubmitTemplate";
import RemoveTemplate from "./RemoveTemplate";


class FileUpload extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            setVisible: true
        }
    }


    //Render of File Upload Component
    render() {
        return (
            <div>
                <div class="dropdown text-center">
                    <button class="btn btn-primary dropdown-toggle mt-2" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        Submit/Remove Template
                    </button>
                    <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                        <a class="dropdown-item" onClick={() => this.setState({ setVisible: true })}>Submit Template</a>
                        <a class="dropdown-item" id="RemoveTemplateDropDown" onClick={() => this.setState({ setVisible: false })}>Remove Template</a>
                    </div>
                </div>
                {this.state.setVisible ? <SubmitTemplate onUploadSuccess={this.props.onUploadSuccess} />: <RemoveTemplate onUploadSuccess={this.props.onUploadSuccess}/>}
            </div>
        )
    }
}

export default FileUpload;