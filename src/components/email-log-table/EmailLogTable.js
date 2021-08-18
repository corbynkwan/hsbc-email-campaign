import React from "react";
import axios from 'axios';
import Table from "../Table";
import { Link } from "react-router-dom";
import {Redirect} from "react-router";
import {Auth} from 'aws-amplify';
import Button from "@material-ui/core/Button";


class EmailLogTable extends React.Component {
    constructor(props) {
        super(props);
        this.defaultColumns = ["Message Id", 
                               "Sent Date", 
                               "Email Address", 
                               "Delivery Status", 
                               "Open Status"];
        this.sortableColumns = ["Message Id", 
                               "Sent Date", 
                               "Email Address", 
                               "Delivery Status", 
                               "Open Status",
                               "Has at Least One Embedded Link Been Clicked?"];
        this.state = {
            templateName: false,
            campaignId: false,
            columns: [],
            authenticated: false
        }
        this.state.templateName = this.props.match.params.templateName;
        this.state.campaignId = this.props.match.params.campaignId;

    }

    //Retrieve Email logs from AWS to create a table
    getEmailTableData() {
        var apiString = `https://cif088g5cd.execute-api.us-east-1.amazonaws.com/v1/email-logs?templateId=${this.state.templateName}&campaignId=${this.state.campaignId}`
        
        var config = {
            method: 'get',
            url: apiString,
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': "TKrgRRW19c5YY4DREgvfd3nqD0lZh4RP12KvwQBC"
            }
        };

        axios(config)
            .then(response => {
                let table = this.dataToTable(response.data);
                this.setState({table: table})
            })
            .catch(function (error) {
                console.log("Get Email Data Error:",error);
            });
    }

    async componentDidMount() {
        await Auth.currentAuthenticatedUser().then(() => {
			this.setState({authenticated: true});
            this.getEmailTableData();
		}).catch(() => {
			this.setState({authenticated: false});
		});
    }

    onLogOut = async() => {
		await Auth.signOut();
	}

    redirectToLogin() {
        window.location = "/"
    }

    //Render the email log grid page
    render() {
        let table = this.state.table;
        if (table) {
           this.state.columns = table.columns.map(({title}) => title);
        }
        return (this.state.authenticated !== true? 
				// <div>Access Denied</div>
            <div>
                <h6 style={{color: 'blue'}}>{"You must be logged in to access this page"}</h6>
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    onClick={this.redirectToLogin}
                    center
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
							id='logOutButton' 
							onClick={this.onLogOut}> 
							Log Out 
						</button>
					</Link>
				</div>
                <div className="scroll container-fluid" style={{"max-width": "100%"}}>
                    <div className="float-left col-lg-3 ">
                        <Link 
                            className="btn btn-primary d-block mt-5 ml-5 mr-5 mb-5"
                            role="button"
                            to={{pathname: `/CampaignLogTable/${this.state.templateName}`}}> 
                            {"Return to Campaign Page"}
                        </Link>
                        <Link 
                            className="btn btn-primary d-block mt-5 ml-5 mr-5 mb-5"
                            role="button"
                            id="homepagebutton"
                            to={"/HomePage"}>
                            {"Return to Home Page"}
                        </Link>
                    </div> 
                    <div className="float-right col-lg-9 pl-0 pr-1">
                        <h1 className="mt-2">{`Email logs`}</h1>
                        {table? <Table data={table} 
                        columnsToSort={this.sortableColumns.map((columnTitle) => {
                            return {title: columnTitle}
                        })}/> : 
                        <Table loading={true}/>}
                    </div>
                </div>  
                </div>   
            );    
    }

    //This generates the prop for telling the table which columns should be sortable
    getColumnsToSort() {
        return this.sortableColumns.map((column) => {
            let columnsToSort = {title: column, sort: this.sortableColumns.includes(column)}
            if (column === "Sent Date") {
                columnsToSort["compare"] = function (dateA, dateB) {
                    return new Date(dateA) - new Date(dateB);
                };
            }
            return columnsToSort;
        })
    }

    //Convert response data from /email-logs api to a table
    dataToTable(data) {
        let columnTitles = [
            {displayName:"Message Id", apiName: "MessageId"},
            {displayName:"Sent Date", apiName: "SentDateTime"}, 
            {displayName:"Email Address", apiName: "EmailAddress"}, 
            {displayName:"Delivery Status", apiName: "DeliveryStatus"}, 
            {displayName:"Open Status", apiName: "OpenedStatus"},
            {displayName:"Has at Least One Embedded Link Been Clicked?", apiName: "ClickedLinkStatus"}
        ];
        let table = {columns: []};
        if (data.statusCode === 200) {
            for (let i = 0; i < columnTitles.length; i++) {
                let columnTitle = columnTitles[i];
                table.columns.push({
                    title: columnTitle.displayName,
                    content: this.getContent(columnTitle, data)
                });
            }
        } else {
            console.log("Request failed with " + data.statusCode)
        }
        let messageIdColumn = this.getColumnWithDisplayName("Message Id", table);
        table.numRows = messageIdColumn.content.length;
        return table;
    }

    /**
 	* Get the content of a cell
 	* @param {columnTitle} - string
    * @param {data} - string
 	}}
 	*/
    getContent(columnTitle, data) {
        let content = [];
        for (let row of data.body.Items) {
            switch (columnTitle.displayName) {
                case "Message Id": {
                    content.push(row['MessageId']);
                    break;
                }
                case "Sent Date": {
                    let value = row[columnTitle.apiName];
                    if (value) {
                        let dateObj = new Date(value);
                        var date = dateObj.getDate();
                        var month = dateObj.getMonth() + 1; // Since getMonth() returns month from 0-11 not 1-12
                        var year = dateObj.getFullYear();
                            
                        var dateString = date + "/" + month + "/" + year;
                        content.push(dateString);
                    } else {
                        content.push(" ");
                    }
                    break;
                }
                case "Email Address": {
                    let value = row['EmailAddress'];
                    content.push(value);
                    break;
                }
                case "Delivery Status": {
                    let value = row['DeliveryStatus'].toString();
                    content.push(value);
                    break;
                }
                case "Open Status": {
                    let value = row['OpenedStatus'].toString();
                    content.push(value);
                    break;
                }
                case "Has at Least One Embedded Link Been Clicked?": {
                    let value = row['ClickedLinkStatus'].toString();
                    content.push(value);
                    break;
                }
                default:
                    break;
                }
        }
        return content;
    }

    /**
 	* Get the column data using the display name of the table
 	* @param {displayName} - string
    * @param {table} - Array[Object]
 	}}
 	*/
    getColumnWithDisplayName(displayName, table) {
        for (let column of table.columns) {
            if (column.title === displayName) {
                return column;
            }
        }
    }


}

export default EmailLogTable;
