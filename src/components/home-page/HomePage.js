import React from "react";
import TemplateLogTable from "./TemplateLogTable";
import "../../App.css";
import {Redirect} from "react-router";
import {Link} from "react-router-dom";
import FileUpload from "./file-upload/FileUpload";
import {Auth} from 'aws-amplify';
import LoginPage from "../login/LoginPage";
import Button from "@material-ui/core/Button";

class HomePage extends React.Component {
	constructor(props) {
		super(props);
		this.onUploadSuccess = this.onUploadSuccess.bind(this);
		this.id = 0;
		this.state = {
			authenticated: false
		};

		this.onUploadSuccess = this.onUploadSuccess.bind(this);
	}

	async componentDidMount() {
		await Auth.currentAuthenticatedUser().then(() => {
			this.setState({authenticated: true});
		}).catch((error) => {
			this.setState({authenticated: false});
		});
	}
    
	//If update is successfull update the template log grid
	onUploadSuccess() {
		this.forceUpdate();
	}

	onLogOut = async() => {
		await Auth.signOut();
	}

	redirectToLogin() {
		window.location = "/"
	}

	render() {
			this.id += 1;
			return (this.state.authenticated !== true?
				// <div>Access Denied</div>
				<div>
				<h6 style={{color: 'blue'}}>{"You must be logged in to access this page"}</h6>
					<Button
						type="submit"
						variant="contained"
						color="primary"
						onClick={this.redirectToLogin}
					>
						Login
					</Button>
				</div>
				:
				<div>
				<div className="d-flex justify-content-end">
					<Link
						to={"/"}
						>
						<button className="btn btn-primary mr-1 mt-1" 
							id="logOutButton"
							onClick={this.onLogOut}> 
							Log Out 
						</button>
					</Link>
				</div>
				<div className="container-fluid" >
					<div className="row">
						<div className="col-lg-3">
                    		<FileUpload onUploadSuccess={this.onUploadSuccess}/>
                		</div> 
						<TemplateLogTable id={this.id}/>
					</div>
				</div>
				</div>
			);
	}
}

export default HomePage